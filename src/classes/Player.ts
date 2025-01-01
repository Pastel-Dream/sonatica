import { SearchQuery, VoiceState } from "../types/Sonatica";
import { PlayerOptions, RepeatMode, State, Track, UnresolvedTrack } from "../types/Player";
import { Filters } from "./Filters";
import { Sonatica } from "./Sonatica";
import { Node } from "./Node";
import { Queue } from "./Queue";
import { TrackUtils } from "../utils/utils";

export class Player {
	public readonly queue: Queue = new Queue(this);
	public filters: Filters;
	public repeatMode: RepeatMode = 0;
	public position = 0;
	public playing = false;
	public paused = false;
	public volume: number;
	public isAutoplay: boolean = false;
	public node: Node;
	public guild: string;
	public voiceChannel: string | null = null;
	public textChannel: string | null = null;
	public state: State = "DISCONNECTED";
	public bands = new Array<number>(15).fill(0.0);
	public voiceState: VoiceState;
	public sonatica: Sonatica;
	private static _sonatica: Sonatica;
	public readonly data: Record<string, unknown> = {};

	public set(key: string, value: unknown): void {
		this.data[key] = value;
		this.save();
	}

	public get<T>(key: string): T {
		return this.data[key] as T;
	}

	public static init(sonatica: Sonatica): void {
		this._sonatica = sonatica as Sonatica;
	}

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
		this.filters = new Filters(this);
	}

	public search(query: SearchQuery, requester?: unknown) {
		return this.sonatica.search(query, requester);
	}

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

	public async destroy(disconnect: boolean = true): Promise<void> {
		this.state = "DESTROYING";

		if (disconnect) this.disconnect();

		await this.node.rest.request("DELETE", `/sessions/${this.node.sessionId}/players/${this.guild}`);
		this.sonatica.emit("playerDestroy", this);
		this.sonatica.players.delete(this.guild);
		if (this.sonatica.options.redisUrl && this.sonatica.options.autoResume) await this.sonatica.db.delete(`players.${this.guild}`);
	}

	public setVoiceChannel(channel: string): this {
		if (typeof channel !== "string") throw new TypeError("Channel must be a non-empty string.");

		this.voiceChannel = channel;
		this.connect();
		return this;
	}

	public setTextChannel(channel: string): this {
		if (typeof channel !== "string") throw new TypeError("Channel must be a non-empty string.");

		this.textChannel = channel;
		return this;
	}

	public async setVolume(volume: number): Promise<this> {
		if (isNaN(volume)) throw new TypeError("Volume must be a number.");

		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, { volume });
		this.volume = volume;
		return this;
	}

	public setAutoplay(state: boolean): this {
		if (typeof state !== "boolean") {
			throw new TypeError('state must be a "true" or "false".');
		}

		this.isAutoplay = state;
		return this;
	}

	public setRepeat(mode: RepeatMode): this {
		if (typeof mode !== "number") {
			throw new TypeError("mode must be a number.");
		}

		this.repeatMode = mode;
		return this;
	}

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
			position = fetchedPlayer.track.info.position;
		}

		await destinationNode.rest.request("PATCH", `/sessions/${destinationNode.sessionId}/players/${this.guild}?noReplace=false`, {
			track: { encoded: this.queue.current?.track, userData: this.queue.current?.requester },
			position: position,
			volume: this.volume,
			paused: this.paused,
			filters: {
				distortion: this.filters.distortion,
				equalizer: this.filters.equalizer,
				karaoke: this.filters.karaoke,
				rotation: this.filters.rotation,
				timescale: this.filters.timescale,
				vibrato: this.filters.vibrato,
				volume: this.filters.volume,
			},
			voice: {
				token: this.voiceState.event.token,
				endpoint: this.voiceState.event.endpoint,
				sessionId: this!.voiceState?.sessionId!,
			},
		});

		this.node = destinationNode;
		destroyOldNode(currentNode);

		return this;
	}

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

	public async skip() {
		if (!this.queue.length) return this.stop();

		this.queue.previous = this.queue.current;
		this.queue.current = this.queue.shift();
		this.position = 0;
		return await this.play();
	}

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

	public async pause(paused: boolean) {
		await this.node.rest.request("PATCH", `/sessions/${this.node.sessionId}/players/${this.guild}?noReplace=false`, { paused: paused });
		return this;
	}

	public async previous() {
		this.queue.unshift(this.queue.previous);
		await this.stop();

		return this;
	}

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

	public save() {
		if (!this.sonatica.options.autoResume || !this.sonatica.options.redisUrl) return;

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
