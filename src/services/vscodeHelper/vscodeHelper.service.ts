import { workspace } from "vscode";
import { extensionProperties } from "../../components/extensionProperties";
import { createLoggerInstance } from "../../components/logger/logger";
import { IExtensionConfiguration, IVscodeService } from "./types";
import gateKeeper from "../../components/gateKeeper/gateKeeper";
import windowMessages from "./components/windowMessages";

function create(): IVscodeService {
	const logger = createLoggerInstance("vscodeWizard");
	gateKeeper.notUndefined(extensionProperties.name, "Extension name");
	let configuration = workspace.getConfiguration(extensionProperties.name);
	gateKeeper.notUndefined(configuration, "Extension configuration");
	logger.logDebug(configuration, `Configuration of ${extensionProperties.name}`);
	logger.log(configuration);

	return {
		window: windowMessages,
		refetch(): void {
			configuration = workspace.getConfiguration(extensionProperties.name);
			logger.log(configuration);
			gateKeeper.notUndefined(configuration, "Extension configuration");
			logger.logDebug("Refetch vscode configuration");
		},
		has(key: string): boolean {
			gateKeeper.notUndefined(key, "Key");
			return configuration.has(key);
		},
		get<T>(key: string, defaultValue?: T): T {
			gateKeeper.notUndefined(key, "Extension key");
			let value = configuration.get<T>(key);

			// explicit check required because otherwise a zero value would fallback to the default value
			if (value === undefined) {
				gateKeeper.notUndefined(defaultValue, "Extension property default value");
				value = defaultValue;
			}

			//gateKeeper.notUndefined(value, "Extension value");
			return value!;
		},
		getConfigValue<T>(key: keyof IExtensionConfiguration, defaultValue?: T): T | undefined {
			gateKeeper.notUndefined(key, "Extension key");
			const value = configuration.get<T>(key);

			if (value) logger.logDebug(value, `Config value of ${key}`);
			else logger.logDebug(defaultValue, `Value of ${key} is undefined, fallback to default value`);

			return value ?? defaultValue;
		},
	};
}

const vscodeHelper = create();
export default vscodeHelper;
