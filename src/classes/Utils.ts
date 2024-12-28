import { Track } from "../types/Player";
import { TrackData } from "../types/Rest";

export function buildTrack(data: TrackData, requester?: unknown): Track {
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
			thumbnail: data.info?.artworkUrl,
			requester,
		};

		return track;
	} catch (error) {
		throw new RangeError(`Argument "data" is not a valid track: ${error.message}`);
	}
}
