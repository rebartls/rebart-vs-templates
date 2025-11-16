import GateKeeper from "../../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../../components/logger/logger";
import vscodeHelper from "../vscodeHelper/vscodeHelper.service";
import getConfiguration from "./components/getConfiguration";
import { IConfiguration } from "./types";

function create() {
	const logger = createLoggerInstance("configurationReader");
	let configuration = getConfiguration();

	return {
		refetch(): void {
			vscodeHelper.refetch();
			configuration = getConfiguration();
			logger.logDebug("Refetch of configuration ended successfully.");
		},
		get<T>(key: keyof IConfiguration): T {
			GateKeeper.notUndefined(key, "Configuration key");
			logger.logDebug(`Fetch configuration value of '${key}'`);
			const value = configuration[key] as T;
			GateKeeper.notUndefined(value, "Configuration value");
			logger.logDebug(value, `Configuration value of '${key}'`);
			return value;
		},
		set(key: keyof IConfiguration, value: unknown): void {
			logger.logDebug({ key, value }, "Parameters");
			GateKeeper.notUndefined(key, "Configuration key");
			GateKeeper.notUndefined(value, "Configuration value");
			configuration[key] = value as never;
			logger.logDebug(`Updated value ${key} to ${configuration[key] as string}`);
		},
		reset(key: keyof IConfiguration): void {
			GateKeeper.notUndefined(key, "Configuration key");
			logger.logDebug(`Reset value of ${key}`);
			configuration[key] = "" as never;
		},
		// todo write a doc - visualize that this is only for internal variable usage (e.g. in commands)
		getVariables(): Map<string, string> {
			const variables = new Map<string, string>();

			for (const key of ["rootPath", "extensionPath", "csharpTemplates"] as (keyof IConfiguration)[]) {
				logger.logDebug(`Adding variable '${key}' with value '${configuration[key] as string}'`);
				variables.set(key, configuration[key] as string);
			}

			logger.log(variables, "Configuration variables");
			return variables;
		},
	};
}

const configurationReader = create();
export default configurationReader;
