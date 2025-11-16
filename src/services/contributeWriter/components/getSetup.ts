import { window } from "vscode";
import { extensionProperties, getExtensionProperty } from "../../../components/extensionProperties";
import { ICommandConfiguration, IMenu, IExplorerContext, ISetup } from "../types";
import configurationHelper from "../../configurationHelper/configurationHelper.service";
import fileHelper from "../../fileHelper/fileHelper.service";
import gateKeeper from "../../../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../../../components/logger/logger";
import { ITemplateConfiguration } from "../../../types";
import getTemplateCommand from "./getTemplateCommand";
import validateConfiguration from "./validateConfiguration";
import getCommand from "./getCommand";

export default async function (paths: string[], workspacePath: string, profiles: string[]): Promise<ISetup> {
	const logger = createLoggerInstance("getSetup");

	const setup: ISetup = {
		commands: new Map(),
		contribution: {
			commands: [],
			explorerContext: [],
			menus: {},
			subMenus: [],
		},
	};

	const defaultVariables = configurationHelper.getVariables();

	const explorerContext = new Map<string, IExplorerContext>([
		[
			"default",
			{
				group: "navigation@-1",
				when: "explorerResourceIsFolder",
				submenu: "templates",
			},
		],
	]);

	const groupCommands = new Map<string, IMenu[]>([["default", []]]);

	for (const path of paths) {
		const files: string[] = await fileHelper.readFilesFromPath(path, /config\.json$/);
		logger.logDebug(`Found template configuration in path '${path}'.`);

		for (const file of files) {
			const fileData = await fileHelper.readFile(file);
			gateKeeper.notUndefined(fileData, `File on '${file}' returns undefined.`);
			const configuration = JSON.parse(fileHelper.readBuffer(fileData!)) as ITemplateConfiguration;
			logger.log(configuration);

			if (!validateConfiguration(configuration)) continue;

			// ignore config if the provided profile is not covering the current entry
			if (configuration.profile && profiles.length > 0 && !profiles.includes(configuration.profile)) {
				logger.logDebug(`Template '${configuration.title}' does not match provided profiles. Skipping file.`);
				continue;
			}

			const name = `${extensionProperties.name}.${configuration.profile}.${configuration.name}`;

			if (setup.commands.has(name)) {
				window.showWarningMessage(`Template '${name}' is already registered.`);
				continue;
			}

			setup.commands.set(name, async (context) => {
				await getTemplateCommand(configuration, defaultVariables, path, context);
			});

			setup.contribution.commands.push({
				command: name,
				title: configuration.title,
			});

			if (configuration.profile) {
				const submenu = `${configuration.profile}-templates`;

				if (!explorerContext.has(configuration.profile)) {
					explorerContext.set(configuration.profile, {
						group: "navigation@-1",
						when: "explorerResourceIsFolder",
						submenu,
					});

					logger.logDebug(`Added explorer context entry for profile '${configuration.profile}'`);
				}

				if (!groupCommands.has(submenu)) groupCommands.set(submenu, []);

				groupCommands.get(submenu)!.push({
					command: name,
					group: "navigation",
				});

				logger.logDebug(
					`Added menu entry for command '${name}' in profile '${configuration.profile}' / '${submenu}'`
				);
			} else {
				const command = {
					command: name,
					group: "navigation",
				};

				groupCommands.get("default")!.push(command);
				logger.logDebug(command, "Added command to default profile");
			}
		}
	}

	for (const [key, menu] of explorerContext.entries()) {
		const submenu = {
			id: menu.submenu!,
			label: `${key.charAt(0).toUpperCase() + key.slice(1)} Templates`,
		};

		setup.contribution.subMenus.push(submenu);
		logger.logDebug(submenu, "Added submenu");
		const menuValues = groupCommands.get(`${key}-templates`) || [];
		setup.contribution.menus[menu.submenu!] = menuValues;
		logger.logDebug(menuValues, `Added values of submenu '${menu.submenu}'`);
	}

	for (const entry of explorerContext.values()) {
		setup.contribution.explorerContext.push(entry);
	}

	const name = getExtensionProperty("template.configuration");

	if (!setup.commands.has(name)) {
		logger.logDebug("Adding command template to contributions.");

		const command = {
			group: "2_workspace",
			when: "explorerResourceIsFolder",
			inputs: [
				{
					type: "text",
					question: "Name of the template",
					out: "name",
				},
			],
			execute: `echo '{ "$schema": "{extensionPath}/out/schema.json", "name": "{name}", "title": "", "steps": [] }' >> {contextPath}/config.json`,
		} as ICommandConfiguration;

		setup.commands.set(name, async (context) => {
			await getCommand(command, defaultVariables, workspacePath, context);
		});

		setup.contribution.commands.push({
			command: name,
			title: "Create new template configuration",
		});

		setup.contribution.explorerContext.push({
			command: name,
			group: command.group,
			when: command.when,
		});
	}

	return setup;
}
