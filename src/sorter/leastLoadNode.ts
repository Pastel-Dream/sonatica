import { Sorter } from "../types/Sorter";

const sorter: Sorter = (nodes) => {
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
