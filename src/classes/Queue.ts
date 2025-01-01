import { Track, UnresolvedTrack } from "../types/Player";
import { Player } from "./Player";

/**
 * Queue class that extends the Array to manage a collection of tracks.
 */
export class Queue extends Array<Track | UnresolvedTrack> {
	/** The player associated with this queue. */
	public readonly player: Player;
	/** The currently playing track. */
	public current: Track | UnresolvedTrack | null = null;
	/** The previously played track. */
	public previous: Track | UnresolvedTrack | null = null;

	/**
	 * Creates an instance of Queue.
	 * @param player - The player associated with this queue.
	 */
	constructor(player: Player) {
		super();
		this.player = player;
	}

	/**
	 * Gets the total size of the queue including the current track.
	 * @returns The total size of the queue.
	 */
	public get totalSize(): number {
		return this.length + (this.current ? 1 : 0);
	}

	/**
	 * Gets the size of the queue.
	 * @returns The size of the queue.
	 */
	public get size(): number {
		return this.totalSize;
	}

	/**
	 * Gets the total duration of all tracks in the queue including the current track.
	 * @returns The total duration of the queue.
	 */
	public get duration(): number {
		const current = this.current?.duration ?? 0;
		return this.reduce((acc, cur) => acc + (cur.duration || 0), current);
	}

	/**
	 * Adds a track or an array of tracks to the queue.
	 * @param track - The track or array of tracks to add.
	 * @param offset - The position to insert the track(s) at.
	 */
	public add(track: (Track | UnresolvedTrack) | (Track | UnresolvedTrack)[], offset?: number): void {
		if (!this.current) {
			if (Array.isArray(track)) {
				this.current = track.shift() || null;
				this.push(...track);
			} else {
				this.current = track;
			}
		} else {
			if (typeof offset !== "undefined" && typeof offset === "number") {
				if (isNaN(offset)) {
					throw new RangeError("Offset must be a number.");
				}

				if (offset < 0 || offset > this.length) {
					throw new RangeError(`Offset must be between 0 and ${this.length}.`);
				}

				if (Array.isArray(track)) {
					this.splice(offset, 0, ...track);
				} else {
					this.splice(offset, 0, track);
				}
			} else {
				if (Array.isArray(track)) {
					this.push(...track);
				} else {
					this.push(track);
				}
			}
		}

		this.player.save();
	}

	/**
	 * Removes tracks from the queue.
	 * @param position - The position of the track to remove.
	 * @returns The removed tracks.
	 */
	public remove(position?: number): (Track | UnresolvedTrack)[];
	/**
	 * Removes tracks from the queue between the specified start and end positions.
	 * @param start - The start position of the removal.
	 * @param end - The end position of the removal.
	 * @returns The removed tracks.
	 */
	public remove(start: number, end: number): (Track | UnresolvedTrack)[];
	public remove(startOrPosition = 0, end?: number): (Track | UnresolvedTrack)[] {
		let removedTracks: (Track | UnresolvedTrack)[];
		if (typeof end !== "undefined") {
			if (isNaN(Number(startOrPosition)) || isNaN(Number(end))) {
				throw new RangeError(`Missing "start" or "end" parameter.`);
			}

			if (startOrPosition >= end || startOrPosition >= this.length) {
				throw new RangeError("Invalid start or end values.");
			}

			removedTracks = this.splice(startOrPosition, end - startOrPosition);
		} else {
			removedTracks = this.splice(startOrPosition, 1);
		}

		this.player.save();
		return removedTracks;
	}

	/**
	 * Clears the queue.
	 */
	public clear(): void {
		this.splice(0);
		this.player.save();
	}

	/**
	 * Shuffles the tracks in the queue.
	 */
	public shuffle(): void {
		for (let i = this.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this[i], this[j]] = [this[j], this[i]];
		}

		this.player.save();
	}
}
