import { Collection } from "@discordjs/collection";
import { Sorter } from "../types/Sorter";
import { Node } from "../classes/Node";

/**
 * Sorts an array of nodes based on their CPU load.
 * 
 * This function filters the nodes to include only those that are connected
 * and enabled, then sorts them by their CPU load percentage. The load is 
 * calculated as the ratio of lavalinkLoad to the number of CPU cores, 
 * multiplied by 100. If a node does not have CPU stats, it is considered 
 * to have a load of 0.
 *
 * @param {Array} nodes - The array of nodes to be sorted.
 * @returns {Array} - The sorted array of nodes.
 */
const sorter: Sorter = (nodes: Collection<string, Node>): Collection<string, Node> => {
	return nodes
		.filter((node) => node.connected)
		.filter((node) => node.isEnabled)
		.sort((a, b) => {
			const aload = a.stats.cpu ? (a.stats.cpu.lavalinkLoad / a.stats.cpu.cores) * 100 : 0;
			const bload = b.stats.cpu ? (b.stats.cpu.lavalinkLoad / b.stats.cpu.cores) * 100 : 0;
			return aload - bload;
		});
};

export default sorter;
