import { LyricsResult } from "../types/Op";
import { Node } from "./Node";
import { Player } from "./Player";

/**
 * Lyrics class to interact with the LavaLyrics plugin.
 * Provides functionality to retrieve, subscribe to, and unsubscribe from lyrics.
 */
export class Lyrics {
	/** The node instance associated with the player */
	public node: Node;

	/**
	 * Creates a new Lyrics instance.
	 * @param {Player} player - The player instance to associate with this lyrics handler
	 */
	constructor(public player: Player) {
		this.node = player.node;
	}

	/**
	 * Retrieves lyrics for the currently playing track.
	 * @param {boolean} skipTrackSource - Whether to skip the track source when fetching lyrics
	 * @returns {Promise<LyricsResult>} A promise that resolves to the lyrics result
	 * @throws {RangeError} If the LavaLyrics plugin is not installed
	 */
	public async get(skipTrackSource: boolean = false): Promise<LyricsResult> {
		this.hasLavaLyricsPlugin();

		return <LyricsResult>await this.node.rest.request("GET", `/sessions/${this.node.sessionId}/players/${this.player.guild}/track/lyrics?skipTrackSource=${skipTrackSource}`);
	}

	/**
	 * Subscribes to lyrics updates for the current player.
	 * @returns {Promise<unknown>} A promise that resolves when the subscription is successful
	 * @throws {RangeError} If the LavaLyrics plugin is not installed
	 */
	public async subscribe(): Promise<unknown> {
		this.hasLavaLyricsPlugin();

		return await this.node.rest.request("POST", `/sessions/${this.node.sessionId}/players/${this.player.guild}/lyrics/subscribe`, {});
	}

	/**
	 * Unsubscribes from lyrics updates for the current player.
	 * @returns {Promise<unknown>} A promise that resolves when the unsubscription is successful
	 * @throws {RangeError} If the LavaLyrics plugin is not installed
	 */
	public async unsubscribe(): Promise<unknown> {
		this.hasLavaLyricsPlugin();

		return await this.node.rest.request("GET", `/sessions/${this.node.sessionId}/players/${this.player.guild}/lyrics/unsubscribe`);
	}

	/**
	 * Checks if the LavaLyrics plugin is installed on the node.
	 * @private
	 * @throws {RangeError} If the LavaLyrics plugin is not found
	 */
	private hasLavaLyricsPlugin(): void {
		if (!this.node.info.plugins.find((plugin) => plugin.name === "lavalyrics-plugin")) {
			throw new RangeError("Lavalyrics plugin not found.");
		}
	}
}
