import { commands, ExtensionContext, workspace } from "vscode";
import { createLoggerInstance } from "../../components/logger/logger";
import configurationHelper from "../configurationHelper/configurationHelper.service";
import getSetup from "./components/getSetup";
import { IContributeWriter, IPackageConfiguration, MenuDefinition } from "./types";
import fileHelper from "../fileHelper/fileHelper.service";
import hasPackagesChanges, { ChangeType } from "./components/hasPackagesChanges";
import vscodeHelper from "../vscodeHelper/vscodeHelper.service";

function create(): IContributeWriter {
	const logger = createLoggerInstance("contributeWriter");
	const packageFileName = "package.json";
	const paths = configurationHelper.get<string[]>("paths");
	const profiles = configurationHelper.get<string[]>("profiles");

	/**
	 * Adds all available commands with a valid template name from the contributes to the context.
	 *
	 * Any contribution of the template contributes will be registered even though the selection
	 * may be not visible for the user (for example when the necessary profile is not active).
	 **/
	const addCommandSubscriptions = async (context: ExtensionContext) => {
		const setup = await getSetup(paths, workspace.workspaceFolders![0].uri.path, profiles);

		for (const command of setup.commands) {
			context.subscriptions.push(commands.registerCommand(command[0], command[1]));
			logger.logDebug(command[0], "Added new command");
		}
	};

	/**
	 * Updates the contribution part of the package file.
	 *
	 * If no active profile is available in the settings, the generic "New from Template ..."
	 * option for the context menu will be added. Otherwise only the specific menu- and sub-menu-
	 * entry of the specified profile is visible for the user
	 *
	 * @param force - if true, the contribution will be updated without any additional check for differences; otherwise the package file is only updated if changes are detected.
	 */
	const updateCommandContributionsOfPackage = async (force: boolean = false) => {
		const extensionPath = configurationHelper.get<string>("extensionPath");
		const buffer = await fileHelper.readFile(`${extensionPath}/${packageFileName}`);
		const _package = JSON.parse(fileHelper.readBuffer(buffer!)) as IPackageConfiguration;
		const setup = await getSetup(paths, workspace.workspaceFolders![0].uri.path, profiles);

		if (!force) {
			const state = hasPackagesChanges(_package, setup, profiles);

			switch (state) {
				case ChangeType.NO_CHANGE:
					logger.logDebug("No changes detected in command contributions, skipping package.json update.");
					return;
				case ChangeType.UNKNOWN_COMMAND:
					logger.logDebug("Detected unknown command contributions, updating package.json.");
					break;
				case ChangeType.UNKNOWN_PROFILE:
					logger.logDebug("Detected unknown profile in command contributions, updating package.json.");
					break;
				case ChangeType.DIFFERENT_SIZE:
					logger.logDebug("Detected different size of command contributions, updating package.json.");
					break;
			}
		} else logger.logDebug("Force to update package.json.");

		_package.contributes.commands = setup.contribution.commands;
		_package.contributes.submenus = setup.contribution.subMenus;

		_package.contributes.menus = {
			"explorer/context": setup.contribution.explorerContext,
			...setup.contribution.menus,
		} as MenuDefinition;

		await fileHelper.createFile(extensionPath, packageFileName, _package);
		logger.log("Updated command contributions, please reload the window to apply changes.");
		await vscodeHelper.window.showReloadMessage();
	};

	return {
		async refresh(context: ExtensionContext) {
			await addCommandSubscriptions(context);
			await updateCommandContributionsOfPackage(true);
		},
		async init(context: ExtensionContext) {
			await addCommandSubscriptions(context);
			await updateCommandContributionsOfPackage();
		},
	};
}

const contributeWriter = create();
export default contributeWriter;
