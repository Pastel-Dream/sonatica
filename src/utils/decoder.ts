import { TrackData } from "../types/Rest";
import { decode as base64Decode } from "base64-arraybuffer";

export const decodeTrack = async (encoded: string): Promise<{ track: TrackData | null; version: number; error?: Error }> => {
	let buffer: ArrayBuffer;

	try {
		buffer = base64Decode(encoded);
	} catch (e) {
		return { track: null, version: 0, error: new Error("Invalid base64: " + e) };
	}

	const view = new DataView(buffer);
	const state = { offset: 0 };

	const track: TrackData = {
		encoded: encoded,
		pluginInfo: {},
		info: {
			title: "",
			artworkUrl: "",
			author: "",
			identifier: "",
			isSeekable: false,
			isStream: false,
			length: 0,
			position: 0,
			sourceName: "",
			uri: "",
			isrc: "",
		},
	};

	try {
		const value = readInt32(view, state);
		const flags = (value & 0xc0000000) >>> 30;
		const messageSize = value & 0x3fffffff;
		if (messageSize === 0) {
			throw new Error("Message size: 0");
		}

		let version: number;
		if ((flags & 1) === 0) {
			version = 1;
		} else {
			version = readUInt8(view, state);
		}

		track.encoded = encoded;
		switch (version) {
			case 1:
				track.info.title = readString(view, state, buffer);
				track.info.author = readString(view, state, buffer);
				track.info.length = readInt64(view, state);
				track.info.identifier = readString(view, state, buffer);
				track.info.isSeekable = true;
				track.info.isStream = readBool(view, state);
				track.info.uri = null;
				track.info.artworkUrl = null;
				track.info.isrc = null;
				track.info.sourceName = readString(view, state, buffer);
				track.info.position = readInt64(view, state);
				break;
			case 2:
				track.info.title = readString(view, state, buffer);
				track.info.author = readString(view, state, buffer);
				track.info.length = readInt64(view, state);
				track.info.identifier = readString(view, state, buffer);
				track.info.isSeekable = true;
				track.info.isStream = readBool(view, state);
				track.info.uri = readNullableString(view, state, buffer);
				track.info.artworkUrl = null;
				track.info.isrc = null;
				track.info.sourceName = readString(view, state, buffer);
				track.info.position = readInt64(view, state);
			case 3:
				track.info.title = readString(view, state, buffer);
				track.info.author = readString(view, state, buffer);
				track.info.length = readInt64(view, state);
				track.info.identifier = readString(view, state, buffer);
				track.info.isSeekable = true;
				track.info.isStream = readBool(view, state);
				track.info.uri = readNullableString(view, state, buffer);
				track.info.artworkUrl = readNullableString(view, state, buffer);
				track.info.isrc = readNullableString(view, state, buffer);
				track.info.sourceName = readString(view, state, buffer);
				track.info.position = readInt64(view, state);
		}

		return { track, version };
	} catch (e) {
		return { track, version: 0, error: e };
	}
};

function readInt16(view: DataView, state: { offset: number }): number {
	const value = view.getInt16(state.offset, false);
	state.offset += 2;
	return value;
}

function readInt32(view: DataView, state: { offset: number }): number {
	const value = view.getInt32(state.offset, false);
	state.offset += 4;
	return value;
}

function readInt64(view: DataView, state: { offset: number }): number {
	const high = view.getInt32(state.offset, false);
	const low = view.getUint32(state.offset + 4, false);
	state.offset += 8;
	return high * 2 ** 32 + low;
}

function readUInt8(view: DataView, state: { offset: number }): number {
	const value = view.getUint8(state.offset);
	state.offset += 1;
	return value;
}

function readBool(view: DataView, state: { offset: number }): boolean {
	const value = view.getUint8(state.offset);
	state.offset += 1;
	return value !== 0;
}

function readString(view: DataView, state: { offset: number }, buffer: ArrayBuffer): string {
	const size = readInt16(view, state);
	const bytes = new Uint8Array(buffer, state.offset, size);
	state.offset += size;
	return new TextDecoder().decode(bytes);
}

function readNullableString(view: DataView, state: { offset: number }, buffer: ArrayBuffer): string | null {
	if (!readBool(view, state)) return null;
	return readString(view, state, buffer);
}
