import { WebSocket } from "ws";
import { NodeInfo, NodeOptions, NodeStats } from "../types/Node";
import { Sonatica } from "./Sonatica";
import { Rest } from "./Rest";
import { EventOp, Ops } from "../types/Op";
import { RestPlayer, PreviousPlayer, TrackData } from "../types/Rest";
import { Track } from "../types/Player";
import { TrackUtils } from "../utils/utils";
import { EventOpHandler } from "./EventOpHandler";

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
	public ping: number = -1;
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
	private missedPings = 0;
	private maxMissedPings = 3;
	private pingInterval?: NodeJS.Timeout;
	private eventHandler: EventOpHandler;

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
		this.eventHandler = new EventOpHandler(this, this.sonatica);
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
		this.missedPings = 0;
		this.sonatica.emit("nodeConnect", this);

		this.info = <NodeInfo>await this.rest.request("GET", "/info");
		this.startPingInterval();
	}

	/**
	 * Handles the WebSocket connection closing.
	 * @param {number} code - The close code.
	 * @param {string} reason - The reason for closing.
	 */
	protected close(code: number, reason: string) {
		this.stopPingInterval();
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
						this.sonatica.emit("trackStart", player, <Track>player.queue.current, null);
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
				this.eventHandler.handleOp(payload);
				break;
		}
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

	private startPingInterval() {
		this.pingInterval = setInterval(async () => {
			const start = Date.now();
			try {
				await this.rest.request("GET", "/info", undefined);
				this.ping = Date.now() - start;
				this.missedPings = 0;
				this.sonatica.emit("nodePing", this, this.ping);
			} catch {
				this.missedPings++;
				this.ping = -1;
				this.sonatica.emit("nodePingFailed", this, this.missedPings);

				if (this.missedPings >= this.maxMissedPings) {
					this.stopPingInterval();
					this.ws?.close(4000, "missed pings");
					this.reconnect();
				}
			}
		}, 15_000);
	}

	private stopPingInterval() {
		if (this.pingInterval) clearInterval(this.pingInterval);
		this.pingInterval = undefined;
	}
}
