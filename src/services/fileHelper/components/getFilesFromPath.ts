import { readdir } from "fs/promises";
import gateKeeper from "../../../components/gateKeeper/gateKeeper";

export default async function getFilesFromPath(
	path: string,
	depth: number,
	files: string[],
	filter: RegExp = new RegExp("\\*")
): Promise<string[]> {
	gateKeeper.notUndefined([path, depth, files], "Get files from path properties");
	gateKeeper.depthReached(depth, 5);

	for (const item of await readdir(path, {
		encoding: "utf-8",
		withFileTypes: true,
	})) {
		const name = `${item.parentPath}/${item.name}`;

		if (item.isFile()) {
			if (filter.test(name)) files.push(name);
		} else if (item.isDirectory()) {
			files = await getFilesFromPath(name, depth + 1, files, filter);
		}
	}

	return files;
}
