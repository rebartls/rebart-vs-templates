import { readdirSync } from "fs";
import { basename, extname, join, parse, relative } from "path";
import { workspace } from "vscode";

function findCsprojFile(fileDir: string) {
	const root = parse(fileDir).root;
	let fileName: string | undefined;

	for (let i = 0; i < 25; i++) {
		fileName = readdirSync(fileDir).find((f) => /.\.csproj$/.test(f));

		if (!fileName && fileDir !== root) {
			fileDir = join(fileDir, "..");
		} else {
			break;
		}
	}

	if (!fileName) {
		return;
	}

	return { fileName: fileName, dir: fileDir, fullPath: join(fileDir, fileName) };
}

async function readRootNamespaceFromElement(csprojPath: string) {
	const csproj = await workspace.openTextDocument(csprojPath);
	const matches = csproj.getText().match(/<RootNamespace>([\w.]+)<\/RootNamespace>/);

	if (!matches) {
		return;
	}

	return matches[1];
}

function readRootNamespaceFromFileName(csprojFileName: string) {
	return basename(csprojFileName, extname(csprojFileName));
}

function resolveNamespace(rootNamespace: string, projectRootRelativePath: string): string {
	return join(rootNamespace, projectRootRelativePath)
		.replace(/[/\\]/g, ".")
		.replace(/[^\w.]/g, "_")
		.replace(/[.]{2,}/g, ".")
		.replace(/^[.]+/, "")
		.replace(/[.]+$/, "")
		.split(".")
		.map((s) => (/^[0-9]/.test(s) ? "_" + s : s))
		.join(".");
}

export default async function (path: string): Promise<string> {
	const csprojInfo = findCsprojFile(path);
	console.log(csprojInfo);

	if (!csprojInfo) {
		console.log("couldn't find csproj");
		return "NOT_DEFINED";
	}

	let rootNamespace = await readRootNamespaceFromElement(csprojInfo.fullPath);

	if (!rootNamespace) {
		rootNamespace = readRootNamespaceFromFileName(csprojInfo.fileName);
	}

	const projectRootRelativePath = relative(csprojInfo.dir, path);

	return resolveNamespace(rootNamespace, projectRootRelativePath);
}
