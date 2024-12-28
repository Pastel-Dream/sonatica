import { Collection } from "@discordjs/collection";
import { Node } from "../classes/Node";

export interface Sorter {
	(nodes: Collection<string, Node>): Collection<string, Node>;
}
