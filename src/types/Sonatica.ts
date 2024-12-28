import { Collection } from "@discordjs/collection";
import { SearchPlatform } from "../utils/sources";
import { NodeOptions } from "./Node";
import { Node } from "../classes/Node";

export interface SonaticaOptions {
	nodes: NodeOptions[];
	clientId?: string;
	clientName?: string;
	shards?: number;
	autoPlay?: boolean;
	trackPartial?: string[];
	defaultSearchPlatform?: SearchPlatform;
	autoMove?: boolean;
	autoResume?: boolean;
	sorter(nodes: Collection<string, Node>): Collection<string, Node>;
	send(id: string, payload: Payload): void;
}

export interface SearchQuery {
	query: string;
	source?: string;
}

export interface Payload {
	op: number;
	d: {
		guild_id: string;
		channel_id: string | null;
		self_mute: boolean;
		self_deaf: boolean;
	};
}

export interface VoiceServer {
	token: string;
	guild_id: string;
	endpoint: string;
}

export interface VoiceState {
	guild_id: string;
	user_id: string;
	session_id: string;
	channel_id: string;
}

export interface VoiceState {
	op: "voiceUpdate";
	guildId: string;
	event: VoiceServer;
	sessionId?: string;
}

export interface VoicePacket {
	t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
	d: VoiceState | VoiceServer;
}
