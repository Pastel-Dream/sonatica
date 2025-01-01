import { TrackData } from "../types/Rest";
import { decode as base64Decode } from "base64-arraybuffer";

export class TrackDecoder {
	private view: DataView;
	private state: { offset: number };
	private buffer: ArrayBuffer;

	constructor(private encoded: string) {
		this.state = { offset: 0 };
	}

	public async decode(): Promise<{ track: TrackData | null; version: number; error?: Error }> {
		if (!this.encoded) return { track: null, version: 0, error: new Error("No encoded data provided") };

		try {
			this.buffer = base64Decode(this.encoded);
		} catch (e) {
			return { track: null, version: 0, error: new Error("Invalid base64: " + e) };
		}

		this.view = new DataView(this.buffer);

		const track: TrackData = {
			encoded: this.encoded,
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
			const value = this.readInt32();
			const flags = (value & 0xc0000000) >>> 30;
			const messageSize = value & 0x3fffffff;
			if (messageSize === 0) {
				throw new Error("Message size: 0");
			}

			let version: number;
			if ((flags & 1) === 0) {
				version = 1;
			} else {
				version = this.readUInt8();
			}

			track.encoded = this.encoded;
			track.info.title = this.readString();
			track.info.author = this.readString();
			track.info.length = this.readInt64();
			track.info.identifier = this.readString();
			track.info.isStream = this.readBool();
			if (version >= 2) track.info.uri = this.readNullableString();
			if (version >= 3) track.info.artworkUrl = this.readNullableString();
			if (version >= 3) track.info.isrc = this.readNullableString();
			track.info.sourceName = this.readString();
			track.info.position = this.readInt64();

			return { track, version };
		} catch (e) {
			return { track, version: 0, error: e as Error };
		}
	}

	private readInt16(): number {
		const value = this.view.getInt16(this.state.offset, false);
		this.state.offset += 2;
		return value;
	}

	private readInt32(): number {
		const value = this.view.getInt32(this.state.offset, false);
		this.state.offset += 4;
		return value;
	}

	private readInt64(): number {
		const high = this.view.getInt32(this.state.offset, false);
		const low = this.view.getUint32(this.state.offset + 4, false);
		this.state.offset += 8;
		return high * 2 ** 32 + low;
	}

	private readUInt8(): number {
		const value = this.view.getUint8(this.state.offset);
		this.state.offset += 1;
		return value;
	}

	private readBool(): boolean {
		const value = this.view.getUint8(this.state.offset);
		this.state.offset += 1;
		return value !== 0;
	}

	private readString(): string {
		const size = this.readInt16();
		const bytes = new Uint8Array(this.buffer, this.state.offset, size);
		this.state.offset += size;
		return new TextDecoder().decode(bytes);
	}

	private readNullableString(): string | null {
		if (!this.readBool()) return null;
		return this.readString();
	}
}
