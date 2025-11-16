import { window } from "vscode";
import { ICommandConfiguration } from "../types";

export default function (command: ICommandConfiguration): boolean {
	const messages: string[] = [];

	if (command.inputs) {
		for (const input of command.inputs) {
			if (input.values && input.valueSource) messages.push("Cannot contain both 'values' and 'valueSource'.");
		}
	}

	if (messages.length > 0) {
		window.showWarningMessage(`Command is not valid: ${messages.join(",")}`);
		return false;
	}

	return true;
}
