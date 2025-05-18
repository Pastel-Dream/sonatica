import { Node } from "../classes/Node";

/**
 * Interface for sorting nodes.
 * 
 * @interface Sorter
 * @method
 * @param {Map<string, Node>} nodes - A map of nodes to be sorted.
 * @returns {Map<string, Node>} A new map of sorted nodes.
 */
export interface Sorter {
	(nodes: Map<string, Node>): Map<string, Node>;
}
