import { Collection } from "@discordjs/collection";
import { EventEmitter } from "events";
import { SonaticaOptions, SearchQuery, VoicePacket, VoiceServer, VoiceState } from "../types/Sonatica";
import { Node } from "./Node";
import { Player } from "./Player";
import { Redis } from "./database/Redis";
import { Storage } from "./database/Storage";
import { Database } from "./database/Database";
import { PlayerOptions } from "../types/Player";
import { NodeOptions } from "../types/Node";
import { SearchPlatform } from "../utils/sources";
import { PlaylistRawData, SearchResponse, SearchResult, TrackData } from "../types/Rest";
import { TrackUtils } from "../utils/utils";
import { TrackDecoder } from "./TrackDecoder";
import leastLoadNode from "../sorter/leastLoadNode";

/**
 * Class representing the Sonatica music player.
 * @extends EventEmitter
 */
export class Sonatica extends EventEmitter {
	/** @type {Collection<string, Node>} */
	public readonly nodes: Collection<string, Node> = new Collection();
	/** @type {Collection<string, Player>} */
	public readonly players: Collection<string, Player> = new Collection();
	/** @type {Database} */
	public db: Database = null;
	/** @type {SonaticaOptions} */
	public options: SonaticaOptions;

	private initiated: boolean = false;

	/**
	 * Create a Sonatica instance.
	 * @param {SonaticaOptions} options - The options for Sonatica.
	 */
	constructor(options: SonaticaOptions) {
		super();

		Player.init(this);
		Node.init(this);

		this.options = {
			nodes: [],
			autoPlay: true,
			clientName: "Sonatica (https://github.com/Pastel-Dream/sonatica)",
			autoMove: true,
			autoResume: true,
			defaultSearchPlatform: SearchPlatform["youtube music"],
			shards: 0,
			sorter: leastLoadNode,
			...options,
		};

		if (this.options.nodes) {
			for (const nodeOptions of this.options.nodes) new Node(nodeOptions);
		}
	}

	/**
	 * Initialize the Sonatica instance with a client ID.
	 * @param {string} clientId - The client ID.
	 * @returns {Sonatica} The Sonatica instance.
	 * @throws {Error} If the client ID is not provided.
	 */
	public init(clientId: string, customDb?: Database) {
		if (this.initiated) return;
		if (typeof clientId !== "undefined") this.options.clientId = clientId;
		if (typeof this.options.clientId === "undefined") throw new Error("Client ID is required.");
		if (this.options.autoResume) {
			if (customDb) {
				this.db = customDb;
			} else {
				if (this.options.redisUrl) this.db = new Redis(this.options.redisUrl, this.options.clientId, this.options.shards ?? 0);
				else this.db = new Storage(this.options.clientId, this.options.shards ?? 0);
			}
		}

		for (const node of this.nodes.values()) {
			try {
				node.connect();
			} catch (err) {
				this.emit("nodeError", node, err);
			}
		}

		this.initiated = true;
		return this;
	}

	/**
	 * Search for tracks based on a query.
	 * @param {SearchQuery} query - The search query.
	 * @param {unknown} [requester] - The requester of the search.
	 * @returns {Promise<SearchResult>} The search result.
	 * @throws {Error} If the query is not found.
	 */
	public async search(query: SearchQuery, requester?: unknown) {
		const source: SearchPlatform | string = query.source ?? SearchPlatform[this.options.defaultSearchPlatform];
		let search = query.query;
		if (!/^(https?:\/\/)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(query.query)) search = `${source}:${query.query}`;

		const node = this.options
			.sorter(this.nodes)
			.filter((node) => node.options.search)
			.first();

		try {
			const res = <SearchResponse>await node.rest.request("GET", `/loadtracks?identifier=${encodeURIComponent(search)}`);
			if (!res) throw new Error("Query not found.");

			let searchData = [];
			let playlistData: PlaylistRawData | undefined;

			switch (res.loadType) {
				case "search":
					searchData = res.data as TrackData[];
					break;

				case "track":
					searchData = [res.data as TrackData[]];
					break;

				case "playlist":
					playlistData = res.data as PlaylistRawData;
					break;
			}

			// Build the tracks from the search data
			const tracks = searchData.map((track) => TrackUtils.build(track, requester));

			// Build the playlist from the playlist data
			const playlist =
				res.loadType === "playlist"
					? {
							name: playlistData!.info.name,
							tracks: playlistData!.tracks.map((track) => TrackUtils.build(track, requester)),
							duration: playlistData!.tracks.reduce((acc, cur) => acc + (cur.info.length || 0), 0),
							url: playlistData!.pluginInfo.url,
					  }
					: null;

			const result: SearchResult = {
				loadType: res.loadType,
				tracks: tracks || playlistData!.tracks.map((track) => TrackUtils.build(track, requester)),
				playlist,
			};

			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Decode an array of track strings into TrackData objects.
	 * @param {string[]} tracks - The array of track strings.
	 * @returns {Promise<TrackData[]>} The decoded track data.
	 */
	public async decodeTracks(tracks: string[]): Promise<TrackData[]> {
		const decodeds = await Promise.all(
			tracks.map(async (track) => {
				const decoder = new TrackDecoder(track);
				return await decoder.decode();
			})
		);

		const res = decodeds.map((t) => {
			if (t.error) throw t.error;
			return t.track;
		});

		return res;
	}

	/**
	 * Decode a single track string into a TrackData object.
	 * @param {string} track - The track string.
	 * @returns {Promise<TrackData>} The decoded track data.
	 */
	public async decodeTrack(track: string): Promise<TrackData> {
		const res = await this.decodeTracks([track]);
		return res[0];
	}

	/**
	 * Create a new player for a guild.
	 * @param {PlayerOptions} options - The options for the player.
	 * @returns {Player} The created player.
	 */
	public create(options: PlayerOptions) {
		if (this.players.has(options.guild)) return this.players.get(options.guild);
		return new Player(options);
	}

	/**
	 * Get the player for a specific guild.
	 * @param {string} guild - The guild ID.
	 * @returns {Player | undefined} The player for the guild, or undefined if not found.
	 */
	public get(guild: string): Player | undefined {
		return this.players.get(guild);
	}

	/**
	 * Destroy the player for a specific guild.
	 * @param {string} guild - The guild ID.
	 */
	public destroy(guild: string): void {
		this.players.delete(guild);
	}

	/**
	 * Create a new node.
	 * @param {NodeOptions} options - The options for the node.
	 * @returns {Node} The created node.
	 */
	public createNode(options: NodeOptions) {
		if (this.nodes.has(options.identifier)) return this.nodes.get(options.identifier);
		return new Node(options);
	}

	/**
	 * Destroy a node by its identifier.
	 * @param {string} identifier - The identifier of the node.
	 */
	public destroyNode(identifier: string): void {
		const node = this.nodes.get(identifier);
		if (!node) return;
		node.destroy();
		this.nodes.delete(identifier);
	}

	/**
	 * Update the voice state based on the provided payload.
	 * @param {VoicePacket | VoiceState | VoiceServer} payload - The voice state payload.
	 */
	public async updateVoiceState(payload: VoicePacket | VoiceState | VoiceServer) {
		if ("t" in payload && !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(payload.t)) return;
		const voiceState = "d" in payload ? payload.d : payload;
		if (!voiceState || (!("token" in voiceState) && !("session_id" in voiceState))) return;

		const player = this.players.get(voiceState.guild_id);
		if (!player) return;

		if ("token" in voiceState) {
			player.voiceState.event = voiceState;

			await player.node.rest.request("PATCH", `/sessions/${player.node.sessionId}/players/${player.guild}?noReplace=false`, {
				voice: {
					token: voiceState.token,
					endpoint: voiceState.endpoint,
					sessionId: player.voiceState.sessionId,
				},
			});
		} else {
			if (voiceState.user_id !== this.options.clientId) return;

			if (voiceState.channel_id) {
				if (player.voiceChannel !== voiceState.channel_id) this.emit("playerMove", player, player.voiceChannel, voiceState.channel_id);

				player.voiceState.sessionId = voiceState.session_id;
				player.voiceChannel = voiceState.channel_id;
			} else {
				this.emit("playerDisconnect", player, player.voiceChannel);
				player.voiceChannel = null;
				player.voiceState = Object.assign({});
				player.destroy();
			}
		}
	}
}
