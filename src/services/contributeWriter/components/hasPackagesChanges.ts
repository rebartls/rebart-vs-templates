import { IPackageConfiguration, ISetup } from "../types";

export enum ChangeType {
	NO_CHANGE,
	UNKNOWN_PROFILE,
	UNKNOWN_COMMAND,
	DIFFERENT_SIZE,
}

export default function (_package: IPackageConfiguration, setup: ISetup, profiles: string[]): ChangeType {
	if (
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		!_package.contributes.commands ||
		_package.contributes.commands.length !== setup.contribution.commands.length ||
		_package.contributes.submenus.length !== setup.contribution.subMenus.length ||
		// 1 must be added to menus of the setup because these variable doesn't contain the explorer context
		Object.keys(_package.contributes.menus).length !== Object.keys(setup.contribution.menus).length + 1
	) {
		return ChangeType.DIFFERENT_SIZE;
	}

	for (const entry of _package.contributes.commands) {
		const commandSplit = entry.command.split(".");
		const commandProfile = commandSplit[commandSplit.length - 2];

		if (commandProfile !== "template" && profiles.length > 0 && !profiles.find((x) => x === commandProfile)) {
			return ChangeType.UNKNOWN_PROFILE;
		}

		if (!setup.contribution.commands.find((x) => x.command === entry.command && x.title === entry.title)) {
			return ChangeType.UNKNOWN_COMMAND;
		}
	}

	return ChangeType.NO_CHANGE;
}
