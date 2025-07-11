/**
 * A type that can be either a Promise or a direct value.
 */
export type Awaitable<T> = Promise<T> | T;