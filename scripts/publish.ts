import { spawnSync } from "child_process";
import { readFile } from "fs/promises";
import { manual } from "rimraf";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runBuild } from "./build";
import { debug, error, info, LogLevel, setLogLevel } from "./utils";

export async function runPublish() {
	const args = await yargs(hideBin(process.argv))
		.option("logLevel", {
			alias: "ll",
			type: "string",
			default: "info",
			choices: Object.keys(LogLevel),
			description: "Log level.",
		})
		.option("uri", {
			alias: "uri",
			type: "string",
			description: "Uri to gitea.",
			default: "http://rebart-portainer:3000/",
		})
		.option("username", {
			alias: "u",
			type: "string",
			description: "Username for authorization in gitea.",
			demandOption: "Username is required",
		})
		.option("password", {
			alias: "p",
			type: "string",
			description: "Password for authorization in gitea.",
			demandOption: "Password is required",
		})
		.help()
		.alias("help", "h")
		.parse();

	debug("Available arguments", args);
	setLogLevel(args.logLevel);
	await runBuild(false);
	await manual(`${__dirname}/../*.vsix`);
	debug("Removed *.vsix file of extension.");
	const _ = spawnSync("pnpx vsce package --no-dependencies");
	info("Packaging ended successfully.");
	const _package = JSON.parse(await readFile(`${__dirname}/../package.json`, { encoding: "utf-8" }));
	const version = _package["version"];
	debug("Parsed version", version);
	const name = _package["name"];
	debug("Parsed name", name);
	const extensionName = `${name}-${version}.vsix`;
	debug("Parsed extension *.vsix file name", extensionName);

	const response = await fetch(`${args.uri}api/packages/rebart/generic/${name}/${version}/${extensionName}`, {
		method: "PUT",
		headers: {
			Authorization: "Basic " + Buffer.from(args.username + ":" + args.password).toString("base64"),
		} as Record<string, string>,
		body: await readFile(`${__dirname}/../${extensionName}`),
	});

	if (response.status !== 201) {
		const text = await response.text();
		error(text);
	} else info("Publish ended successfully.");
}
