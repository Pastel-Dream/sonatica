export interface Database {
	set(key: string, data: any): Awaitable<void>;
	get(key: string): Awaitable<any>;
	delete(key: string): Awaitable<boolean>;
}

export type Awaitable<T> = Promise<T> | T;