import { SearchQuery, VoiceState } from "../types/Sonatica";
import { PlayerOptions, RepeatMode, State, Track, UnresolvedTrack } from "../types/Player";
import { Filters } from "./Filters";
import { Sonatica } from "./Sonatica";
import { Node } from "./Node";
import { Queue } from "./Queue";
import { TrackUtils } from "../utils/utils";
import { Lyrics } from "./Lyrics";

/**
 * Represents a music player for a specific guild.
 */
export class Player {
	/** The queue of tracks for the player. */
	public readonly queue: Queue = new Queue(this);
	/** The filters applied to the audio. */
	public filters: Filters;
	/** The repeat mode of the player. */
	public repeatMode: RepeatMode = 0;
	/** The current position of the track being played. */
	public position = 0;
	/** Indicates if the player is currently playing. */
	public playing = false;
	/** Indicates if the player is paused. */
	public paused = false;
	/** The volume level of the player. */
	public volume: number;
	/** Indicates if autoplay is enabled. */
	public isAutoplay: boolean = false;
	/** The node associated with the player. */
	public node: Node;
	/** The lyrics object associated with the player. */
	public lyrics: Lyrics;
	/** The guild ID associated with the player. */
	public guild: string;
	/** The voice channel ID the player is connected to. */
	public voiceChannel: string | null = null;
	/** The text channel ID associated with the player. */
	public textChannel: string | null = null;
	/** The current state of the player. */
	public state: State = "DISCONNECTED";
	/** The audio bands for equalization. */
	public bands = new Array<number>(15).fill(0.0);
	/** The voice state of the player. */
	public voiceState: VoiceState;
	/** The Sonatica instance associated with the player. */
	public sonatica: Sonatica;
	private static _sonatica: Sonatica;
	/** Additional data associated with the player. */
	public readonly data: Record<string, unknown> = {};

	/**
	 * Sets a value in the player's data.
	 * @param key - The key of the data to set.
	 * @param value - The value to set.
	 */
	public set(key: string, value: unknown): void {
		this.data[key] = value;
		this.save();
	}

	/**
	 * Gets a value from the player's data.
	 * @param key - The key of the data to get.
	 * @returns The value associated with the key.
	 */
	public get<T>(key: string): T {
		return this.data[key] as T;
	}

	/**
	 * Initializes the player with a Sonatica instance.
	 * @param sonatica - The Sonatica instance to associate with the player.
	 */
	public static init(sonatica: Sonatica): void {
		this._sonatica = sonatica as Sonatica;
	}

	/**
	 * Creates an instance of the Player.
	 * @param options - The options for the player.
	 */
	constructor(public options: PlayerOptions) {
		if (!this.sonatica) this.sonatica = Player._sonatica;
		if (this.sonatica.players.has(options.guild)) return this.sonatica.players.get(options.guild);

		this.guild = options.guild;
		this.data = options.data ?? {};
		this.voiceState = Object.assign({ op: "voiceUpdate", guild_id: options.guild });
		if (options.voiceChannel) this.voiceChannel = options.voiceChannel;
		if (options.textChannel) this.textChannel = options.textChannel;
		const node = this.sonatica.nodes.get(options.node);
		this.node =
			node ||
			this.sonatica.options
				.sorter(this.sonatica.nodes)
				.filter((node) => node.options.playback)
				.first();
		this.sonatica.players.set(this.guild, this);
		this.sonatica.emit("playerCreate", this);
		this.volume = options.volume ?? 80;
		this.lyrics = new Lyrics(this);
		this.filters = new Filters(this);
	}

	/**
	 * Searches for tracks based on a query.
	 * @param query - The search query.
	 * @param requester - The requester of the search.
	 * @returns The search results.
	 */
	public search(query: SearchQuery, requester?: unknown) {
		return this.sonatica.search(query, requester);
	}

	/**
	 * Connects the player to a voice channel.
	 * @returns The player instance.
	 * @throws {RangeError} If no voice channel has been set.
	 */
	public connect() {
		if (!this.voiceChannel) throw new RangeError("No voice channel has been set.");
		this.state = "CONNECTING";
		this.sonatica.options.send(this.guild, {
			op: 4,
			d: {
				guild_id: this.guild,
				channel_id: this.voiceChannel,
				self_mute: this.options.selfMute || false,
				self_deaf: this.options.selfDeafen || false,
			},
		});
		this.state = "CONNECTED";
		return this;
	}

	/**
	 * Disconnects the player from the voice channel.
	 * @returns The player instance.
	 */
	public disconnect(): this {
		if (this.voiceChannel === null) return this;
		this.state = "DISCONNECTING";

		this.sonatica.options.send(this.guild, {
			op: 4,
			d: {
				guild_id: this.guild,
				channel_id: null,
				self_mute: false,
				self_deaf: false,
			},
		});

		this.voiceChannel = null;
		this.state = "DISCONNECTED";
		return this;
	}

	/**
	 * Destroys the player and cleans up resources.
	 * @param disconnect - Whether to disconnect the player before destroying.
	 */
	public async destroy(disconnect: boolean = true): Promise<void> {
		this.state = "DESTROYING";

		if (disconnect) this.disconnect();

		await this.node.rest.request("DELETE", `/sessions/${this.node.sessionId}/players/${this.guild}`);
		this.sonatica.emit("playerDestroy", this);
		this.sonatica.players.delete(this.guild);
		if (this.sonatica.db && this.sonatica.options.autoResume) await this.sonatica.db.delete(`players.${this.guild}`);
	}

	/**
	 * Sets the voice channel for the player.
	 * @param channel - The ID of the voice channel.
	 * @returns The player instance.
	 * @throws {TypeError} If the channel is not a string.
	 */
	public setVoiceChannel(channel: string): this {
		if (typeof channel !== "string") throw new TypeError("Channel must be a non-empty string.");

		this.voiceChannel = channel;
		this.connect();
		return this;
	}

	/**
	 * Sets the text channel for the player.
	 * @param channel - The ID of the text channel.
	 * @returns The player instance.
	 * @throws {TypeError} If the channel is not a string.
	 */
	public setTextChannel(channel: string): this {
		if (typeof channel !== "string") throw new TypeError("Channel must be a non-empty string.");

		this.textChannel = channel;
		return this;
	}

	/**
	 * Sets the volume of the player.
	 * @param volume - The volume level to set.
	 * @returns The player instance.
	 * @throws {TypeError} If the volume is not a number.
	 */
	public async setVolume(volume: number): Promise<this> {
		if (isNaN(volume)) throw new TypeError("Volume must be a number.");

		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, { volume });
		this.volume = volume;
		return this;
	}

	/**
	 * Sets the autoplay state of the player.
	 * @param state - The autoplay state to set.
	 * @returns The player instance.
	 * @throws {TypeError} If the state is not a boolean.
	 */
	public setAutoplay(state: boolean): this {
		if (typeof state !== "boolean") {
			throw new TypeError('state must be a "true" or "false".');
		}

		this.isAutoplay = state;
		return this;
	}

	/**
	 * Sets the repeat mode of the player.
	 * @param mode - The repeat mode to set.
	 * @returns The player instance.
	 * @throws {TypeError} If the mode is not a number.
	 */
	public setRepeat(mode: RepeatMode): this {
		if (typeof mode !== "number") {
			throw new TypeError("mode must be a number.");
		}

		this.repeatMode = mode;
		return this;
	}

	/**
	 * Moves the player to a different node.
	 * @param node - The identifier of the node to move to.
	 * @returns The player instance.
	 * @throws {RangeError} If no nodes are available.
	 */
	public async moveNode(node?: string) {
		if (!node)
			node = this.sonatica.options
				.sorter(this.sonatica.nodes)
				.filter((node) => node.options.playback)
				.first()?.options.identifier;
		if (!node || !this.sonatica.nodes.get(node)) throw new RangeError("No nodes are available.");

		if (this.node.options.identifier === node) return this;
		const destroyOldNode = async (node: Node) => {
			this.state = "MOVING";

			if (this.sonatica.nodes.get(node.options.identifier) && this.sonatica.nodes.get(node.options.identifier).connected)
				await node.rest.request("DELETE", `/sessions/${node.sessionId}/players/${this.guild}`);

			setTimeout(() => (this.state = "CONNECTED"), 5000);
		};

		const currentNode = this.node;
		const destinationNode = this.sonatica.nodes.get(node);
		let position = this.position;

		if (currentNode.connected) {
			const fetchedPlayer: any = await currentNode.rest.request("GET", `/sessions/${currentNode.sessionId}/players/${this.guild}`);
			position = fetchedPlayer?.track?.info?.position || this?.position || 0;
		}

		await destinationNode.rest.request("PATCH", `/sessions/${destinationNode.sessionId}/players/${this.guild}?noReplace=false`, {
			track: { encoded: this?.queue?.current?.track, userData: this?.queue?.current?.requester },
			position: position,
			volume: this?.volume,
			paused: this?.paused,
			filters: {
				distortion: this?.filters?.distortion,
				equalizer: this?.filters?.equalizer,
				karaoke: this?.filters?.karaoke,
				rotation: this?.filters?.rotation,
				timescale: this?.filters?.timescale,
				vibrato: this?.filters?.vibrato,
				volume: this?.filters?.volume,
			},
			voice: {
				token: this?.voiceState?.event?.token,
				endpoint: this?.voiceState?.event?.endpoint,
				sessionId: this?.voiceState?.sessionId,
			},
		});

		this.node = destinationNode;
		this.sonatica.emit("nodeSwitch", this, currentNode, destinationNode);
		destroyOldNode(currentNode);

		return this;
	}

	/**
	 * Plays a track in the player.
	 * @param track - The track to play.
	 * @returns A promise that resolves when the track starts playing.
	 * @throws {RangeError} If no current track is set.
	 */
	public async play(track?: Track | UnresolvedTrack): Promise<void> {
		if (typeof track !== "undefined" && TrackUtils.validate(track)) {
			if (this.queue.current) this.queue.previous = this.queue.current;
			this.queue.current = track;
		}

		if (!this.queue.current) throw new RangeError("No current track.");

		if (TrackUtils.isUnresolvedTrack(this.queue.current)) {
			try {
				this.queue.current = await TrackUtils.getClosestTrack(this.queue.current as UnresolvedTrack);
			} catch (error) {
				this.sonatica.emit("trackError", this, this.queue.current, error);
				if (this.queue[0]) return this.play(this.queue[0]);
				return;
			}
		}

		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, {
			track: {
				encoded: this.queue.current.track,
				userData: this.queue.current.requester,
			},
			position: this.position,
			endTime: null,
			volume: this.volume,
			filters: {
				distortion: this.filters.distortion,
				equalizer: this.filters.equalizer,
				karaoke: this.filters.karaoke,
				rotation: this.filters.rotation,
				timescale: this.filters.timescale,
				vibrato: this.filters.vibrato,
				volume: this.filters.volume,
			},
			paused: this.paused,
		});

		this.save();
		this.position = 0;
		this.playing = true;
	}

	/**
	 * Skips to the next track in the queue.
	 * @returns A promise that resolves when the next track starts playing.
	 */
	public async skip() {
		if (!this.queue.length) return this.stop();

		this.queue.previous = this.queue.current;
		this.queue.current = this.queue.shift();
		this.position = 0;
		return await this.play();
	}

	/**
	 * Stops the current track.
	 * @param amount - The number of tracks to skip.
	 * @returns The player instance.
	 */
	public async stop(amount?: number) {
		if (typeof amount === "number" && amount > 1) {
			if (amount > this.queue.length) throw new RangeError("Cannot skip more than the queue length.");
			this.queue.splice(0, amount - 1);
		}

		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, {
			track: { encoded: null },
		});

		return this;
	}

	/**
	 * Pauses or resumes the current track.
	 * @param paused - Whether to pause the track.
	 * @returns The player instance.
	 */
	public async pause(paused: boolean) {
		if (typeof paused !== "boolean") throw new TypeError("Paused must be a boolean.");
		if (paused === this.paused) return this;
		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, { paused: paused });
		this.playing = !paused;
		this.paused = paused;
		return this;
	}

	/**
	 * Plays the previous track in the queue.
	 * @returns The player instance.
	 */
	public async previous() {
		this.queue.unshift(this.queue.previous);
		await this.stop();

		return this;
	}

	/**
	 * Seeks to a specific position in the current track.
	 * @param position - The position to seek to.
	 * @returns The player instance.
	 */
	public async seek(position: number) {
		if (!this.queue.current) return undefined;
		position = Number(position);

		if (isNaN(position)) {
			throw new TypeError("Position must be a number.");
		}

		if (position < 0 || position > this.queue.current.duration) position = Math.max(Math.min(position, this.queue.current.duration), 0);
		this.position = position;
		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, { position: position });
		return this;
	}

	/**
	 * Saves the current state of the player to the database.
	 */
	public save() {
		if (!this.sonatica.options.autoResume || !this.sonatica.db) return;

		this.sonatica.db.set(`players.${this.guild}`, {
			guild: this.guild,
			voiceChannel: this.voiceChannel,
			textChannel: this.textChannel,
			volume: this.volume,
			data: this.data,
			selfDeafen: this.options.selfDeafen,
			selfMute: this.options.selfMute,
			repeatMode: this.repeatMode,
			isAutoplay: this.isAutoplay,
			current: this.queue.current ? this.queue.current.track : null,
			queue: this.queue.map((track) => track.track),
			requester: this.queue.current?.requester,
		});
	}
}
