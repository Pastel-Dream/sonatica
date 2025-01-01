import axios, { AxiosRequestConfig, Method } from "axios";
import { Node } from "./Node";

/**
 * Class representing a REST client.
 */
export class Rest {
	/**
	 * The timeout for requests in milliseconds.
	 * @type {number}
	 */
	public static timeout: number = 5000;

	/**
	 * The password for authorization.
	 * @private
	 * @type {string}
	 */
	private readonly password: string;

	/**
	 * The base URL for the REST API.
	 * @private
	 * @type {string}
	 */
	private readonly url: string;

	/**
	 * Create a Rest instance.
	 * @param {Node} node - The node containing options for the REST client.
	 */
	constructor(node: Node) {
		this.url = `http${node.options.secure ? "s" : ""}://${node.options.host}:${node.options.port}/v4`;
		this.password = node.options.password;
	}

	/**
	 * Make a request to the REST API.
	 * @param {Method} method - The HTTP method to use for the request.
	 * @param {string} endpoint - The endpoint to request.
	 * @param {object | unknown} [payload] - The payload to send with the request.
	 * @returns {Promise<unknown>} The response data or null if an error occurs.
	 */
	public async request(method: Method, endpoint: string, payload?: object | unknown): Promise<unknown> {
		try {
			const response = await axios({
				method,
				data: payload,
				cache: false,
				url: this.url + endpoint,
				timeout: Rest.timeout,
				headers: {
					"Content-Type": "application/json",
					Authorization: this.password,
				},
			} as AxiosRequestConfig);

			return response.data;
		} catch (e) {
			return null;
		}
	}
}
