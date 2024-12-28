export interface NodeOptions {
  host: string;
  port: number;
  password: string;
  secure?: boolean;
  identifier?: string;
  retryAmount?: number;
  retryDelay?: number;
  requestTimeout?: number;
  search?: boolean;
  playback?: boolean;
}

export interface NodeStats {
	players: number;
	playingPlayers: number;
	uptime: number;
	memory: MemoryStats;
	cpu: CPUStats;
	frameStats: FrameStats;
}

export interface MemoryStats {
	free: number;
	used: number;
	allocated: number;
	reservable: number;
}

export interface CPUStats {
	cores: number;
	systemLoad: number;
	lavalinkLoad: number;
}

export interface FrameStats {
	sent?: number;
	nulled?: number;
	deficit?: number;
}