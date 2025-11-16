import { window } from "vscode";
import { parseValueWithVariables } from "../../../utils/variableParser";
import { ICommandConfiguration } from "../types";
import getCommandInputValue from "./getCommandInputValue";
import vscodeHelper from "../../vscodeHelper/vscodeHelper.service";
import { createLoggerInstance } from "../../../components/logger/logger";

export default async function (
	commandConfiguration: ICommandConfiguration,
	defaultVariables: Record<string, string>,
	workspacePath: string,
	context: { path: string }
) {
	const logger = createLoggerInstance(`getCommandWithExecute - ${context.path}`);

	const variables: Record<string, string> = {
		...defaultVariables,
		workspacePath,
		// quotes needed to add names with whitespaces (e.g. "/Path With Space/" is "/'Path With Space'/")
		contextPath: `'${context.path}'`,
	};

	logger.logDebug(`Preparing to execute command with variables: ${JSON.stringify(variables)}`);

	for (const input of commandConfiguration.inputs ?? []) {
		const value = await getCommandInputValue(input);

		if (variables[input.out]) throw new Error(`Variable ${input.out} already defined`);

		variables[input.out] = value;
	}

	const execute = parseValueWithVariables(commandConfiguration.execute, variables);
	logger.logDebug(`Executing command: ${execute}`);

	try {
		let terminal = window.activeTerminal;

		if (!terminal) {
			logger.logDebug("Found not active terminal, try to create a new one.");
			terminal = window.createTerminal();
			terminal.show();
			setTimeout(() => terminal!.shellIntegration?.executeCommand(execute), 500);
		} else {
			logger.logDebug(`Using active terminal ${terminal.name} to execute command.`);
			terminal.shellIntegration?.executeCommand(execute).read();
		}
	} catch (err) {
		logger.logError(err, "Error executing command.");
		vscodeHelper.window.showErrorMessage("Error executing command. Please review the output logs.");
	}
}
