import axios, { AxiosRequestConfig, Method } from "axios";
import { Node } from "./Node";

export class Rest {
	private readonly password: string;
	private readonly url: string;

	constructor(node: Node) {
		this.url = `http${node.options.secure ? "s" : ""}://${node.options.host}:${node.options.port}/v4`;
		this.password = node.options.password;
	}

	public async request(method: Method, endpoint: string, payload?: object | unknown): Promise<unknown> {
		try {
			const response = await axios({
				method,
				data: payload,
				cache: false,
				url: this.url + endpoint,
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
