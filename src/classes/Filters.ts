import { Band } from "../types/Filters";
import { Player } from "./Player";
import * as equlizers from "../utils/equlizers";

/**
 * Class representing a collection of audio filters.
 */
export class Filters {
	/** @type {distortionOptions | null} */
	public distortion: distortionOptions | null;
	/** @type {Band[]} */
	public equalizer: Band[];
	/** @type {karaokeOptions | null} */
	public karaoke: karaokeOptions | null;
	/** @type {Player} */
	public player: Player;
	/** @type {rotationOptions | null} */
	public rotation: rotationOptions | null;
	/** @type {timescaleOptions | null} */
	public timescale: timescaleOptions | null;
	/** @type {vibratoOptions | null} */
	public vibrato: vibratoOptions | null;
	/** @type {number} */
	public volume: number;
	/** @type {{ [key: string]: boolean }} */
	private filterStatus: {
		[key: string]: boolean;
	};

	/**
	 * Create a Filters instance.
	 * @param {Player} player - The player associated with the filters.
	 */
	constructor(player: Player) {
		this.distortion = null;
		this.equalizer = [];
		this.karaoke = null;
		this.player = player;
		this.rotation = null;
		this.timescale = null;
		this.vibrato = null;
		this.volume = 1.0;
		this.filterStatus = {
			bassboost: false,
			distort: false,
			eightD: false,
			karaoke: false,
			nightcore: false,
			slowmo: false,
			soft: false,
			trebleBass: false,
			tv: false,
			vaporwave: false,
		};
	}

	/**
	 * Get the current filters.
	 * @returns {{ distortion: distortionOptions | null, equalizer: Band[], karaoke: karaokeOptions | null, rotation: rotationOptions | null, timescale: timescaleOptions | null, vibrato: vibratoOptions | null, volume: number }}
	 */
	public getFilters() {
		const { distortion, equalizer, karaoke, rotation, timescale, vibrato, volume } = this;

		return { distortion, equalizer, karaoke, rotation, timescale, vibrato, volume };
	}

	/**
	 * Update the filters on the player.
	 * @returns {Promise<this>}
	 */
	public async updateFilters(): Promise<this> {
		await this.player.node.rest.request("PATCH", `/sessions/${this.player.node.sessionId}/players/${this.player.guild}?noReplace=false`, {
			filters: this.getFilters(),
		});

		return this;
	}

	/**
	 * Apply a filter to the Filters instance.
	 * @param {{ property: T; value: Filters[T] }} filter - The filter to apply.
	 * @param {boolean} [updateFilters=true] - Whether to update the filters after applying.
	 * @returns {this}
	 */
	private applyFilter<T extends keyof Filters>(filter: { property: T; value: Filters[T] }, updateFilters: boolean = true): this {
		this[filter.property] = filter.value as this[T];
		if (updateFilters) {
			this.updateFilters();
		}
		return this;
	}

	/**
	 * Set the status of a specific filter.
	 * @param {keyof availableFilters} filter - The filter to set the status for.
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	private setFilterStatus(filter: keyof availableFilters, status: boolean): this {
		this.filterStatus[filter] = status;
		return this;
	}

	/**
	 * Set the equalizer bands.
	 * @param {Band[]} [bands] - The bands to set.
	 * @returns {this}
	 */
	public setEqualizer(bands?: Band[]): this {
		return this.applyFilter({ property: "equalizer", value: bands });
	}

	/**
	 * Apply the eightD filter.
	 * @returns {this}
	 */
	public eightD(): this {
		return this.setRotation({ rotationHz: 0.2 }).setFilterStatus("eightD", true);
	}

	/**
	 * Apply the bass boost filter.
	 * @returns {this}
	 */
	public bassBoost(): this {
		return this.setEqualizer(equlizers.bassBoostEqualizer).setFilterStatus("bassboost", true);
	}

	/**
	 * Apply the nightcore filter.
	 * @returns {this}
	 */
	public nightcore(): this {
		return this.setTimescale({
			speed: 1.1,
			pitch: 1.125,
			rate: 1.05,
		}).setFilterStatus("nightcore", true);
	}

	/**
	 * Apply the slow motion filter.
	 * @returns {this}
	 */
	public slowmo(): this {
		return this.setTimescale({
			speed: 0.7,
			pitch: 1.0,
			rate: 0.8,
		}).setFilterStatus("slowmo", true);
	}

	/**
	 * Apply the soft filter.
	 * @returns {this}
	 */
	public soft(): this {
		return this.setEqualizer(equlizers.softEqualizer).setFilterStatus("soft", true);
	}

	/**
	 * Apply the TV filter.
	 * @returns {this}
	 */
	public tv(): this {
		return this.setEqualizer(equlizers.tvEqualizer).setFilterStatus("tv", true);
	}
	/**
	 * Apply the treble bass filter.
	 * @returns {this}
	 */
	public trebleBass(): this {
		return this.setEqualizer(equlizers.trebleBassEqualizer).setFilterStatus("trebleBass", true);
	}

	/**
	 * Apply the vaporwave filter.
	 * @returns {this}
	 */
	public vaporwave(): this {
		return this.setEqualizer(equlizers.vaporwaveEqualizer).setTimescale({ pitch: 0.55 }).setFilterStatus("vaporwave", true);
	}

	/**
	 * Apply the distortion filter.
	 * @returns {this}
	 */
	public distort(): this {
		return this.setDistortion({
			sinOffset: 0,
			sinScale: 0.2,
			cosOffset: 0,
			cosScale: 0.2,
			tanOffset: 0,
			tanScale: 0.2,
			offset: 0,
			scale: 1.2,
		}).setFilterStatus("distort", true);
	}


	/**
	 * Set filter 
	 * @param {keyof availableFilters} filter
	 * @param {boolean} status 
	 * @returns {this}
	 */
	public setFilter(filter: keyof availableFilters | string, status: boolean) {
		if (!status && typeof status !== "boolean") throw new Error("Status must be a boolean");
		switch (filter) {
			case "bassboost":
				this.setBassBoost(status);
				break;
			case "distort":
				this.setDistort(status);
				break;
			case "eightD":
				this.setEightD(status);
				break;
			case "nightcore":
				this.setNightcore(status);
				break;
			case "slowmo":
				this.setSlowmo(status);
				break;
			case "soft":
				this.setSoft(status);
				break;
			case "trebleBass":
				this.setTrebleBass(status);
				break;
			case "tv":
				this.setTV(status);
				break;
			case "vaporwave":
				this.setVaporwave(status);
				break;
			default:
				throw new Error("Invalid filter provided");
		}
		return this;
	}
	/**
	 * Set the karaoke options.
	 * @param {karaokeOptions} [karaoke] - The karaoke options to set.
	 * @returns {this}
	 */
	public setKaraoke(karaoke?: karaokeOptions): this {
		return this.applyFilter({
			property: "karaoke",
			value: karaoke,
		}).setFilterStatus("karaoke", true);
	}

	/**
	 * Set the timescale options.
	 * @param {timescaleOptions} [timescale] - The timescale options to set.
	 * @returns {this}
	 */
	public setTimescale(timescale?: timescaleOptions): this {
		return this.applyFilter({ property: "timescale", value: timescale });
	}

	/**
	 * Set the vibrato options.
	 * @param {vibratoOptions} [vibrato] - The vibrato options to set.
	 * @returns {this}
	 */
	public setVibrato(vibrato?: vibratoOptions): this {
		return this.applyFilter({ property: "vibrato", value: vibrato });
	}

	/**
	 * Set the rotation options.
	 * @param {rotationOptions} [rotation] - The rotation options to set.
	 * @returns {this}
	 */
	public setRotation(rotation?: rotationOptions): this {
		return this.applyFilter({ property: "rotation", value: rotation });
	}

	/**
	 * Set the distortion options.
	 * @param {distortionOptions} [distortion] - The distortion options to set.
	 * @returns {this}
	 */
	public setDistortion(distortion?: distortionOptions): this {
		return this.applyFilter({ property: "distortion", value: distortion });
	}

	/**
	 * Set the treble bass options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	*/
	public setBassBoost(status: boolean): this {
		return this.setEqualizer(equlizers.bassBoostEqualizer).setFilterStatus("bassboost", status);
	}

	/**
	 * Set the distort options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	public setDistort(status: boolean): this {
		return this.setDistortion({
			sinOffset: 0,
			sinScale: 0.2,
			cosOffset: 0,
			cosScale: 0.2,
			tanOffset: 0,
			tanScale: 0.2,
			offset: 0,
			scale: 1.2,
		}).setFilterStatus("distort", status);
	}

	/**
	 * Set the 8D options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	public setEightD(status: boolean): this {
		return this.setRotation({ rotationHz: 0.2 }).setFilterStatus("eightD", status);
	}
	/**
	 * Set the nightcore options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	*/
	public setNightcore(status: boolean): this {
		return this.setTimescale({
			speed: 1.1,
			pitch: 1.125,
			rate: 1.05,
		}).setFilterStatus("nightcore", status);
	}
	/**
	 * Set the slowmo options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	*/
	public setSlowmo(status: boolean): this {
		return this.setTimescale({
			speed: 0.7,
			pitch: 1.0,
			rate: 0.8,
		}).setFilterStatus("slowmo", status);
	}
	/**
	 * Set the soft options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	*/
	public setSoft(status: boolean): this {
		return this.setEqualizer(equlizers.softEqualizer).setFilterStatus("soft", status);
	}
	/**
	 * Set the treble bass options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	public setTrebleBass(status: boolean): this {
		return this.setEqualizer(equlizers.trebleBassEqualizer).setFilterStatus("trebleBass", status);
	}
	/**
	 * Set the TV options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	public setTV(status: boolean): this {
		return this.setEqualizer(equlizers.tvEqualizer).setFilterStatus("tv", status);
	}

	/**
	 * Set the vaporwave options
	 * @param {boolean} status - The status to set.
	 * @returns {this}
	 */
	public setVaporwave(status: boolean): this {
		return this.setEqualizer(equlizers.vaporwaveEqualizer).setTimescale({ pitch: 0.55 }).setFilterStatus("vaporwave", status);
	}

	/**
	 * Clear all filters.
	 * @returns {Promise<this>}
	 */
	public async clearFilters(): Promise<this> {
		this.filterStatus = {
			bassboost: false,
			distort: false,
			eightD: false,
			karaoke: false,
			nightcore: false,
			slowmo: false,
			soft: false,
			trebleBass: false,
			tv: false,
			vaporwave: false,
		};

		this.player.filters = new Filters(this.player);
		this.setEqualizer([]);
		this.setDistortion(null);
		this.setKaraoke(null);
		this.setRotation(null);
		this.setTimescale(null);
		this.setVibrato(null);

		await this.updateFilters();
		return this;
	}

	/**
	 * Get the status of a specific filter.
	 * @param {keyof availableFilters} filter - The filter to get the status for.
	 * @returns {boolean}
	 */
	public getFilterStatus(filter: keyof availableFilters): boolean {
		return this.filterStatus[filter];
	}
}

/**
 * Options for timescale adjustments.
 */
interface timescaleOptions {
	/** The speed factor for the timescale. */
	speed?: number;
	/** The pitch adjustment for the timescale. */
	pitch?: number;
	/** The rate of the timescale adjustment. */
	rate?: number;
}

/**
 * Options for vibrato effects.
 */
interface vibratoOptions {
	/** The frequency of the vibrato effect. */
	frequency: number;
	/** The depth of the vibrato effect. */
	depth: number;
}

/**
 * Options for rotation effects.
 */
interface rotationOptions {
	/** The rotation frequency in Hertz. */
	rotationHz: number;
}

/**
 * Options for karaoke effects.
 */
interface karaokeOptions {
	/** The level of the karaoke effect. */
	level?: number;
	/** The mono level for the karaoke effect. */
	monoLevel?: number;
	/** The band to filter for the karaoke effect. */
	filterBand?: number;
	/** The width of the filter for the karaoke effect. */
	filterWidth?: number;
}

/**
 * Options for distortion effects.
 */
interface distortionOptions {
	/** The offset for the sine wave distortion. */
	sinOffset?: number;
	/** The scale for the sine wave distortion. */
	sinScale?: number;
	/** The offset for the cosine wave distortion. */
	cosOffset?: number;
	/** The scale for the cosine wave distortion. */
	cosScale?: number;
	/** The offset for the tangent wave distortion. */
	tanOffset?: number;
	/** The scale for the tangent wave distortion. */
	tanScale?: number;
	/** A general offset for the distortion. */
	offset?: number;
	/** A general scale for the distortion. */
	scale?: number;
}

/**
 * Available filter options.
 */
interface availableFilters {
	/** Indicates if bass boost is enabled. */
	bassboost: boolean;
	/** Indicates if distortion is enabled. */
	distort: boolean;
	/** Indicates if 8D audio is enabled. */
	eightD: boolean;
	/** Indicates if karaoke is enabled. */
	karaoke: boolean;
	/** Indicates if nightcore effect is enabled. */
	nightcore: boolean;
	/** Indicates if slow motion effect is enabled. */
	slowmo: boolean;
	/** Indicates if soft effect is enabled. */
	soft: boolean;
	/** Indicates if treble bass effect is enabled. */
	trebleBass: boolean;
	/** Indicates if TV effect is enabled. */
	tv: boolean;
	/** Indicates if vaporwave effect is enabled. */
	vaporwave: boolean;
}
