import { WebSocket } from "ws";
import { NodeInfo, NodeOptions, NodeStats } from "../types/Node";
import { Sonatica } from "./Sonatica";
import { Rest } from "./Rest";
import { EventOp, LyricsFoundEvent, LyricsLineEvent, LyricsNotFoundEvent, Ops, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from "../types/Op";
import { RestPlayer, PreviousPlayer, TrackData, SearchResult } from "../types/Rest";
import { Player } from "./Player";
import { RepeatMode, UnresolvedTrack, Track } from "../types/Player";
import { TrackUtils } from "../utils/utils";
import { SearchPlatform } from "../utils/sources";

/**
 * Represents a Node in the Sonatica system.
 */
export class Node {
	private static _sonatica: Sonatica;
	public isEnabled: boolean = true;
	public rest: Rest;
	public sessionId: string;
	public sonatica: Sonatica;
	public ws: WebSocket;
	public info: NodeInfo = {
		version: {
			semver: "",
			major: 0,
			minor: 0,
			patch: 0,
			preRelease: false,
		},
		buildTime: 0,
		filters: [],
		git: { branch: "", commit: "", commitTime: 0 },
		jvm: "0",
		lavaplayer: "0",
		plugins: [],
		sourceManagers: [],
	};
	public stats: NodeStats = {
		players: 0,
		playingPlayers: 0,
		uptime: 0,
		cpu: {
			cores: 0,
			lavalinkLoad: 0,
			systemLoad: 0,
		},
		frameStats: {
			deficit: 0,
			nulled: 0,
			sent: 0,
		},
		memory: {
			allocated: 0,
			free: 0,
			reservable: 0,
			used: 0,
		},
	};

	private reconnectTimeout?: NodeJS.Timeout;
	private reconnectAttempts: number = 1;
	private lastestOp: number = 0;

	/**
	 * Checks if the node is connected.
	 * @returns {boolean} True if connected, otherwise false.
	 */
	public get connected(): boolean {
		if (!this.ws) return false;
		return this.ws.readyState === 1;
	}

	/**
	 * Gets the address of the node.
	 * @returns {string} The address of the node.
	 */
	public get address(): string {
		return `${this.options.host}:${this.options.port}`;
	}

	/**
	 * Initializes the Node with a Sonatica instance.
	 * @param {Sonatica} sonatica - The Sonatica instance to initialize with.
	 */
	public static init(sonatica: Sonatica): void {
		this._sonatica = sonatica;
	}

	/**
	 * Creates an instance of the Node.
	 * @param {NodeOptions} options - The options for the Node.
	 */
	constructor(public options: NodeOptions) {
		if (!this.sonatica) this.sonatica = Node._sonatica;
		if (!this.sonatica) throw new Error("Sonatica is not initialized.");
		if (this.sonatica.nodes.has(options.identifier)) return this.sonatica.nodes.get(options.identifier);

		this.options = {
			identifier: "localhost",
			host: "localhost",
			password: "youshallnotpass",
			playback: true,
			port: 2333,
			retryAmount: Infinity,
			search: true,
			requestTimeout: 5000,
			retryDelay: 2500,
			secure: false,
			...options,
		};

		if (this.options.port === 443) this.options.secure = true;
		if (!this.options.identifier) this.options.identifier = this.options.host;

		this.sonatica.nodes.set(this.options.identifier, this);
		this.sonatica.emit("nodeCreate", this);
		this.rest = new Rest(this);
	}

	/**
	 * Connects the Node to the WebSocket server.
	 */
	public async connect() {
		if (this.connected) return;

		const headers = Object.assign({
			Authorization: this.options.password,
			"User-Id": this.sonatica.options.clientId,
			"Client-Name": this.sonatica.options.clientName,
		});

		if (this.sonatica.options.autoResume && this.sonatica.db) {
			const sessionId = await this.sonatica.db.get(`sessions.${this.options.identifier ?? this.options.host.replace(/\./g, "-")}`);
			headers["Session-Id"] = sessionId;
		}

		this.ws = new WebSocket(`ws${this.options.secure ? "s" : ""}://${this.address}/v4/websocket`, { headers });
		this.ws.on("open", this.open.bind(this));
		this.ws.on("close", this.close.bind(this));
		this.ws.on("message", this.message.bind(this));
		this.ws.on("error", this.error.bind(this));
	}

	/**
	 * Handles the WebSocket connection opening.
	 */
	protected async open() {
		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
		this.sonatica.emit("nodeConnect", this);

		this.info = <NodeInfo>await this.rest.request("GET", "/info");
	}

	/**
	 * Handles the WebSocket connection closing.
	 * @param {number} code - The close code.
	 * @param {string} reason - The reason for closing.
	 */
	protected close(code: number, reason: string) {
		this.sonatica.emit("nodeDisconnect", this, { code, reason });
		if (code !== 1000 || reason !== "destroy") this.reconnect();

		Array.from(this.sonatica.players.values())
			.filter((p) => p?.node?.options?.identifier === this?.options?.identifier)
			.forEach((p) => {
				if (!this.sonatica.options.autoMove) {
					p.playing = false;
					return;
				}

				const connectedNodes = Array.from(this.sonatica.nodes.values()).filter((n) => n.connected);
				if (connectedNodes.length === 0) {
					p.playing = false;
					return;
				}

				p.moveNode();
			});
	}

	/**
	 * Handles WebSocket errors.
	 * @param {Error} error - The error that occurred.
	 */
	protected error(error: Error): void {
		if (!error) return;
		this.sonatica.emit("nodeError", this, error);
	}

	/**
	 * Handles incoming WebSocket messages.
	 * @param {Buffer | string} d - The data received.
	 */
	protected async message(d: Buffer | string) {
		if (Array.isArray(d)) d = Buffer.concat(d);
		else if (d instanceof ArrayBuffer) d = Buffer.from(d);

		const payload = JSON.parse(d.toString()) as Ops;

		if (!payload.op) return;

		this.sonatica.emit("nodeRaw", this, payload);
		this.lastestOp = Date.now();

		switch (payload.op) {
			case "stats":
				{
					delete payload.op;
					this.stats = payload;
				}
				break;
			case "playerUpdate":
				{
					const player = this.sonatica.players.get(payload.guildId);
					if (player) player.position = payload.state.position || 0;

					this.sonatica.emit("playerUpdate", player, payload);
				}
				break;
			case "ready":
				{
					this.sessionId = payload.sessionId;

					if (!this.sonatica.options.autoResume || !this.sonatica.db) return;
					await this.rest.request("PATCH", `/sessions/${this.sessionId}`, { resuming: true, timeout: 360 });
					const identifier = this.options.identifier ?? this.options.host.replace(/\./g, "-");
					await this.sonatica.db.set(`sessions.${identifier}`, this.sessionId);

					const resumedPlayers = <RestPlayer[]>await this.rest.request("GET", `/sessions/${this.sessionId}/players`);
					for (const resumedPlayer of resumedPlayers) {
						if (this.sonatica.players.get(resumedPlayer.guildId)) return;
						const previousPlayer: PreviousPlayer = (await this.sonatica.db.get(`players.${resumedPlayer.guildId}`)) || Object.assign({});

						if (!previousPlayer.guild || !previousPlayer.voiceChannel || !previousPlayer.textChannel) return this.sonatica.db.delete(`players.${resumedPlayer.guildId}`);
						const player = this.sonatica.create({
							guild: previousPlayer.guild,
							textChannel: previousPlayer.textChannel,
							voiceChannel: previousPlayer.voiceChannel,
							volume: previousPlayer.volume,
							selfDeafen: previousPlayer.selfDeafen,
							selfMute: previousPlayer.selfMute,
							data: previousPlayer.data,
							node: this.options.identifier,
						});

						if (!previousPlayer.current) return;
						player.state = "RESUMING";

						const decoded = <TrackData[]>await this.sonatica.decodeTracks(previousPlayer.queue.map((t) => t).concat(previousPlayer.current));
						player.queue.add(TrackUtils.build(decoded.find((t) => t.encoded === previousPlayer.current, previousPlayer.requester)));
						const queue = decoded.filter((t) => t.encoded !== previousPlayer.current).map((t) => TrackUtils.build(t, previousPlayer.requester));
						if (previousPlayer.queue.length > 0) player.queue.add(queue);

						player.setRepeat(previousPlayer.repeatMode);
						player.filters.distortion = resumedPlayer.filters.distortion;
						player.filters.equalizer = resumedPlayer.filters.equalizer;
						player.filters.karaoke = resumedPlayer.filters.karaoke;
						player.filters.rotation = resumedPlayer.filters.rotation;
						player.filters.timescale = resumedPlayer.filters.timescale;
						player.filters.vibrato = resumedPlayer.filters.vibrato;
						player.filters.volume = resumedPlayer.filters.volume;
						player.volume = resumedPlayer.volume;
						player.position = resumedPlayer.state.position;
						player.connect();

						if (!resumedPlayer.track) {
							if (queue.length > 0) {
								player.skip();
							} else {
								player.destroy();
								this.sonatica.emit("queueEnd", player, <Track>player.queue.current, null);
								return;
							}
						}

						player.playing = true;
						this.sonatica.emit("trackStart", player, <Track>player.queue.current);
					}

					if (this.reconnectAttempts !== 1) {
						Array.from(this.sonatica.players.values())
							.filter((p) => p?.node?.options?.identifier === this?.options?.identifier)
							.forEach(async (p) => {
								const player = this.sonatica.players.get(p.guild);
								if (!player) return;

								await this.rest.request("PATCH", `/sessions/${this.sessionId}/players/${player.guild}?noReplace=false`, {
									voice: {
										token: player.voiceState.event.token,
										endpoint: player.voiceState.event.endpoint,
										sessionId: player.voiceState?.sessionId!,
									},
								});

								await player.play();
							});
					}
				}
				break;
			case "event":
				this.handleOp(payload);
				break;
		}
	}

	/**
	 * Handles different types of events received from the WebSocket.
	 * @param {EventOp} payload - The event payload.
	 */
	protected handleOp(payload: EventOp) {
		if (!payload.guildId) return;
		const player = this.sonatica.players.get(payload.guildId);
		if (!player) return;

		const track = player.queue.current;
		switch (payload.type) {
			case "TrackStartEvent":
				this.trackStart(player, <Track>track, payload);
				break;
			case "TrackStuckEvent":
				player.position = 0;
				this.trackStuck(player, <Track>track, payload);
				break;
			case "TrackExceptionEvent":
				player.position = 0;
				this.trackError(player, <Track>track, payload);
				break;
			case "WebSocketClosedEvent":
				player.position = 0;
				this.socketClosed(player, payload);
				break;
			case "TrackEndEvent":
				player.save();
				player.position = 0;
				this.trackEnd(player, <Track>track, payload);
				break;
			case "LyricsFoundEvent":
				this.lyricsFound(player, <Track>track, payload);
				break;
			case "LyricsNotFoundEvent":
				this.lyricsNotFound(player, <Track>track, payload);
				break;
			case "LyricsLineEvent":
				this.lyricsLine(player, <Track>track, payload);
				break;
		}
	}

	/**
	 * Handles the start of a track.
	 * @param {Player} player - The player that is playing the track.
	 * @param {Track} track - The track that started playing.
	 * @param {TrackStartEvent} payload - The event payload.
	 */
	protected trackStart(player: Player, track: Track, payload: TrackStartEvent) {
		player.playing = true;
		player.paused = false;
		this.sonatica.emit("trackStart", player, track);
	}

	/**
	 * Handles the end of a track.
	 * @param {Player} player - The player that was playing the track.
	 * @param {Track} track - The track that ended.
	 * @param {TrackEndEvent} payload - The event payload.
	 */
	protected trackEnd(player: Player, track: Track, payload: TrackEndEvent) {
		if (player.state === "MOVING" || player.state === "RESUMING") return;

		const { reason } = payload;
		const { queue, repeatMode } = player;
		const { autoPlay } = this.sonatica.options;

		switch (reason) {
			case "loadFailed":
			case "cleanup":
				{
					queue.previous = queue.current;
					queue.current = queue.shift();
					if (!queue.current) return this.queueEnd(player, track, payload);

					this.sonatica.emit("trackEnd", player, track);
					if (autoPlay) player.play();
				}
				break;

			case "replaced":
				{
					this.sonatica.emit("trackEnd", player, track);
					queue.previous = queue.current;
				}
				break;

			default:
				{
					if (track && (repeatMode === RepeatMode.TRACK || repeatMode === RepeatMode.QUEUE)) {
						if (repeatMode === RepeatMode.TRACK) {
							queue.unshift(queue.current);
						} else if (repeatMode === RepeatMode.QUEUE) {
							queue.add(queue.current);
						}

						queue.previous = queue.current;
						queue.current = queue.shift();

						this.sonatica.emit("trackEnd", player, track);
						if (reason === "stopped" && !(queue.current = queue.shift())) return this.queueEnd(player, track, payload);

						if (autoPlay) player.play();
					} else if (queue.length) {
						queue.previous = queue.current;
						queue.current = queue.shift();
						this.sonatica.emit("trackEnd", player, track);
						if (autoPlay) player.play();
					} else {
						this.queueEnd(player, track, payload);
					}
				}
				break;
		}
	}

	/**
	 * Handles a track being stuck.
	 * @param {Player} player - The player that is playing the track.
	 * @param {Track} track - The track that is stuck.
	 * @param {TrackStuckEvent} payload - The event payload.
	 */
	protected trackStuck(player: Player, track: Track, payload: TrackStuckEvent): void {
		this.sonatica.emit("trackStuck", player, track, payload);
	}

	/**
	 * Handles a track error.
	 * @param {Player} player - The player that encountered the error.
	 * @param {Track | UnresolvedTrack} track - The track that encountered the error.
	 * @param {TrackExceptionEvent} payload - The event payload.
	 */
	protected trackError(player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent): void {
		this.sonatica.emit("trackError", player, <Track>track, payload);
	}

	/**
	 * Handles a WebSocket closure.
	 * @param {Player} player - The player that was affected.
	 * @param {WebSocketClosedEvent} payload - The event payload.
	 */
	protected socketClosed(player: Player, payload: WebSocketClosedEvent): void {
		this.sonatica.emit("socketClosed", player, payload);
	}

	/**
	 * Handles a "LyricsFoundEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that received the lyrics.
	 * @param {LyricsFoundEvent} payload - The event payload.
	 */
	protected lyricsFound(player: Player, track: Track, payload: LyricsFoundEvent): void {
		this.sonatica.emit("lyricsFound", player, track, payload);
	}

	/**
	 * Handles a "LyricsNotFoundEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that did not receive the lyrics.
	 * @param {LyricsNotFoundEvent} payload - The event payload.
	 */
	protected lyricsNotFound(player: Player, track: Track, payload: LyricsNotFoundEvent): void {
		this.sonatica.emit("lyricsNotFound", player, track, payload);
	}

	/**
	 * Handles a "LyricsLineEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that received the lyrics line.
	 * @param {LyricsLineEvent} payload - The event payload.
	 */
	protected lyricsLine(player: Player, track: Track, payload: LyricsLineEvent): void {
		this.sonatica.emit("lyricsLine", player, track, payload);
	}

	/**
	 * Handles the end of a queue.
	 * @param {Player} player - The player that was playing.
	 * @param {Track} track - The last track that was played.
	 * @param {TrackEndEvent} payload - The event payload.
	 */
	protected async queueEnd(player: Player, track: Track, payload: TrackEndEvent): Promise<void> {
		player.queue.current = null;
		player.playing = player.isAutoplay;

		if (player.isAutoplay) return await this.handleAutoplay(player, track);

		this.sonatica.emit("queueEnd", player, track, payload);
	}

	/**
	 * Attempts to reconnect the Node.
	 */
	private reconnect() {
		this.reconnectTimeout = setTimeout(() => {
			if (this.reconnectAttempts >= this.options.retryAmount) {
				const error = new Error(`Unable to connect after ${this.options.retryAmount} attempts.`);
				this.sonatica.emit("nodeError", this, error);
				return this.destroy();
			}

			this.ws?.removeAllListeners();
			this.ws = null;
			this.sonatica.emit("nodeReconnect", this);
			this.connect();
			this.reconnectAttempts++;
		}, this.options.retryDelay);
	}

	/**
	 * Enables or disables the Node.
	 * @param {boolean} enabled - True to enable, false to disable.
	 */
	public setEnabled(enabled: boolean) {
		this.isEnabled = enabled;
	}

	/**
	 * Destroys the Node and cleans up resources.
	 */
	public destroy() {
		if (!this.connected) return;
		const players = Array.from(this.sonatica.players.values()).filter((p) => p?.node?.options?.identifier === this?.options?.identifier);
		if (players.length) {
			players.forEach((p) => {
				if (this.sonatica.options.autoMove) {
					p.moveNode();
				} else {
					p.destroy();
				}
			});
		}

		this.ws?.close(1000, "destroy");
		this.ws?.removeAllListeners();
		this.ws = null;
		this.reconnectAttempts = 1;
		clearTimeout(this.reconnectTimeout);
		this.sonatica.emit("nodeDestroy", this);
		this.sonatica.destroyNode(this.options.identifier);
	}

	/**
	 * Handles autoplay for the player.
	 * @param {Player} player - The player that is autoplaying.
	 * @param {Track | UnresolvedTrack} track - The track that is currently playing.
	 * @returns {Promise<void>} A promise that resolves when the autoplay is handled.
	 */
	private async handleAutoplay(player: Player, track: Track | UnresolvedTrack): Promise<void> {
		const fallbackVideo = "H58vbez_m4E";
		const getMixUrl = (id: string) => `https://www.youtube.com/watch?v=${id}&list=RD${id}`;

		const previousTrack = player.queue.previous || track;
		let identifier = previousTrack.sourceName === "youtube" ? previousTrack.identifier : null;

		if (!identifier) {
			const baseSearch = await player.search({ query: `${previousTrack.title} - ${previousTrack.author}`, source: SearchPlatform["youtube"] }, previousTrack.requester);
			identifier = baseSearch.tracks[0]?.identifier;
		}

		if (!identifier) identifier = fallbackVideo;

		const mixUrl = getMixUrl(identifier);
		let mixResult = await player.search({ query: mixUrl }, previousTrack.requester);

		if (mixResult.loadType === "error" || mixResult.loadType === "empty") {
			const fallbackMixUrl = getMixUrl(fallbackVideo);
			mixResult = await player.search({ query: fallbackMixUrl }, previousTrack.requester);
		}

		const tracks = mixResult?.playlist?.tracks?.filter((t) => t.uri !== track.uri);
		if (!tracks?.length) return;

		const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
		player.queue.add(randomTrack);
		player.play();
	}
}
