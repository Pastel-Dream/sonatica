import { Band } from "../types/Filters";
import { Player } from "./Player";
import * as equlizers from "../utils/equlizers";

export class Filters {
	public distortion: distortionOptions | null;
	public equalizer: Band[];
	public karaoke: karaokeOptions | null;
	public player: Player;
	public rotation: rotationOptions | null;
	public timescale: timescaleOptions | null;
	public vibrato: vibratoOptions | null;
	public volume: number;
	private filterStatus: {
		[key: string]: boolean;
	};

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

	public getFilters() {
		const { distortion, equalizer, karaoke, rotation, timescale, vibrato, volume } = this;

		return { distortion, equalizer, karaoke, rotation, timescale, vibrato, volume };
	}

	public async updateFilters(): Promise<this> {
		

		await this.player.node.rest.request("PATCH", `/sessions/${this.player.node.sessionId}/players/${this.player.guild}?noReplace=false`, {
			filters: this.getFilters(),
		});

		return this;
	}

	private applyFilter<T extends keyof Filters>(filter: { property: T; value: Filters[T] }, updateFilters: boolean = true): this {
		this[filter.property] = filter.value as this[T];
		if (updateFilters) {
			this.updateFilters();
		}
		return this;
	}

	private setFilterStatus(filter: keyof availableFilters, status: boolean): this {
		this.filterStatus[filter] = status;
		return this;
	}

	public setEqualizer(bands?: Band[]): this {
		return this.applyFilter({ property: "equalizer", value: bands });
	}

	public eightD(): this {
		return this.setRotation({ rotationHz: 0.2 }).setFilterStatus("eightD", true);
	}

	public bassBoost(): this {
		return this.setEqualizer(equlizers.bassBoostEqualizer).setFilterStatus("bassboost", true);
	}

	public nightcore(): this {
		return this.setTimescale({
			speed: 1.1,
			pitch: 1.125,
			rate: 1.05,
		}).setFilterStatus("nightcore", true);
	}

	public slowmo(): this {
		return this.setTimescale({
			speed: 0.7,
			pitch: 1.0,
			rate: 0.8,
		}).setFilterStatus("slowmo", true);
	}

	public soft(): this {
		return this.setEqualizer(equlizers.softEqualizer).setFilterStatus("soft", true);
	}

	public tv(): this {
		return this.setEqualizer(equlizers.tvEqualizer).setFilterStatus("tv", true);
	}

	public trebleBass(): this {
		return this.setEqualizer(equlizers.trebleBassEqualizer).setFilterStatus("trebleBass", true);
	}

	public vaporwave(): this {
		return this.setEqualizer(equlizers.vaporwaveEqualizer).setTimescale({ pitch: 0.55 }).setFilterStatus("vaporwave", true);
	}

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

	public setKaraoke(karaoke?: karaokeOptions): this {
		return this.applyFilter({
			property: "karaoke",
			value: karaoke,
		}).setFilterStatus("karaoke", true);
	}

	public setTimescale(timescale?: timescaleOptions): this {
		return this.applyFilter({ property: "timescale", value: timescale });
	}

	public setVibrato(vibrato?: vibratoOptions): this {
		return this.applyFilter({ property: "vibrato", value: vibrato });
	}

	public setRotation(rotation?: rotationOptions): this {
		return this.applyFilter({ property: "rotation", value: rotation });
	}

	public setDistortion(distortion?: distortionOptions): this {
		return this.applyFilter({ property: "distortion", value: distortion });
	}

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

	public getFilterStatus(filter: keyof availableFilters): boolean {
		return this.filterStatus[filter];
	}
}

interface timescaleOptions {
	speed?: number;
	pitch?: number;
	rate?: number;
}

interface vibratoOptions {
	frequency: number;
	depth: number;
}

interface rotationOptions {
	rotationHz: number;
}

interface karaokeOptions {
	level?: number;
	monoLevel?: number;
	filterBand?: number;
	filterWidth?: number;
}

interface distortionOptions {
	sinOffset?: number;
	sinScale?: number;
	cosOffset?: number;
	cosScale?: number;
	tanOffset?: number;
	tanScale?: number;
	offset?: number;
	scale?: number;
}

interface availableFilters {
	bassboost: boolean;
	distort: boolean;
	eightD: boolean;
	karaoke: boolean;
	nightcore: boolean;
	slowmo: boolean;
	soft: boolean;
	trebleBass: boolean;
	tv: boolean;
	vaporwave: boolean;
}
