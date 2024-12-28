import { WebSocket } from "ws";
import { NodeOptions, NodeStats } from "../types/Node";
import { Sonatica } from "./Sonatica";
import { Rest } from "./Rest";
import { EventOp, Ops, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from "../types/Op";
import { RestPlayer, PreviousPlayer, TrackData, SearchResult } from "../types/Rest";
import { buildTrack } from "./Utils";
import { Player } from "./Player";
import { RepeatMode, UnresolvedTrack, Track } from "../types/Player";
import { TrackUtils } from "../utils/utils";

export class Node {
	private static _sonatica: Sonatica;
	public isEnabled: boolean = true;
	public rest: Rest;
	public sessionId: string;
	public sonatica: Sonatica;
	public ws: WebSocket;
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
	private reconnectAttempts = 1;
	private lastestOp: number = 0;

	public get connected(): boolean {
		if (!this.ws) return false;
		return this.ws.readyState === 1;
	}

	public get address(): string {
		return `${this.options.host}:${this.options.port}`;
	}

	public static init(sonatica: Sonatica): void {
		this._sonatica = sonatica;
	}

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

	public async connect() {
		if (this.connected) return;

		const headers = Object.assign({
			Authorization: this.options.password,
			"User-Id": this.sonatica.options.clientId,
			"Client-Name": this.sonatica.options.clientName,
		});

		if (this.sonatica.options.autoResume && this.sonatica.options.redisUrl) {
			const sessionId = await this.sonatica.db.get(`sessions.${this.options.identifier ?? this.options.host.replace(/\./g, "-")}`);
			headers["Session-Id"] = sessionId;
		}

		this.ws = new WebSocket(`ws${this.options.secure ? "s" : ""}://${this.address}/v4/websocket`, { headers });
		this.ws.on("open", this.open.bind(this));
		this.ws.on("close", this.close.bind(this));
		this.ws.on("message", this.message.bind(this));
		this.ws.on("error", this.error.bind(this));
	}

	protected open() {
		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
		this.sonatica.emit("nodeConnect", this);
	}

	protected close(code: number, reason: string) {
		this.sonatica.emit("nodeDisconnect", this, { code, reason });
		if (code !== 1000 || reason !== "destroy") this.reconnect();

		this.sonatica.players
			.filter((p) => p.node.options.identifier === this.options.identifier)
			.map((p) => {
				if (!this.sonatica.options.autoMove) return (p.playing = false);
				if (this.sonatica.options.autoMove) {
					if (this.sonatica.nodes.filter((n) => n.connected).size === 0) return (p.playing = false);
					p.moveNode(this.options.identifier);
				}
			});
	}

	protected error(error: Error): void {
		if (!error) return;
		this.sonatica.emit("nodeError", this, error);
	}

	protected async message(d: Buffer | string) {
		if (Array.isArray(d)) d = Buffer.concat(d);
		else if (d instanceof ArrayBuffer) d = Buffer.from(d);

		const payload = JSON.parse(d.toString()) as Ops;

		if (!payload.op) return;

		this.sonatica.emit("nodeRaw", payload);
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
				}
				break;
			case "ready":
				{
					this.sessionId = payload.sessionId;

					if (!this.sonatica.options.autoResume || !this.sonatica.options.redisUrl) return;
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

						let decoded = <TrackData[]>await this.rest.request("POST", "/decodetracks", JSON.stringify(previousPlayer.queue.map((t) => t).concat(previousPlayer.current)));
						player.queue.add(TrackUtils.build(decoded.find((t) => t.encoded === previousPlayer.current, previousPlayer.requester)));
						if (previousPlayer.queue.length > 0) player.queue.add(decoded.filter((t) => t.encoded !== previousPlayer.current).map((t) => TrackUtils.build(t, previousPlayer.requester)));

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
						await player.play();
					}

					if (this.reconnectAttempts !== 1) {
						this.sonatica.players
							.filter((p) => p.node.options.identifier === this.options.identifier)
							.forEach(async (p) => {
								const player = this.sonatica.players.get(p.guild);
								if (!player) return;

								await this.rest.request("PATCH", `/sessions/${this.sessionId}/players/${player.guild}?noReplace=false`, {
									voice: {
										token: player.voiceState.event.token,
										endpoint: player.voiceState.event.endpoint,
										sessionId: player!.voiceState?.sessionId!,
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
		}
	}

	protected trackStart(player: Player, track: Track, payload: TrackStartEvent) {
		player.playing = true;
		player.paused = false;
		this.sonatica.emit("trackStart", player, track, payload);
	}

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

					this.sonatica.emit("trackEnd", player, track, payload);
					if (autoPlay) player.play();
				}
				break;

			case "replaced":
				{
					this.sonatica.emit("trackEnd", player, track, payload);
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

						this.sonatica.emit("trackEnd", player, track, payload);
						if (reason === "stopped" && !(queue.current = queue.shift())) return this.queueEnd(player, track, payload);

						if (autoPlay) player.play();
					} else if (queue.length) {
						queue.previous = queue.current;
						queue.current = queue.shift();
						this.sonatica.emit("trackEnd", player, track, payload);
						if (autoPlay) player.play();
					} else {
						this.queueEnd(player, track, payload);
					}
				}
				break;
		}
	}

	protected trackStuck(player: Player, track: Track, payload: TrackStuckEvent): void {
		this.sonatica.emit("trackStuck", player, track, payload);
	}

	protected trackError(player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent): void {
		this.sonatica.emit("trackError", player, track, payload);
	}

	protected socketClosed(player: Player, payload: WebSocketClosedEvent): void {
		this.sonatica.emit("socketClosed", player, payload);
	}

	protected async queueEnd(player: Player, track: Track, payload: TrackEndEvent): Promise<void> {
		player.queue.current = null;
		player.playing = player.isAutoplay;

		if (player.isAutoplay) return await this.handleAutoplay(player, track);

		this.sonatica.emit("queueEnd", player, track, payload);
	}

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

	public setEnabled(enabled: boolean) {
		this.isEnabled = enabled;
	}

	public destroy() {
		if (!this.connected) return;
		const players = this.sonatica.players.filter((p) => p.node == this);
		if (players.size) {
			players.map((p) => {
				if (this.sonatica.options.autoMove) p.moveNode();
				else p.destroy();
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

	private async handleAutoplay(player: Player, track: Track | UnresolvedTrack): Promise<void> {
		const base = "https://www.youtube.com/watch?v=H58vbez_m4E";
		const getMixUrl = (identifier: string) => `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
		const findMix = async (): Promise<SearchResult> => {
			let mixUrl: string;
			let response: SearchResult;
			let base_response: SearchResult;

			const previousTrack = player.queue.previous || track;

			base_response = await player.search(
				{
					query: `${previousTrack.title} - ${previousTrack.author}`,
					source: "youtube",
				},
				previousTrack.requester
			);

			mixUrl = getMixUrl(previousTrack.sourceName! === "youtube" ? previousTrack.identifier! : base_response.tracks[0].identifier);

			response = await player.search({ query: mixUrl }, previousTrack.requester);

			if (response.loadType === "error" || response.loadType === "empty") {
				base_response = await player.search({ query: base }, previousTrack.requester);
				mixUrl = getMixUrl(base_response.tracks[0].identifier);
				response = await player.search({ query: mixUrl }, previousTrack.requester);
			}

			return response;
		};

		const response = await findMix();
		player.queue.add(response.playlist!.tracks.filter((t) => t.uri !== track.uri)[Math.floor(Math.random() * response.playlist!.tracks.length - 1)]);
		player.play();
	}
}
