import { Redis as IORedis } from "ioredis";
import { Database } from "./Database";

/**
 * Redis class that implements the Database interface for interacting with a Redis database.
 */
export class Redis implements Database {
	/** Time to live for Redis keys in seconds. */
	public static ttl: number = 86400;
	public redis: IORedis;
	public id: string;
	public shards: number;

	/**
	 * Creates an instance of the Redis class.
	 * @param redisUrl - The URL of the Redis server.
	 * @param clientId - The client identifier.
	 * @param shards - The number of shards.
	 */
	constructor(redisUrl: string, clientId: string, shards: number) {
		this.redis = new IORedis(redisUrl);
		this.shards = shards;
		this.id = clientId;
	}

	/**
	 * Sets a value in the Redis database.
	 * @param key - The key under which the data is stored.
	 * @param data - The data to be stored.
	 */
	public async set(key: string, data: any) {
		if (key.startsWith("sessions")) await this.redis.set(this.replaceKey(key), JSON.stringify(data));
		else await this.redis.set(this.replaceKey(key), JSON.stringify(data), "EX", Redis.ttl);
	}

	/**
	 * Retrieves a value from the Redis database.
	 * @param key - The key of the data to retrieve.
	 * @returns The parsed data stored under the specified key.
	 */
	public async get(key: string) {
		return JSON.parse(await this.redis.get(this.replaceKey(key)));
	}

	/**
	 * Deletes a value from the Redis database.
	 * @param key - The key of the data to delete.
	 * @returns A boolean indicating the success of the deletion.
	 */
	public async delete(key: string) {
		await this.redis.del(this.replaceKey(key));
		return true;
	}

	/**
	 * Replaces the key with a unique identifier based on client ID and shards.
	 * @param key - The original key to be replaced.
	 * @returns The modified key.
	 */
	private replaceKey(key: string) {
		return `${key}_${this.id}_${this.shards}`;
	}
}
