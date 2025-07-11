import { EventOp, LyricsFoundEvent, LyricsLineEvent, LyricsNotFoundEvent, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from "../types/Op";
import { Player } from "./Player";
import { Track, UnresolvedTrack, RepeatMode } from "../types/Player";
import { Sonatica } from "./Sonatica";
import { Node } from "./Node";
import { SearchPlatform } from "../utils/sources";
import { Awaitable } from "../types/Utils";

/**
 * Handles different types of events received from the WebSocket.
 */
export class EventOpHandler {
	constructor(private node: Node, private sonatica: Sonatica) {}

	/**
	 * Handles different types of events received from the WebSocket.
	 * @param {EventOp} payload - The event payload.
	 */
	public handleOp(payload: EventOp): void {
		if (!payload.guildId) return;
		const player = this.sonatica.players.get(payload.guildId);
		if (!player) return;

		const track = player.queue.current;
		switch (payload.type) {
			case "TrackStartEvent":
				this.trackStart(player, <Track>track, payload);
				break;
			case "TrackStuckEvent":
				player.position = 0;
				this.trackStuck(player, <Track>track, payload);
				break;
			case "TrackExceptionEvent":
				player.position = 0;
				this.trackError(player, <Track>track, payload);
				break;
			case "WebSocketClosedEvent":
				player.position = 0;
				this.socketClosed(player, payload);
				break;
			case "TrackEndEvent":
				player.save();
				player.position = 0;
				this.trackEnd(player, <Track>track, payload);
				break;
			case "LyricsFoundEvent":
				this.lyricsFound(player, <Track>track, payload);
				break;
			case "LyricsNotFoundEvent":
				this.lyricsNotFound(player, <Track>track, payload);
				break;
			case "LyricsLineEvent":
				this.lyricsLine(player, <Track>track, payload);
				break;
		}
	}

	/**
	 * Handles the start of a track.
	 * @param {Player} player - The player that is playing the track.
	 * @param {Track} track - The track that started playing.
	 * @param {TrackStartEvent} payload - The event payload.
	 */
	private trackStart(player: Player, track: Track, payload: TrackStartEvent): void {
		player.playing = true;
		player.paused = false;
		this.sonatica.emit("trackStart", player, track);
	}

	/**
	 * Handles the end of a track.
	 * @param {Player} player - The player that was playing the track.
	 * @param {Track} track - The track that ended.
	 * @param {TrackEndEvent} payload - The event payload.
	 */
	private trackEnd(player: Player, track: Track, payload: TrackEndEvent): Awaitable<void> {
		if (player.state === "MOVING" || player.state === "RESUMING") return;

		const { reason } = payload;
		const { queue, repeatMode } = player;
		const { autoPlay } = this.sonatica.options;

		switch (reason) {
			case "loadFailed":
			case "cleanup":
				{
					queue.previous = queue.current;
					queue.current = queue.shift();
					if (!queue.current) return this.queueEnd(player, track, payload);

					this.sonatica.emit("trackEnd", player, track);
					if (autoPlay) player.play();
				}
				break;

			case "replaced":
				{
					this.sonatica.emit("trackEnd", player, track);
					queue.previous = queue.current;
				}
				break;

			default:
				{
					if (track && (repeatMode === RepeatMode.TRACK || repeatMode === RepeatMode.QUEUE)) {
						if (repeatMode === RepeatMode.TRACK) {
							queue.unshift(queue.current);
						} else if (repeatMode === RepeatMode.QUEUE) {
							queue.add(queue.current);
						}

						queue.previous = queue.current;
						queue.current = queue.shift();

						this.sonatica.emit("trackEnd", player, track);
						if (reason === "stopped" && !(queue.current = queue.shift())) return this.queueEnd(player, track, payload);

						if (autoPlay) player.play();
					} else if (queue.length) {
						queue.previous = queue.current;
						queue.current = queue.shift();
						this.sonatica.emit("trackEnd", player, track);
						if (autoPlay) player.play();
					} else {
						this.queueEnd(player, track, payload);
					}
				}
				break;
		}
	}

	/**
	 * Handles a track being stuck.
	 * @param {Player} player - The player that is playing the track.
	 * @param {Track} track - The track that is stuck.
	 * @param {TrackStuckEvent} payload - The event payload.
	 */
	private trackStuck(player: Player, track: Track, payload: TrackStuckEvent): void {
		this.sonatica.emit("trackStuck", player, track, payload);
	}

	/**
	 * Handles a track error.
	 * @param {Player} player - The player that encountered the error.
	 * @param {Track | UnresolvedTrack} track - The track that encountered the error.
	 * @param {TrackExceptionEvent} payload - The event payload.
	 */
	private trackError(player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent): void {
		this.sonatica.emit("trackError", player, <Track>track, payload);
	}

	/**
	 * Handles a WebSocket closure.
	 * @param {Player} player - The player that was affected.
	 * @param {WebSocketClosedEvent} payload - The event payload.
	 */
	private socketClosed(player: Player, payload: WebSocketClosedEvent): void {
		this.sonatica.emit("socketClosed", player, payload);
	}

	/**
	 * Handles a "LyricsFoundEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that received the lyrics.
	 * @param {LyricsFoundEvent} payload - The event payload.
	 */
	private lyricsFound(player: Player, track: Track, payload: LyricsFoundEvent): void {
		this.sonatica.emit("lyricsFound", player, track, payload);
	}

	/**
	 * Handles a "LyricsNotFoundEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that did not receive the lyrics.
	 * @param {LyricsNotFoundEvent} payload - The event payload.
	 */
	private lyricsNotFound(player: Player, track: Track, payload: LyricsNotFoundEvent): void {
		this.sonatica.emit("lyricsNotFound", player, track, payload);
	}

	/**
	 * Handles a "LyricsLineEvent" event.
	 * @param {Player} player - The player that received the event.
	 * @param {Track} track - The track that received the lyrics line.
	 * @param {LyricsLineEvent} payload - The event payload.
	 */
	private lyricsLine(player: Player, track: Track, payload: LyricsLineEvent): void {
		this.sonatica.emit("lyricsLine", player, track, payload);
	}

	/**
	 * Handles the end of a queue.
	 * @param {Player} player - The player that was playing.
	 * @param {Track} track - The last track that was played.
	 * @param {TrackEndEvent} payload - The event payload.
	 */
	private async queueEnd(player: Player, track: Track, payload: TrackEndEvent): Promise<void> {
		player.queue.current = null;
		player.playing = player.isAutoplay;

		if (player.isAutoplay) return await this.handleAutoplay(player, track);

		this.sonatica.emit("queueEnd", player, track, payload);
	}

	/**
	 * Handles autoplay for the player.
	 * @param {Player} player - The player that is autoplaying.
	 * @param {Track | UnresolvedTrack} track - The track that is currently playing.
	 * @returns {Promise<void>} A promise that resolves when the autoplay is handled.
	 */
	private async handleAutoplay(player: Player, track: Track | UnresolvedTrack): Promise<void> {
		const fallbackVideo = "H58vbez_m4E";
		const getMixUrl = (id: string) => `https://www.youtube.com/watch?v=${id}&list=RD${id}`;

		const previousTrack = player.queue.previous || track;
		let identifier = previousTrack.sourceName === "youtube" ? previousTrack.identifier : null;

		if (!identifier) {
			const baseSearch = await player.search({ query: `${previousTrack.title} - ${previousTrack.author}`, source: SearchPlatform["youtube"] }, previousTrack.requester);
			identifier = baseSearch.tracks[0]?.identifier;
		}

		if (!identifier) identifier = fallbackVideo;

		const mixUrl = getMixUrl(identifier);
		let mixResult = await player.search({ query: mixUrl }, previousTrack.requester);

		if (mixResult.loadType === "error" || mixResult.loadType === "empty") {
			const fallbackMixUrl = getMixUrl(fallbackVideo);
			mixResult = await player.search({ query: fallbackMixUrl }, previousTrack.requester);
		}

		const tracks = mixResult?.playlist?.tracks?.filter((t) => t.uri !== track.uri);
		if (!tracks?.length) return;

		const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
		player.queue.add(randomTrack);
		player.play();
	}
}