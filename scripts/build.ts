import { build } from "esbuild";
import { copyFile } from "fs/promises";
import { manual } from "rimraf";

async function run() {
	await manual("out");

	await build({
		entryPoints: [`${__dirname}/../src/extension.ts`],
		bundle: true,
		format: "cjs",
		minify: true,
		sourcemap: false,
		platform: "node",
		outfile: "out/extension.js",
		external: ["vscode"],
		logLevel: "warning",
	});

	await copyFile(`${__dirname}/../src/schema.json`, `${__dirname}/../out/schema.json`);
}

run()
	.then(() => console.log("Build ended successfully"))
	.catch((err) => console.error(err));
