import { SearchResult } from "../types/Rest";

/**
 * CacheManager is a class that manages a cache of search results with a time-to-live (TTL) and a maximum size.
 */
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

	/**
	 * Creates an instance of CacheManager.
	 * @param {number} ttl - The time-to-live for cache entries in milliseconds (default is 30 minutes).
	 * @param {number} maxSize - The maximum number of entries in the cache (default is 100).
	 */
	constructor(ttl: number = 30 * 60 * 1000, maxSize: number = 100) {
		this.ttl = ttl;
		this.maxSize = maxSize;
	}

	/**
	 * Retrieves a cached result by its key.
	 * @param {string} key - The key of the cached result.
	 * @returns {SearchResult | null} - The cached result or null if not found or expired.
	 */
	public get(key: string): SearchResult | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() - cached.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cached.result;
	}

	/**
	 * Sets a result in the cache with the specified key.
	 * @param {string} key - The key to associate with the cached result.
	 * @param {SearchResult} result - The result to cache.
	 */
	public set(key: string, result: SearchResult): void {
		if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);

		this.cache.set(key, {
			result,
			timestamp: Date.now(),
		});
	}

	/**
	 * Clears all entries in the cache.
	 */
	public clear(): void {
		this.cache.clear();
	}

	/**
	 * Gets statistics about the cache.
	 * @returns {{ ttl: number; maxSize: number; size: number }} - An object containing the TTL, max size, and current size of the cache.
	 */
	public getStats(): { ttl: number; maxSize: number; size: number } {
		return {
			ttl: this.ttl,
			maxSize: this.maxSize,
			size: this.cache.size,
		};
	}

	/**
	 * Cleans up expired entries in the cache.
	 * @returns {number} - The number of entries that were removed from the cache.
	 */
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
