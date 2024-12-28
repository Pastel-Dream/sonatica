import { RepeatMode, Track } from "./Player";

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

export interface SearchResult {
	loadType: LoadType;
	tracks: Track[];
	playlist?: PlaylistData;
}

export interface PlaylistData {
	name: string;
	duration: number;
	tracks: Track[];
	url: string;
}

export interface SearchResponse {
	loadType: LoadType;
	data: TrackData[] | PlaylistRawData;
}

export interface TrackData {
	encoded: string;
	info: TrackDataInfo;
	pluginInfo?: object;
}

export interface PlaylistRawData {
	info: {
		name: string;
	};
	pluginInfo: {
		url: string;
	};
	tracks: TrackData[];
}

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
}

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
