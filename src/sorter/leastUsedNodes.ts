import { Sorter } from "../types/Sorter";

const sorter: Sorter = (nodes) => {
	return nodes
		.filter((node) => node.connected)
		.filter((node) => node.isEnabled)
		.sort((a, b) => a.stats.playingPlayers - b.stats.playingPlayers);
};

export default sorter;
