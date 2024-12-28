import { Node } from "../classes/Node";
import { Collection } from "@discordjs/collection";

export default (nodes: Collection<string, Node>): Collection<string, Node> => {
	return nodes
		.filter((node) => node.connected)
		.filter((node) => node.isEnabled)
		.sort((a, b) => a.stats.playingPlayers - b.stats.playingPlayers);
};
