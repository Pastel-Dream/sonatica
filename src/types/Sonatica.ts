import { Collection } from "@discordjs/collection";
import { SearchPlatform } from "../utils/sources";
import { NodeOptions } from "./Node";
import { Node } from "../classes/Node";
import { Player } from "../classes/Player";
import { Track } from "./Player";
import { TrackExceptionEvent, TrackStuckEvent, WebSocketClosedEvent } from "./Op";

/**
 * Options for configuring Sonatica.
 * @interface SonaticaOptions
 * @property {NodeOptions[]} nodes - An array of node options.
 * @property {string} [clientId] - The ID of the client.
 * @property {string} [clientName] - The name of the client.
 * @property {number} [shards] - The number of shards.
 * @property {string} [redisUrl] - The URL for Redis.
 * @property {boolean} [autoPlay] - Whether to enable autoplay.
 * @property {string[]} [trackPartial] - An array of partial track identifiers.
 * @property {SearchPlatform} [defaultSearchPlatform] - The default search platform.
 * @property {boolean} [autoMove] - Whether to enable automatic moving.
 * @property {boolean} [autoResume] - Whether to enable automatic resume.
 * @property {(nodes: Collection<string, Node>) => Collection<string, Node>} [sorter] - A function to sort nodes.
 * @property {(id: string, payload: Payload) => void} send - A function to send payloads.
 */
export interface SonaticaOptions {
	nodes: NodeOptions[];
	clientId?: string;
	clientName?: string;
	shards?: number;
	redisUrl?: string;
	autoPlay?: boolean;
	trackPartial?: string[];
	defaultSearchPlatform?: SearchPlatform;
	autoMove?: boolean;
	autoResume?: boolean;
	sorter?: (nodes: Collection<string, Node>) => Collection<string, Node>;
	send(id: string, payload: Payload): void;
}

/**
 * Represents a search query.
 * @interface SearchQuery
 * @property {string} query - The search query string.
 * @property {string} [source] - The source of the search.
 */
export interface SearchQuery {
	query: string;
	source?: string;
}

/**
 * Represents a payload for communication.
 * @interface Payload
 * @property {number} op - The operation code.
 * @property {Object} d - The data object.
 * @property {string} d.guild_id - The ID of the guild.
 * @property {string | null} d.channel_id - The ID of the channel or null.
 * @property {boolean} d.self_mute - Indicates if the user is self-muted.
 * @property {boolean} d.self_deaf - Indicates if the user is self-deafened.
 */
export interface Payload {
	op: number;
	d: {
		guild_id: string;
		channel_id: string | null;
		self_mute: boolean;
		self_deaf: boolean;
	};
}

/**
 * Represents a voice server.
 * @interface VoiceServer
 * @property {string} token - The token for the voice server.
 * @property {string} guild_id - The ID of the guild.
 * @property {string} endpoint - The endpoint of the voice server.
 */
export interface VoiceServer {
	token: string;
	guild_id: string;
	endpoint: string;
}

/**
 * Represents the state of a voice connection.
 * @interface VoiceState
 * @property {string} guild_id - The ID of the guild.
 * @property {string} user_id - The ID of the user.
 * @property {string} session_id - The session ID.
 * @property {string} channel_id - The ID of the channel.
 */
export interface VoiceState {
	guild_id: string;
	user_id: string;
	session_id: string;
	channel_id: string;
}

/**
 * Represents an updated voice state.
 * @interface VoiceState
 * @property {"voiceUpdate"} op - The operation type.
 * @property {string} guildId - The ID of the guild.
 * @property {VoiceServer} event - The voice server event.
 * @property {string} [sessionId] - The session ID, if available.
 */
export interface VoiceState {
	op: "voiceUpdate";
	guildId: string;
	event: VoiceServer;
	sessionId?: string;
}

/**
 * Represents a voice packet.
 * @interface VoicePacket
 * @property {"VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE"} [t] - The type of the voice packet.
 * @property {VoiceState | VoiceServer} d - The data of the voice packet.
 */
export interface VoicePacket {
	t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
	d: VoiceState | VoiceServer;
}

/**
 * Represents the events emitted by the Sonatica instance.
 * @interface SonaticaEvents
 */
export interface SonaticaEvents {
	/**
	 * Emitted when a new node is created.
	 * @param {Node} [node] - The created node.
	 */
	nodeCreate?: (node?: Node) => void;

	/**
	 * Emitted when a node is destroyed.
	 * @param {Node} [node] - The destroyed node.
	 */
	nodeDestroy?: (node?: Node) => void;

	/**
	 * Emitted when a node connects.
	 * @param {Node} [node] - The connected node.
	 */
	nodeConnect?: (node?: Node) => void;

	/**
	 * Emitted when a node reconnects.
	 * @param {Node} [node] - The reconnected node.
	 */
	nodeReconnect?: (node?: Node) => void;

	/**
	 * Emitted when a node disconnects.
	 * @param {Node} [node] - The disconnected node.
	 * @param {{ code?: number; reason?: string }} [reason] - The reason for disconnection.
	 */
	nodeDisconnect?: (node?: Node, reason?: { code?: number; reason?: string }) => void;

	/**
	 * Emitted when a node encounters an error.
	 * @param {Node} [node] - The node that encountered the error.
	 * @param {Error} [error] - The error that occurred.
	 */
	nodeError?: (node?: Node, error?: Error) => void;

	/**
	 * Emitted when raw data is received from a node.
	 * @param {Node} [node] - The node that sent the data.
	 * @param {string} [data] - The raw data received.
	 */
	nodeRaw?: (node?: Node, data?: string) => void;

	/**
	 * Emitted when a new player is created.
	 * @param {Player} [player] - The created player.
	 */
	playerCreate?: (player?: Player) => void;

	/**
	 * Emitted when a player is destroyed.
	 * @param {Player} [player] - The destroyed player.
	 */
	playerDestroy?: (player?: Player) => void;

	/**
	 * Emitted when the queue ends for a player.
	 * @param {Player} [player] - The player whose queue ended.
	 */
	queueEnd?: (player?: Player) => void;

	/**
	 * Emitted when a player moves to a new position in the queue.
	 * @param {Player} [player] - The player that moved.
	 * @param {number} [newPosition] - The new position in the queue.
	 */
	playerMove?: (player?: Player, newPosition?: number) => void;

	/**
	 * Emitted when a player disconnects.
	 * @param {Player} [player] - The disconnected player.
	 */
	playerDisconnect?: (player?: Player) => void;

	/**
	 * Emitted when a track starts playing.
	 * @param {Player} [player] - The player that started the track.
	 * @param {Track} [track] - The track that started playing.
	 */
	trackStart?: (player?: Player, track?: Track) => void;

	/**
	 * Emitted when a track ends.
	 * @param {Player} [player] - The player that finished the track.
	 * @param {Track} [track] - The track that ended.
	 */
	trackEnd?: (player?: Player, track?: Track) => void;

	/**
	 * Emitted when a track gets stuck.
	 * @param {Player} [player] - The player that encountered the stuck track.
	 * @param {Track} [track] - The track that got stuck.
	 * @param {TrackStuckEvent} [payload] - Additional information about the stuck event.
	 */
	trackStuck?: (player?: Player, track?: Track, payload?: TrackStuckEvent) => void;

	/**
	 * Emitted when a track encounters an error.
	 * @param {Player} [player] - The player that encountered the error.
	 * @param {Track} [track] - The track that encountered the error.
	 * @param {TrackExceptionEvent} [payload] - Additional information about the error.
	 */
	trackError?: (player?: Player, track?: Track, payload?: TrackExceptionEvent) => void;

	/**
	 * Emitted when the socket is closed.
	 * @param {Player} [player] - The player associated with the closed socket.
	 * @param {WebSocketClosedEvent} [payload] - Additional information about the closed socket event.
	 */
	socketClosed?: (player?: Player, payload?: WebSocketClosedEvent) => void;
}
