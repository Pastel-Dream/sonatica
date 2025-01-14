import { VoiceServer } from "./Sonatica";
import { NodeStats } from "./Node";
import { Track } from "./Rest";

export type Ops = ReadyOp | PlayerUpdateOp | StatsOp | EventOp;

/**
 * @interface VoiceState
 * @property {string} op - The operation type, should be "voiceUpdate".
 * @property {string} guildId - The ID of the guild.
 * @property {VoiceServer} event - The voice server event.
 * @property {string} [sessionId] - The session ID (optional).
 */
export interface VoiceState {
	op: "voiceUpdate";
	guildId: string;
	event: VoiceServer;
	sessionId?: string;
}

/**
 * @interface ReadyOp
 * @property {string} op - The operation type, should be "ready".
 * @property {boolean} resumed - Indicates if the session was resumed.
 * @property {string} sessionId - The session ID.
 */
export interface ReadyOp {
	op: "ready";
	resumed: boolean;
	sessionId: string;
}

/**
 * @interface PlayerUpdateOp
 * @property {string} op - The operation type, should be "playerUpdate".
 * @property {string} guildId - The ID of the guild.
 * @property {Object} state - The state of the player.
 * @property {number} state.time - The current time of the track.
 * @property {number} state.position - The position of the track.
 * @property {boolean} state.connected - Indicates if the player is connected.
 * @property {number} state.ping - The ping to the server.
 */
export interface PlayerUpdateOp {
	op: "playerUpdate";
	guildId: string;
	state: {
		time: number;
		position: number;
		connected: boolean;
		ping: number;
	};
}

/**
 * @typedef {Object} StatsOp
 * @property {string} op - The operation type, should be "stats".
 * @extends {NodeStats}
 */
export type StatsOp = {
	op: "stats";
} & NodeStats;

/**
 * @typedef {Object} EventOp
 * @property {string} op - The operation type, should be "event".
 * @property {string} guildId - The ID of the guild.
 * @extends {TrackStartEvent | TrackEndEvent | TrackExceptionEvent | TrackStuckEvent | WebSocketClosedEvent}
 */
export type EventOp = {
	op: "event";
	guildId: string;
} & (TrackStartEvent | TrackEndEvent | TrackExceptionEvent | TrackStuckEvent | WebSocketClosedEvent | LyricsFoundEvent | LyricsNotFoundEvent | LyricsLineEvent);

/**
 * @interface TrackStartEvent
 * @property {string} type - The type of the event, should be "TrackStartEvent".
 * @property {Track} track - The track that started.
 */
export interface TrackStartEvent {
	type: "TrackStartEvent";
	track: Track;
}

/**
 * @interface TrackEndEvent
 * @property {string} type - The type of the event, should be "TrackEndEvent".
 * @property {Track} track - The track that ended.
 * @property {TrackEndReason} reason - The reason for the track ending.
 */
export interface TrackEndEvent {
	type: "TrackEndEvent";
	track: Track;
	reason: TrackEndReason;
}

/**
 * @interface TrackExceptionEvent
 * @property {string} type - The type of the event, should be "TrackExceptionEvent".
 * @property {Track} track - The track that encountered an exception.
 * @property {Exception} exception - The exception details.
 */
export interface TrackExceptionEvent {
	type: "TrackExceptionEvent";
	track: Track;
	exception: Exception;
}

/**
 * @interface TrackStuckEvent
 * @property {string} type - The type of the event, should be "TrackStuckEvent".
 * @property {Track} track - The track that got stuck.
 * @property {number} thresholdMs - The threshold in milliseconds.
 */
export interface TrackStuckEvent {
	type: "TrackStuckEvent";
	track: Track;
	thresholdMs: number;
}

/**
 * @interface WebSocketClosedEvent
 * @property {string} type - The type of the event, should be "WebSocketClosedEvent".
 * @property {number} code - The closure code.
 * @property {string} reason - The reason for the closure.
 * @property {boolean} byRemote - Indicates if the closure was initiated by the remote.
 */
export interface WebSocketClosedEvent {
	type: "WebSocketClosedEvent";
	code: number;
	reason: string;
	byRemote: boolean;
}

/**
 * Event triggered when lyrics are found.
 * @interface LyricsFoundEvent
 * @property {string} type - The type of the event, should be "LyricsFoundEvent".
 * @property {LyricsResult} lyrics - The result containing the found lyrics.
 */
export interface LyricsFoundEvent {
	type: "LyricsFoundEvent";
	lyrics: LyricsResult;
}

/**
 * Event triggered when lyrics are not found.
 * @interface LyricsNotFoundEvent
 * @property {string} type - The type of the event, should be "LyricsNotFoundEvent".
 */
export interface LyricsNotFoundEvent {
	type: "LyricsNotFoundEvent";
}

/**
 * Event triggered for each line of lyrics.
 * @interface LyricsLineEvent
 * @property {string} type - The type of the event, should be "LyricsLineEvent".
 * @property {number} lineIndex - The index of the line in the lyrics.
 * @property {LyricsLine} line - The line of lyrics.
 * @property {boolean} skipped - Indicates if the line was skipped.
 */
export interface LyricsLineEvent {
	type: "LyricsLineEvent";
	lineIndex: number;
	line: LyricsLine;
	skipped: boolean;
}

/**
 * Represents a single line of lyrics.
 * @interface LyricsLine
 * @property {number} timestamp - The timestamp of the line.
 * @property {number | null} duration - The duration of the line; null if unknown.
 * @property {string} line - The text of the lyrics line.
 * @property {object} plugin - The plugin that provided the lyrics line.
 */
export interface LyricsLine {
	timestamp: number;
	duration: number | null;
	line: string;
	plugin: object;
}

/**
 * Represents the result of a lyrics search.
 * @interface LyricsResult
 * @property {string} sourceName - The name of the source of the lyrics.
 * @property {string} provider - The provider of the lyrics.
 * @property {string | null} text - The full text of the lyrics; null if not available.
 * @property {LyricsLine[]} lines - The individual lines of the lyrics.
 * @property {object} plugin - The plugin that provided the lyrics.
 */
export interface LyricsResult {
	sourceName: string;
	provider: string;
	text: string | null;
	lines: LyricsLine[];
	plugin: object;
}

/**
 * @interface Exception
 * @property {string} [message] - The exception message (optional).
 * @property {Severity} severity - The severity of the exception.
 * @property {string} cause - The cause of the exception.
 */
export interface Exception {
	message?: string;
	severity: Severity;
	cause: string;
}

export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup";
export type Severity = "common" | "suspicious" | "fault";
