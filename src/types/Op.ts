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
} & (TrackStartEvent | TrackEndEvent | TrackExceptionEvent | TrackStuckEvent | WebSocketClosedEvent);

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
