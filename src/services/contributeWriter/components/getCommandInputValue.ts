import gateKeeper from "../../../components/gateKeeper/gateKeeper";
import configurationReader from "../../configurationReader/configurationReader.service";
import inputHelper from "../../inputHelper/inputHelper.service";
import { ICommandInput } from "../types";

export default async function (input: ICommandInput): Promise<string> {
	let value = "";

	switch (input.type) {
		case "select":
			if (input.valueSource) {
				const templates = configurationReader.get<Map<string, string>>("csharpTemplates");
				const keys: string[] = [];

				for (const key of templates.keys()) {
					keys.push(key);
				}

				const template = templates.get(await inputHelper.getSelectValue(keys, input.question));
				gateKeeper.notUndefined(template, "Dotnet template cannot be null.");
				// some dotnet templates have multiple names (e.g. .sln and solution)
				value = template!.split(",")[0];
			} else if (input.values) {
				value = await inputHelper.getSelectValue(input.values, input.question);
			} else {
				throw new Error("Input values must be defined when using type select");
			}

			break;
		case "text":
			value = await inputHelper.getValue(input.question);
			break;
	}

	if (!value) throw new Error("Value of input is undefined");

	return value;
}
