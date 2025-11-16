import { commands, window } from "vscode";
import { IVscodeWindowMessages } from "../types";

function create(): IVscodeWindowMessages {
	return {
		showReloadMessage: () =>
			window.showInformationMessage("Changes detected, please reload the window", "Reload ...").then((x) => {
				if (x) commands.executeCommand("workbench.action.reloadWindow");
			}),
		showErrorMessage: (message: string) => window.showErrorMessage(message).then(),
	};
}

const windowMessages = create();
export default windowMessages;
