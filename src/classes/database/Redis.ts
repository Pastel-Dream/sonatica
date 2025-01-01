import { Redis as IORedis } from "ioredis";
import { Database } from "./Database";

export class Redis implements Database {
	public static ttl: number = 86400;
	public redis: IORedis;
	public id: string;
	public shards: number;

	constructor(redisUrl: string, clientId: string, shards: number) {
		this.redis = new IORedis(redisUrl);
		this.shards = shards;
		this.id = clientId;
	}

	public async set(key: string, data: any) {
		await this.redis.set(this.replaceKey(key), JSON.stringify(data), "EX", Redis.ttl);
	}

	public async get(key: string) {
		return JSON.parse(await this.redis.get(this.replaceKey(key)));
	}

	public async delete(key: string) {
		await this.redis.del(this.replaceKey(key));
		return true;
	}

	private replaceKey(key: string) {
		return `${key}_${this.id}_${this.shards}`;
	}
}
