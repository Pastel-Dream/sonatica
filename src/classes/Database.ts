import { Redis } from "ioredis";

export class Database {
	public redis: Redis;
	public id: string;
	public shards: number;

	constructor(redisUrl: string, clientId: string, shards: number) {
		this.redis = new Redis(redisUrl);
		this.shards = shards;
		this.id = clientId;
	}

	public async set(key: string, data: any) {
		await this.redis.set(this.replaceKey(key), JSON.stringify(data));
	}

	public async get(key: string) {
		return JSON.parse(await this.redis.get(this.replaceKey(key)));
	}

	public async delete(key: string) {
		return await this.redis.del(this.replaceKey(key));
	}

	private replaceKey(key: string) {
		return `${key}_${this.id}_${this.shards}`;
	}
}
