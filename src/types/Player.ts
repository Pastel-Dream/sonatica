/**
 * @interface PlayerOptions
 * @property {string} guild - The ID of the guild.
 * @property {string} textChannel - The ID of the text channel.
 * @property {string} [voiceChannel] - The ID of the voice channel (optional).
 * @property {string} [node] - The identifier for the node (optional).
 * @property {number} [volume] - The volume level (optional).
 * @property {boolean} [selfMute] - Indicates if the player is self-muted (optional).
 * @property {boolean} [selfDeafen] - Indicates if the player is self-deafened (optional).
 * @property {Object} [data] - Additional data associated with the player (optional).
 */
export interface PlayerOptions {
	guild: string;
	textChannel: string;
	voiceChannel?: string;
	node?: string;
	volume?: number;
	selfMute?: boolean;
	selfDeafen?: boolean;
	data?: { [k: string]: any };
}

/**
 * @interface Track
 * @property {string} track - The track identifier.
 * @property {string} artworkUrl - The URL of the track's artwork.
 * @property {string} sourceName - The name of the source.
 * @property {string} title - The title of the track.
 * @property {string} identifier - The unique identifier for the track.
 * @property {string} author - The author of the track.
 * @property {number} duration - The duration of the track in milliseconds.
 * @property {boolean} isSeekable - Indicates if the track is seekable.
 * @property {boolean} isStream - Indicates if the track is a stream.
 * @property {string} uri - The URI of the track.
 * @property {string} [thumbnail] - The thumbnail URL of the track (optional).
 * @property {unknown} [requester] - The requester of the track (optional).
 */
export interface Track {
	track: string;
	artworkUrl: string;
	sourceName: string;
	title: string;
	identifier: string;
	author: string;
	duration: number;
	isSeekable: boolean;
	isStream: boolean;
	uri: string;
	thumbnail?: string;
	requester?: unknown;
}

/**
 * @interface UnresolvedTrack
 * @extends {Partial<Track>}
 * @property {string} title - The title of the track.
 * @property {string} [author] - The author of the track (optional).
 * @property {number} [duration] - The duration of the track in milliseconds (optional).
 * @method {Promise<void>} resolve - Resolves the track to a complete Track object.
 */
export interface UnresolvedTrack extends Partial<Track> {
	title: string;
	author?: string;
	duration?: number;
	resolve(): Promise<void>;
}

/**
 * @enum {number}
 * Represents the repeat mode of the player.
 * @property {number} NONE - No repeat mode.
 * @property {number} TRACK - Repeat the current track.
 * @property {number} QUEUE - Repeat the entire queue.
 */
export enum RepeatMode {
	NONE = 0,
	TRACK = 1,
	QUEUE = 2,
}

/**
 * @enum {string}
 * Represents the state of the player.
 * @property {string} CONNECTED - The player is connected.
 * @property {string} CONNECTING - The player is connecting.
 * @property {string} DISCONNECTED - The player is disconnected.
 * @property {string} DISCONNECTING - The player is disconnecting.
 * @property {string} DESTROYING - The player is destroying.
 * @property {string} MOVING - The player is moving.
 * @property {string} RESUMING - The player is resuming.
 */
export enum State {
	CONNECTED = "CONNECTED",
	CONNECTING = "CONNECTING",
	DISCONNECTED = "DISCONNECTED",
	DISCONNECTING = "DISCONNECTING",
	DESTROYING = "DESTROYING",
	MOVING = "MOVING",
	RESUMING = "RESUMING",
}