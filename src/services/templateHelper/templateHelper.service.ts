import { CancellationToken } from "vscode";
import { ITemplateInput, ITemplateOutput, ITemplateValue } from "../../types";
import { ITemplateHelper } from "./types";
import inputHelper from "../inputHelper/inputHelper.service";
import gateKeeper from "../../components/gateKeeper/gateKeeper";
import formatHelper from "../formatHelper/formatHelper.service";
import { createLoggerInstance } from "../../components/logger/logger";
import { parseValueWithVariables } from "../../utils/variableParser";
import fileHelper from "../fileHelper/fileHelper.service";

function create(): ITemplateHelper {
	const logger = createLoggerInstance("templateHelper");

	return {
		async getInputVariables(
			inputs: ITemplateInput[],
			variables: Map<string, string>,
			cancelToken: CancellationToken
		): Promise<Map<string, string>> {
			let value: string | undefined;

			for (const input of inputs) {
				switch (input.type) {
					case "bool": {
						const check = await inputHelper.getBoolValue(input.question, cancelToken);
						value = check.toString();
						break;
					}
					case "select": {
						gateKeeper.notUndefined(input.values, "Input select values");
						value = await inputHelper.getSelectValue(input.values!, input.question, cancelToken);
						break;
					}
					case "text":
					default: {
						value = await inputHelper.getValue(input.question, cancelToken);

						if (input.format) {
							const formatter = formatHelper.get(input.format);
							value = await formatter(value);
						}

						break;
					}
				}

				if (!value && !input.optional) {
					throw new Error(`No value provided for input "${input.name}"`);
				}

				variables.set(input.name, value);
			}

			return variables;
		},
		async getValues(values: ITemplateValue[], variables: Map<string, string>): Promise<Map<string, string>> {
			for (const item of values) {
				logger.logDebug(item, "Value item");

				if (variables.has(item.name)) {
					logger.logDebug(`Variable ${item.name} already defined and will be overridden.`);
				}

				let value = parseValueWithVariables(item.value, variables);

				if (item.format && RegExp("{*.}").test(item.value)) {
					const formatter = formatHelper.get(item.format);
					value = await formatter(value);
				}

				gateKeeper.notUndefined(value, "Item value");
				logger.logDebug(`Write '${value}' to variable '${item.name}'`);
				variables.set(item.name, value);
			}

			return variables;
		},
		async processOutputs(
			outputs: ITemplateOutput[],
			configPath: string,
			variables: Map<string, string>
		): Promise<void> {
			const rootPath = variables.get("rootPath");
			gateKeeper.notUndefined(rootPath, "Root path");
			const configFilesPath = `${configPath}/files`;

			for (const output of outputs) {
				let path = rootPath;
				logger.log(output);

				if (output.file && output.name) {
					const buffer = await fileHelper.readFile(`${configFilesPath}/${output.file}`);
					gateKeeper.notUndefined(buffer, `Buffer of file '${configFilesPath}/${output.file}'`);
					const data = fileHelper.readBuffer(buffer!);

					await fileHelper.createFile(
						path!,
						parseValueWithVariables(output.name, variables),
						parseValueWithVariables(data, variables)
					);

					logger.logDebug(`File created on path '${path}'`);
					continue;
				}

				if (output.folder) {
					const name = parseValueWithVariables(output.folder, variables);
					await fileHelper.createFolder(rootPath!, name);
					path = `${rootPath}/${name}`;
					logger.logDebug(`Folder created on path '${path}'`);
				}

				if (output.files) {
					for (const file of output.files) {
						const data = await fileHelper.readFile(`${configFilesPath}/${file.file}`);
						await fileHelper.createFile(path!, parseValueWithVariables(file.name, variables), data!);
						logger.logDebug(`File created on path '${path}'`);
					}
				}
			}
		},
	};
}

const templateHelper = create();
export default templateHelper;
