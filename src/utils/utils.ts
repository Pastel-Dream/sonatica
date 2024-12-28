import { Sonatica } from "../classes/Sonatica";
import { Track, UnresolvedTrack } from "../types/Player";
import { TrackData } from "../types/Rest";
import { SearchQuery } from "../types/Sonatica";

const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const TRACK_SYMBOL = Symbol("track");
export const UNRESOLVED_TRACK_SYMBOL = Symbol("unresolved");

export class TrackUtils {
	private static sonatica: Sonatica;

	public static init(sonatica: Sonatica): void {
		this.sonatica = sonatica;
	}

	static validate(trackOrTracks: unknown): boolean {
		if (typeof trackOrTracks === "undefined") throw new RangeError("Provided argument must be present.");

		if (Array.isArray(trackOrTracks) && trackOrTracks.length) {
			for (const track of trackOrTracks) {
				if (!(track[TRACK_SYMBOL] || track[UNRESOLVED_TRACK_SYMBOL])) return false;
			}
			return true;
		}

		return (trackOrTracks[TRACK_SYMBOL] || trackOrTracks[UNRESOLVED_TRACK_SYMBOL]) === true;
	}

	static isTrack(track: unknown): boolean {
		if (typeof track === "undefined") throw new RangeError("Provided argument must be present.");
		return track[TRACK_SYMBOL] === true;
	}

	static isUnresolvedTrack(track: unknown) {
		if (typeof track === "undefined") throw new RangeError("Provided argument must be present.");
		return track[UNRESOLVED_TRACK_SYMBOL] === true;
	}

	static build(data: TrackData, requester?: unknown): Track {
		if (typeof data === "undefined") throw new RangeError("Argument 'data' must be present.");

		try {
			const track: Track = {
				track: data.encoded,
				title: data.info.title,
				identifier: data.info.identifier,
				author: data.info.author,
				duration: data.info.length,
				isSeekable: data.info.isSeekable,
				isStream: data.info.isStream,
				uri: data.info.uri,
				artworkUrl: data.info?.artworkUrl,
				sourceName: data.info?.sourceName,
				requester,
			};

			Object.defineProperty(track, TRACK_SYMBOL, {
				configurable: true,
				value: true,
			});

			return track;
		} catch (error) {
			throw new RangeError(`Argument "data" is not a valid track: ${error.message}`);
		}
	}

	static buildUnresolved(query: SearchQuery, requester?: unknown): UnresolvedTrack {
		if (typeof query === "undefined") throw new RangeError("Argument 'query' must be present.");

		let unresolvedTrack: Partial<UnresolvedTrack> = {
			requester,
			async resolve(): Promise<void> {
				const resolved = await TrackUtils.getClosestTrack(this);
				Object.getOwnPropertyNames(this).forEach((prop) => delete this[prop]);
				Object.assign(this, resolved);
			},
		};

		if (typeof query === "string") unresolvedTrack.title = query;
		else unresolvedTrack = { ...unresolvedTrack, ...query };

		Object.defineProperty(unresolvedTrack, UNRESOLVED_TRACK_SYMBOL, {
			configurable: true,
			value: true,
		});

		return unresolvedTrack as UnresolvedTrack;
	}

	static async getClosestTrack(unresolvedTrack: UnresolvedTrack): Promise<Track> {
		if (!TrackUtils.sonatica) throw new RangeError("Manager has not been initiated.");

		if (!TrackUtils.isUnresolvedTrack(unresolvedTrack)) throw new RangeError("Provided track is not a UnresolvedTrack.");

		const query = [unresolvedTrack.author, unresolvedTrack.title].filter((str) => !!str).join(" - ");

		const res = await TrackUtils.sonatica.search({ query }, unresolvedTrack.requester);

		if (unresolvedTrack.author) {
			const channelNames = [unresolvedTrack.author, `${unresolvedTrack.author} - Topic`];

			const originalAudio = res.tracks.find((track) => {
				return channelNames.some((name) => new RegExp(`^${escapeRegExp(name)}$`, "i").test(track.author)) || new RegExp(`^${escapeRegExp(unresolvedTrack.title)}$`, "i").test(track.title);
			});

			if (originalAudio) return originalAudio;
		}

		if (unresolvedTrack.duration) {
			const sameDuration = res.tracks.find((track) => track.duration >= unresolvedTrack.duration - 1500 && track.duration <= unresolvedTrack.duration + 1500);

			if (sameDuration) return sameDuration;
		}

		return res.tracks[0];
	}
}
