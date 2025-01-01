import { Collection } from "@discordjs/collection";
import { SearchPlatform } from "../utils/sources";
import { NodeOptions } from "./Node";
import { Node } from "../classes/Node";

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
 * @property {number} [cacheTTL] - The time-to-live for cache in seconds.
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
	cacheTTL?: number;
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
