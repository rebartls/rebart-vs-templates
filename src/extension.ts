import { ExtensionContext, workspace } from "vscode";
import { createLoggerInstance } from "./components/logger/logger";
import { getExtensionProperty } from "./components/extensionProperties";
import contributeWriter from "./services/contributeWriter/contributeWriter.service";
import vscodeHelper from "./services/vscodeHelper/vscodeHelper.service";

const logger = createLoggerInstance("Extension");

export function activate(context: ExtensionContext): void {
	logger.log(`Active profiles [${vscodeHelper.getConfigValue<string[]>("profiles", []).join(",")}]`);

	contributeWriter.init(context).catch((err: unknown) => {
		console.error(err);
	});

	context.subscriptions.push(
		workspace.onDidChangeConfiguration((action) => {
			for (const key of ["paths", "profiles"]) {
				if (action.affectsConfiguration(getExtensionProperty(key))) {
					contributeWriter
						.refresh(context)
						.then(() => vscodeHelper.window.showReloadMessage())
						.catch((err: unknown) => {
							logger.logError((err as Error).message, "Failed to refresh extension contributions.");

							vscodeHelper.window.showErrorMessage(
								"Failed to refresh extension contributions. See logs for details."
							);
						});
				}
			}
		})
	);

	logger.log("Extension activated");
}

export function deactivate(): void {
	logger.log("Extension deactivated");
}
