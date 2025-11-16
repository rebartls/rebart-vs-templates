import { execSync } from "child_process";

export default function (lengthFullName = 46, lengthShortName = 28): Map<string, string> {
	const output = execSync("dotnet new list").toString("utf-8").split("\n");
	const names: Map<string, string> = new Map();

	for (const entry of output.slice(4, output.length - 2)) {
		const fullName = entry.slice(0, lengthFullName).trimEnd();
		const shortName = entry.slice(lengthFullName, lengthFullName + lengthShortName).trimEnd();
		names.set(fullName, shortName);
	}

	console.log(names);
	return names;
}
