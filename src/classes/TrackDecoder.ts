import { TrackData } from "../types/Rest";

/**
 * Class for decoding track data from a base64 encoded string.
 */
export class TrackDecoder {
	private view: DataView;
	private state: { offset: number };
	private buffer: ArrayBuffer;

	/**
	 * Creates an instance of TrackDecoder.
	 * @param {string} encoded - The base64 encoded track data.
	 */
	constructor(private encoded: string) {
		this.state = { offset: 0 };
	}

	/**
	 * Decodes the encoded track data.
	 * @returns {Promise<{ track: TrackData | null; version: number; error?: Error }>} The decoded track data, version, and any error encountered.
	 */
	public async decode(): Promise<{ track: TrackData | null; version: number; error?: Error }> {
		if (!this.encoded) return { track: null, version: 0, error: new Error("No encoded data provided") };

		try {
			this.buffer = this.base64ToArrayBuffer(this.encoded);
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

	/**
	 * Converts a base64 string to an ArrayBuffer.
	 * @param {string} base64 - The base64 string to convert.
	 * @returns {ArrayBuffer} The resulting ArrayBuffer.
	 */
	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binaryString = atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/**
	 * Reads a 16-bit signed integer from the buffer.
	 * @returns {number} The 16-bit signed integer value.
	 */
	private readInt16(): number {
		const value = this.view.getInt16(this.state.offset, false);
		this.state.offset += 2;
		return value;
	}

	/**
	 * Reads a 32-bit signed integer from the buffer.
	 * @returns {number} The 32-bit signed integer value.
	 */
	private readInt32(): number {
		this.validateBuffer(4);
		const value = this.view.getInt32(this.state.offset, false);
		this.state.offset += 4;
		return value;
	}

	/**
	 * Reads a 64-bit integer from the buffer.
	 * @returns {number} The 64-bit integer value.
	 */
	private readInt64(): number {
		const high = this.view.getInt32(this.state.offset, false);
		const low = this.view.getUint32(this.state.offset + 4, false);
		this.state.offset += 8;
		return high * 2 ** 32 + low;
	}

	/**
	 * Reads an 8-bit unsigned integer from the buffer.
	 * @returns {number} The 8-bit unsigned integer value.
	 */
	private readUInt8(): number {
		const value = this.view.getUint8(this.state.offset);
		this.state.offset += 1;
		return value;
	}

	/**
	 * Reads a boolean value from the buffer.
	 * @returns {boolean} The boolean value.
	 */
	private readBool(): boolean {
		const value = this.view.getUint8(this.state.offset);
		this.state.offset += 1;
		return value !== 0;
	}

	/**
	 * Reads a string from the buffer.
	 * @returns {string} The decoded string.
	 */
	private readString(): string {
		const size = this.readInt16();
		const bytes = new Uint8Array(this.buffer, this.state.offset, size);
		this.state.offset += size;
		return new TextDecoder().decode(bytes);
	}

	/**
	 * Reads a nullable string from the buffer.
	 * @returns {string | null} The decoded string or null if not present.
	 */
	private readNullableString(): string | null {
		if (!this.readBool()) return null;
		return this.readString();
	}

	/**
	 * Validates the buffer size to prevent overflow.
	 * @param {number} size - The size to validate against the buffer.
	 * @throws {Error} If the buffer size is exceeded.
	 */
	private validateBuffer(size: number): void {
		if (this.state.offset + size > this.buffer.byteLength) throw new Error("Buffer overflow");
	}
}
