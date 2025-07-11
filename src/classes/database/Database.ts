import { Awaitable } from "../../types/Utils";

/**
 * Interface representing a simple database.
 */
export interface Database {
	/**
	 * Sets the value for a given key in the database.
	 * @param key - The key to set the data for.
	 * @param data - The data to be stored.
	 * @returns A promise that resolves when the operation is complete.
	 */
	set(key: string, data: any): Awaitable<void>;

	/**
	 * Retrieves the value associated with a given key from the database.
	 * @param key - The key to retrieve the data for.
	 * @returns A promise that resolves to the data associated with the key.
	 */
	get(key: string): Awaitable<any>;

	/**
	 * Deletes the value associated with a given key from the database.
	 * @param key - The key to delete the data for.
	 * @returns A promise that resolves to a boolean indicating success or failure.
	 */
	delete(key: string): Awaitable<boolean>;
}
