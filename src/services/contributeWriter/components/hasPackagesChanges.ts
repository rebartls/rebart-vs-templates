import { ICommandSetup, IPackageConfiguration } from "../types";

export enum ChangeType {
	NO_CHANGE,
	UNKNOWN_PROFILE,
	UNKNOWN_COMMAND,
	DIFFERENT_SIZE,
}

export default function (_package: IPackageConfiguration, setup: ICommandSetup, profiles: string[]): ChangeType {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!_package.contributes.commands || _package.contributes.commands.length !== setup.contribution.commands.length) {
		return ChangeType.DIFFERENT_SIZE;
	}

	for (const entry of _package.contributes.commands) {
		// todo implement a better profile check logic (e.g. splitting string value by dot and then checking for profile presence)
		for (const profile of profiles) {
			// if (entry.command.indexOf(profile) < 0) return ChangeType.UNKNOWN_PROFILE;
		}

		if (setup.contribution.commands.findIndex((x) => x.command === entry.command && x.title === entry.title) < 0) {
			return ChangeType.UNKNOWN_COMMAND;
		}
	}

	return ChangeType.NO_CHANGE;
}
