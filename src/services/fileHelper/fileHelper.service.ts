import { mkdir, readFile, stat, writeFile } from "fs/promises";
import gateKeeper from "../../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../../components/logger/logger";
import getFilesFromPath from "./components/getFilesFromPath";
import ensurePathIsCreated from "./components/ensurePathIsCreated";
import { window } from "vscode";
import { Stats } from "fs";

function _fileHelper() {
	const logger = createLoggerInstance("fileHelper");

	const readBuffer = (buffer: Buffer): string => {
		gateKeeper.notUndefined(buffer, "Buffer");
		const content = buffer.toString();
		gateKeeper.notUndefined(content, "Parsed buffer content");
		return content;
	};

	return {
		readBuffer,
		async createFile<T>(path: string, name: string, content: T) {
			gateKeeper.notUndefined([path, name, content], "Create file properties");
			await ensurePathIsCreated(path);
			await writeFile(`${path}/${name}`, JSON.stringify(content, null, 2));
		},
		async createFolder(path: string, name: string): Promise<void> {
			gateKeeper.notUndefined([path, name], "Create folder properties");
			await ensurePathIsCreated(path);
			path = `${path}/${name}`;

			try {
				await mkdir(path, { recursive: false });
			} catch {
				window.showErrorMessage(`Couldn't create folder ${name} on path ${path}`);
			}
		},
		async readFilesFromPath(path: string, filter?: RegExp): Promise<string[]> {
			gateKeeper.notUndefined(path, "Folder path");
			await ensurePathIsCreated(path);
			return await getFilesFromPath(path, 0, [], filter);
		},
		async readFile(path: string): Promise<Buffer | undefined> {
			gateKeeper.notUndefined(path, "File path");
			let stats: Stats;

			try {
				stats = await stat(path);
			} catch {
				window.showErrorMessage(`Couldn't read stats of file on path ${path}`);
				return;
			}

			if (!stats.isFile()) {
				throw logger.logCritical(`Path ${path} is not a file`);
			}

			try {
				return await readFile(path);
			} catch {
				window.showErrorMessage(`Couldn't read file on path ${path}`);
			}
		},
		parseBuffer<T>(buffer: Buffer): T {
			gateKeeper.notUndefined(buffer, "Buffer");
			logger.logDebug("Start to read buffer");
			const stringContent = readBuffer(buffer);
			gateKeeper.notUndefined(stringContent, "String buffer content");
			logger.logDebug(stringContent, "String content");
			const content = JSON.parse(stringContent) as T;
			gateKeeper.notUndefined(content, "Parsed buffer content");
			logger.logDebug(content, "Parsed string content");
			return content;
		},
	};
}

const fileHelper = _fileHelper();
export default fileHelper;
