import { SearchResult } from "../types/Rest";

export class CacheManager {
	private cache: Map<
		string,
		{
			result: SearchResult;
			timestamp: number;
		}
	> = new Map();

	private readonly ttl: number;
	private readonly maxSize: number;

	constructor(ttl: number = 30 * 60 * 1000, maxSize: number = 100) {
		// default 30 minutes
		this.ttl = ttl;
		this.maxSize = maxSize;
	}

	public get(key: string): SearchResult | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() - cached.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cached.result;
	}

	public set(key: string, result: SearchResult): void {
		if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);

		this.cache.set(key, {
			result,
			timestamp: Date.now(),
		});
	}

	public clear(): void {
		this.cache.clear();
	}

	public getStats(): { ttl: number; maxSize: number; size: number } {
		return {
			ttl: this.ttl,
			maxSize: this.maxSize,
			size: this.cache.size,
		};
	}

	public cleanup(): number {
		const now = Date.now();
		let cleaned = 0;
		for (const [key, value] of this.cache.entries()) {
			if (now - value.timestamp > this.ttl) {
				this.cache.delete(key);
				cleaned++;
			}
		}
		return cleaned;
	}
}
