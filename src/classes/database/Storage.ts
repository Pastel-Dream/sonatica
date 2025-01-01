import fs from "fs";
import path from "path";
import { Database } from "./Database";

type Data = Record<string, any>;

/**
 * Class representing a storage system for managing data.
 * Implements the Database interface.
 */
export class Storage implements Database {
	public data: Data = {};
	public id: string;
	public shards: number;

	/**
	 * Create a Storage instance.
	 * @param {string} clientId - The client identifier.
	 * @param {number} shards - The number of shards for the database.
	 */
	constructor(clientId: string, shards: number) {
		this.fetch();
		this.id = clientId;
		this.shards = shards;
	}

	/**
	 * Set a value in the storage.
	 * @param {string} key - The key to set the value for.
	 * @param {T} value - The value to set.
	 * @throws Will throw an error if the key is empty.
	 */
	set<T>(key: string, value: T): void {
		if (!key) throw new Error('"key" is empty');

		const keys: string[] = key.split(".");
		if (keys.length === 0) return;

		this.updateData(this.data, keys, value);
		this.save();
	}

	/**
	 * Get a value from the storage.
	 * @param {string} key - The key to retrieve the value for.
	 * @returns {T | undefined} The value associated with the key, or undefined if not found.
	 * @throws Will throw an error if the key is empty.
	 */
	get<T>(key: string): T | undefined {
		if (!key) throw new Error('"key" is empty');
		if (Object.keys(this.data).length === 0) this.fetch();

		return key.split(".").reduce((acc, curr) => acc?.[curr], this.data) ?? null;
	}

	/**
	 * Push a value into an array stored at the specified key.
	 * @param {string} key - The key of the array to push the value into.
	 * @param {T} value - The value to push into the array.
	 * @throws Will throw an error if the key is empty or does not point to an array.
	 */
	push<T>(key: string, value: T): void {
		if (!key) throw new Error('"key" is empty');

		const oldArray = this.get<T[]>(key) || [];
		if (!Array.isArray(oldArray)) throw new Error("Key does not point to an array");

		oldArray.push(value);
		this.set(key, oldArray);
	}

	/**
	 * Delete a value at the specified key.
	 * @param {string} key - The key to delete.
	 * @returns {boolean} True if the key was deleted, false otherwise.
	 * @throws Will throw an error if the key is empty.
	 */
	delete(key: string): boolean {
		if (!key) throw new Error('"key" is empty');

		const keys: string[] = key.split(".");
		if (keys.length === 0) return false;

		const lastKey: string = keys.pop() || "";
		let currentObj: Data = this.data;

		keys.map((k) => {
			if (typeof currentObj[k] === "object") currentObj = currentObj[k];
			else throw new Error(`Key path "${key}" does not exist`);
		});

		if (currentObj && lastKey in currentObj) {
			delete currentObj[lastKey];
			this.save();
			return true;
		}

		return false;
	}

	/**
	 * Update the data object with a new value at the specified keys.
	 * @param {Data} data - The data object to update.
	 * @param {string[]} keys - The keys to navigate through the data object.
	 * @param {any} value - The value to set at the specified keys.
	 */
	private updateData(data: Data, keys: string[], value: any): void {
		let currentObj: Data = data;

		keys.forEach((key, index) => {
			if (index === keys.length - 1) currentObj[key] = value;
			else {
				if (typeof currentObj[key] !== "object") currentObj[key] = {};

				currentObj = currentObj[key];
			}
		});
	}

	/**
	 * Get the file path for the storage data.
	 * @returns {string} The file path for the storage data.
	 */
	private getFilePath() {
		return path.join(__dirname, "..", "..", "..", "datastore", `database-${this.shards}-${this.id}.json`);
	}

	/**
	 * Fetch data from the storage file.
	 * @throws Will throw an error if fetching data fails.
	 */
	fetch() {
		try {
			const directory = path.join(__dirname, "..", "..", "..", "datastore");
			if (!fs.existsSync(directory)) {
				fs.mkdirSync(directory, { recursive: true });
			}

			const filePath = this.getFilePath();

			const rawData = fs.readFileSync(filePath, "utf-8");
			this.data = JSON.parse(rawData) || {};
		} catch (err) {
			if (err.code === "ENOENT") {
				this.data = {};
			} else {
				throw new Error("Failed to fetch data");
			}
		}
	}

	/**
	 * Save the current data to the storage file.
	 * @throws Will throw an error if saving data fails.
	 */
	private save() {
		try {
			const filePath = this.getFilePath();
			fs.writeFileSync(filePath, JSON.stringify(this.data));
		} catch (error) {
			throw new Error("Failed to save data");
		}
	}
}