import { Track, UnresolvedTrack } from "../types/Player";

export class Queue extends Array<Track | UnresolvedTrack> {
	public current: Track | UnresolvedTrack | null = null;
	public previous: Track | UnresolvedTrack | null = null;

	public get totalSize(): number {
		return this.length + (this.current ? 1 : 0);
	}

	public get size(): number {
		return this.totalSize;
	}

	public get duration(): number {
		const current = this.current?.duration ?? 0;
		return this.reduce((acc, cur) => acc + (cur.duration || 0), current);
	}

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
	}

	public remove(position?: number): (Track | UnresolvedTrack)[];
	public remove(start: number, end: number): (Track | UnresolvedTrack)[];
	public remove(startOrPosition = 0, end?: number): (Track | UnresolvedTrack)[] {
		if (typeof end !== "undefined") {
			if (isNaN(Number(startOrPosition)) || isNaN(Number(end))) {
				throw new RangeError(`Missing "start" or "end" parameter.`);
			}

			if (startOrPosition >= end || startOrPosition >= this.length) {
				throw new RangeError("Invalid start or end values.");
			}

			return this.splice(startOrPosition, end - startOrPosition);
		}

		return this.splice(startOrPosition, 1);
	}

	public clear(): void {
		this.splice(0);
	}

	public shuffle(): void {
		for (let i = this.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this[i], this[j]] = [this[j], this[i]];
		}
	}
}
