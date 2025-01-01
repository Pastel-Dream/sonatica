import { RepeatMode, Track } from "./Player";

/**
 * Represents a player in the REST API.
 * 
 * @interface RestPlayer
 * @property {string} guildId - The ID of the guild.
 * @property {Object} track - The track currently being played.
 * @property {string} track.encoded - The encoded track data.
 * @property {TrackDataInfo} track.info - Information about the track.
 * @property {Record<string, any>} track.pluginInfo - Plugin-specific information.
 * @property {Record<string, any>} track.userData - User-specific data.
 * @property {number} volume - The volume level of the player.
 * @property {boolean} paused - Indicates if the player is paused.
 * @property {Object} state - The current state of the player.
 * @property {number} state.time - The current time of the track.
 * @property {number} state.position - The position of the track.
 * @property {boolean} state.connected - Indicates if the player is connected.
 * @property {number} state.ping - The ping to the server.
 * @property {Object} voice - Voice connection details.
 * @property {string} voice.token - The voice connection token.
 * @property {string} voice.endpoint - The voice connection endpoint.
 * @property {string} voice.sessionId - The session ID for the voice connection.
 * @property {Record<string, any>} filters - Filters applied to the audio.
 */
export interface RestPlayer {
	guildId: string;
	track: {
		encoded: string;
		info: TrackDataInfo;
		pluginInfo: Record<string, any>;
		userData: Record<string, any>;
	};
	volume: number;
	paused: boolean;
	state: {
		time: number;
		position: number;
		connected: boolean;
		ping: number;
	};
	voice: {
		token: string;
		endpoint: string;
		sessionId: string;
	};
	filters: Record<string, any>;
}

/**
 * Represents the result of a search operation.
 * 
 * @interface SearchResult
 * @property {LoadType} loadType - The type of load operation.
 * @property {Track[]} tracks - The list of tracks found.
 * @property {PlaylistData} [playlist] - The playlist data if applicable.
 */
export interface SearchResult {
	loadType: LoadType;
	tracks: Track[];
	playlist?: PlaylistData;
}

/**
 * Represents a playlist data structure.
 * 
 * @interface PlaylistData
 * @property {string} name - The name of the playlist.
 * @property {number} duration - The total duration of the playlist.
 * @property {Track[]} tracks - The list of tracks in the playlist.
 * @property {string} url - The URL of the playlist.
 */
export interface PlaylistData {
	name: string;
	duration: number;
	tracks: Track[];
	url: string;
}

/**
 * Represents the response from a search operation.
 * 
 * @interface SearchResponse
 * @property {LoadType} loadType - The type of load operation.
 * @property {TrackData[] | PlaylistRawData} data - The data returned from the search.
 */
export interface SearchResponse {
	loadType: LoadType;
	data: TrackData[] | PlaylistRawData;
}

/**
 * Represents the data of a track.
 * 
 * @interface TrackData
 * @property {string} encoded - The encoded track data.
 * @property {TrackDataInfo} info - Information about the track.
 * @property {object} [pluginInfo] - Optional plugin-specific information.
 */
export interface TrackData {
	encoded: string;
	info: TrackDataInfo;
	pluginInfo?: object;
}

/**
 * Represents raw data of a playlist.
 * 
 * @interface PlaylistRawData
 * @property {Object} info - Information about the playlist.
 * @property {Object} pluginInfo - Plugin-specific information.
 * @property {TrackData[]} tracks - The list of tracks in the playlist.
 */
export interface PlaylistRawData {
	info: {
		name: string;
	};
	pluginInfo: {
		url: string;
	};
	tracks: TrackData[];
}

/**
 * Represents the previous player state.
 * 
 * @interface PreviousPlayer
 * @property {string} guild - The ID of the guild.
 * @property {string} voiceChannel - The ID of the voice channel.
 * @property {string} textChannel - The ID of the text channel.
 * @property {number} volume - The volume level of the player.
 * @property {Record<string, any>} data - Additional data associated with the player.
 * @property {boolean} selfDeafen - Indicates if the player is self-deafened.
 * @property {boolean} selfMute - Indicates if the player is self-muted.
 * @property {boolean} isAutoplay - Indicates if autoplay is enabled.
 * @property {RepeatMode} repeatMode - The repeat mode of the player.
 * @property {string} current - The current track identifier.
 * @property {string[]} queue - The queue of tracks.
 * @property {unknown} requester - The requester of the current track.
 */
export interface PreviousPlayer {
	guild: string;
	voiceChannel: string;
	textChannel: string;
	volume: number;
	data: Record<string, any>;
	selfDeafen: boolean;
	selfMute: boolean;
	isAutoplay: boolean;
	repeatMode: RepeatMode;
	current: string;
	queue: string[];
	requester: unknown;
}

/**
 * Represents information about a track.
 * 
 * @interface TrackDataInfo
 * @property {string} identifier - The unique identifier for the track.
 * @property {boolean} isSeekable - Indicates if the track is seekable.
 * @property {string} author - The author of the track.
 * @property {number} length - The length of the track in milliseconds.
 * @property {boolean} isStream - Indicates if the track is a stream.
 * @property {number} position - The current position of the track.
 * @property {string} title - The title of the track.
 * @property {string} uri - The URI of the track.
 * @property {string} artworkUrl - The URL of the track's artwork.
 * @property {string} [isrc] - The ISRC code of the track (optional).
 * @property {string} sourceName - The name of the source.
 */
export interface TrackDataInfo {
	identifier: string;
	isSeekable: boolean;
	author: string;
	length: number;
	isStream: boolean;
	position: number;
	title: string;
	uri: string;
	artworkUrl: string;
	isrc?: string;
	sourceName: string;
}

export type LoadType = "track" | "playlist" | "search" | "empty" | "error";

export { Track };
