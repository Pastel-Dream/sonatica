import { Sorter } from "../types/Sorter";

/**
 * Sorts an array of nodes based on their usage.
 * 
 * This function filters the nodes to include only those that are connected
 * and enabled, then sorts them in ascending order based on the number of
 * playing players in their stats.
 *
 * @param {Array} nodes - The array of nodes to be sorted.
 * @returns {Array} - The sorted array of nodes.
 */
const sorter: Sorter = (nodes) => {
	return nodes
		.filter((node) => node.connected)
		.filter((node) => node.isEnabled)
		.sort((a, b) => a.stats.playingPlayers - b.stats.playingPlayers);
};

export default sorter;
