import { Collection } from "@discordjs/collection";
import { Node } from "../classes/Node";

/**
 * Interface for sorting nodes.
 * 
 * @interface Sorter
 * @method
 * @param {Collection<string, Node>} nodes - A collection of nodes to be sorted.
 * @returns {Collection<string, Node>} A new collection of sorted nodes.
 */
export interface Sorter {
	(nodes: Collection<string, Node>): Collection<string, Node>;
}
