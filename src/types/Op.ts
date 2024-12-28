import { VoiceServer } from "./Sonatica";
import { NodeStats } from "./Node";
import { Track } from "./Rest";

export type Ops = ReadyOp | PlayerUpdateOp | StatsOp | EventOp;
export interface VoiceState {
	op: "voiceUpdate";
	guildId: string;
	event: VoiceServer;
	sessionId?: string;
}

export interface ReadyOp {
	op: "ready";
	resumed: boolean;
	sessionId: string;
}

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

export type StatsOp = {
	op: "stats";
} & NodeStats;

export type EventOp = {
	op: "event";
	guildId: string;
} & (TrackStartEvent | TrackEndEvent | TrackExceptionEvent | TrackStuckEvent | WebSocketClosedEvent);

export interface TrackStartEvent {
	type: "TrackStartEvent";
	track: Track;
}

export interface TrackEndEvent {
	type: "TrackEndEvent";
	track: Track;
	reason: TrackEndReason;
}

export interface TrackExceptionEvent {
	type: "TrackExceptionEvent";
	track: Track;
	exception: Exception;
}

export interface TrackStuckEvent {
	type: "TrackStuckEvent";
	track: Track;
	thresholdMs: number;
}

export interface WebSocketClosedEvent {
	type: "WebSocketClosedEvent";
	code: number;
	reason: string;
	byRemote: boolean;
}

export interface Exception {
	message?: string;
	severity: Severity;
	cause: string;
}

export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup";
export type Severity = "common" | "suspicious" | "fault";
