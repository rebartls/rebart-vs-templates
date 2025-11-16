import { CancellationTokenSource } from "vscode";
import { ITemplateConfiguration } from "../../../types";
import templateHelper from "../../templateHelper/templateHelper.service";
import { createLoggerInstance } from "../../../components/logger/logger";

export default async function (
	configuration: ITemplateConfiguration,
	defaultVariables: Map<string, string>,
	configPath: string,
	context: { path: string }
): Promise<void> {
	const logger = createLoggerInstance("getTemplateCommand");
	const cancelToken = new CancellationTokenSource().token;
	defaultVariables.set("rootPath", context.path);
	logger.logDebug(`Set value of rootPath to '${context.path}'.`);

	for (const step of configuration.steps) {
		let variables = await templateHelper.getInputVariables(step.inputs, defaultVariables, cancelToken);
		variables = await templateHelper.getValues(step.values, variables);
		console.log(variables.get("rootPath"));
		await templateHelper.processOutputs(step.outputs, configPath, variables);
	}
}
