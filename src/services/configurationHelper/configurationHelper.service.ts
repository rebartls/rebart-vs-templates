import GateKeeper from "../../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../../components/logger/logger";
import vscodeHelper from "../vscodeHelper/vscodeHelper.service";
import getConfiguration from "./components/getConfiguration";
import { IConfiguration, IConfigurationHelper } from "./types";

function create(): IConfigurationHelper {
	const logger = createLoggerInstance("configurationHelper");
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
		// todo write a doc - visualize that this is only for internal variable usage (e.g. in commands)
		getVariables(): Map<string, string> {
			const variables = new Map<string, string>();

			for (const key of ["rootPath", "extensionPath"] as (keyof IConfiguration)[]) {
				logger.logDebug(`Adding variable '${key}' with value '${configuration[key] as string}'`);
				variables.set(key, configuration[key] as string);
			}

			logger.log(variables, "Configuration variables");
			return variables;
		},
	};
}

const configurationHelper = create();
export default configurationHelper;
