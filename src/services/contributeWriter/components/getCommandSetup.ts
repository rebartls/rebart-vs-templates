import { readdir } from "fs/promises";
import { window } from "vscode";
import { extensionProperties } from "../../../components/extensionProperties";
import { ICommandConfiguration, ICommandSetup } from "../types";
import configurationReader from "../../configurationReader/configurationReader.service";
import fileHelper from "../../fileHelper/fileHelper.service";
import gateKeeper from "../../../components/gateKeeper/gateKeeper";
import validateCommand from "./validateCommand";
import getCommandWithExecute from "./getCommandWithExecute";
import { createLoggerInstance } from "../../../components/logger/logger";

export default async function (paths: string[], workspacePath: string, profiles: string[]): Promise<ICommandSetup> {
	const logger = createLoggerInstance("getCommandSetup");

	const result: ICommandSetup = {
		commands: new Map(),
		contribution: {
			commands: [],
			menu: [],
		},
	};

	const defaultVariables: Record<string, string> = {};

	for (const entry of configurationReader.getVariables().entries()) {
		defaultVariables[entry[0]] = entry[1];
	}

	for (const path of paths) {
		const files: string[] = [];

		for (const entry of await readdir(path, { withFileTypes: true })) {
			if (entry.isFile() && entry.name.endsWith(".json")) files.push(entry.name);
		}

		for (const file of files) {
			const fileData = await fileHelper.readFile(`${path}/${file}`);
			gateKeeper.notUndefined(fileData, `File on '${path}/${file}' returns undefined.`);

			const commandConfigurations = JSON.parse(fileHelper.readBuffer(fileData!)) as {
				entries: ICommandConfiguration[];
			};

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!commandConfigurations.entries || commandConfigurations.entries.length === 0) {
				logger.logDebug(`No command configurations found in file '${path}/${file}'. Skipping file.`);
				continue;
			}

			for (const commandConfiguration of commandConfigurations.entries) {
				// ignore config if the provided profile is not covering the current entry
				if (
					profiles.length > 0 &&
					!profiles.find((x) =>
						[
							commandConfiguration.profileConfig.name,
							commandConfiguration.profileConfig.shortName,
						].includes(x)
					)
				) {
					logger.logDebug(
						`Command '${commandConfiguration.profileConfig.title}' does not match provided profiles. Skipping file.`
					);

					continue;
				}

				if (!validateCommand(commandConfiguration)) {
					logger.logDebug(
						`Command '${commandConfiguration.profileConfig.title}' is not valid. Skipping file.`
					);

					continue;
				}

				const command = `${extensionProperties.name}.${commandConfiguration.profileConfig.name}.${commandConfiguration.profileConfig.shortName}`;

				if (result.commands.has(command)) {
					window.showWarningMessage(`Command '${command}' is already registered.`);
					continue;
				}

				result.commands.set(command, async (context) =>
					getCommandWithExecute(commandConfiguration, defaultVariables, workspacePath, context)
				);

				result.contribution.commands.push({
					command,
					title: commandConfiguration.profileConfig.title,
				});

				result.contribution.menu.push({
					command,
					group: commandConfiguration.group,
					when: commandConfiguration.when,
				});
			}
		}
	}

	const commandName = `${extensionProperties.name}.command.template`;

	if (!result.commands.has(commandName)) {
		logger.logDebug("Adding command template to contributions.");

		const command = {
			group: "2_workspace",
			when: "explorerResourceIsFolder",
			inputs: [
				{
					type: "text",
					question: "Name of the command configuration",
					out: "name",
				},
			],
			execute: `echo '{ "$schema": "{extensionPath}/out/schema.json", "entries":[] }' >> {contextPath}/{name}.json`,
		} as ICommandConfiguration;

		result.commands.set(commandName, async (context) =>
			getCommandWithExecute(command, defaultVariables, workspacePath, context)
		);

		result.contribution.commands.push({
			command: commandName,
			title: "Create new command configuration",
		});

		result.contribution.menu.push({
			command: commandName,
			group: command.group,
			when: command.when,
		});
	}

	return result;
}
