export type State = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING" | "MOVING" | "RESUMING";

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

export interface UnresolvedTrack extends Partial<Track> {
	title: string;
	author?: string;
	duration?: number;
	resolve(): Promise<void>;
}

export enum RepeatMode {
	NONE = 0,
	TRACK = 1,
	QUEUE = 2,
}
