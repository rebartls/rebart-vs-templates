import { Stats } from "fs";
import { mkdir, stat } from "fs/promises";
import gateKeeper from "../../../components/gateKeeper/gateKeeper";
import { window } from "vscode";

export default async function (path: string): Promise<void> {
	gateKeeper.notUndefined(path, "Folder path");
	let stats: Stats | undefined;

	try {
		stats = await stat(path);
	} catch {
		try {
			await mkdir(path, { recursive: true });
		} catch {
			window.showErrorMessage(`Folder on path ${path} not available.`);
		}
	}

	if (stats && !stats.isDirectory()) window.showErrorMessage(`${path} is not a folder.`);
}
