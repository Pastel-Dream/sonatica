/**
 * Options for configuring a Node.
 */
export interface NodeOptions {
	/** The host of the Node. */
	host: string;
	/** The port of the Node. */
	port: number;
	/** The password for the Node. */
	password: string;
	/** Whether the connection is secure. */
	secure?: boolean;
	/** An optional identifier for the Node. */
	identifier?: string;
	/** The number of retry attempts for connection. */
	retryAmount?: number;
	/** The delay between retry attempts in milliseconds. */
	retryDelay?: number;
	/** The timeout for requests in milliseconds. */
	requestTimeout?: number;
	/** Whether to enable search functionality. */
	search?: boolean;
	/** Whether to enable playback functionality. */
	playback?: boolean;
}

/**
 * Statistics for a Node.
 */
export interface NodeStats {
	/** The total number of players. */
	players: number;
	/** The number of players currently playing. */
	playingPlayers: number;
	/** The uptime of the Node in seconds. */
	uptime: number;
	/** Memory statistics of the Node. */
	memory: MemoryStats;
	/** CPU statistics of the Node. */
	cpu: CPUStats;
	/** Frame statistics of the Node. */
	frameStats: FrameStats;
}

/**
 * Memory statistics for a Node.
 */
export interface MemoryStats {
	/** The amount of free memory in bytes. */
	free: number;
	/** The amount of used memory in bytes. */
	used: number;
	/** The total allocated memory in bytes. */
	allocated: number;
	/** The amount of memory that can be reserved in bytes. */
	reservable: number;
}

/**
 * CPU statistics for a Node.
 */
export interface CPUStats {
	/** The number of CPU cores. */
	cores: number;
	/** The system load percentage. */
	systemLoad: number;
	/** The load percentage specific to Lavalink. */
	lavalinkLoad: number;
}

/**
 * Frame statistics for a Node.
 */
export interface FrameStats {
	/** The number of frames sent. */
	sent?: number;
	/** The number of frames nulled. */
	nulled?: number;
	/** The number of frames deficit. */
	deficit?: number;
}
