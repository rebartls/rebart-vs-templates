import { isMap } from "util/types";
import gateKeeper from "../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../components/logger/logger";

export function parseValueWithVariables(value: string, variables: Record<string, string> | Map<string, string>) {
	const logger = createLoggerInstance("variableParser.parseValueWithVariables");
	gateKeeper.notUndefined([value, variables], "Properties");
	logger.logDebug(`Parsing '${value}' with variables`);

	if (isMap(variables) && variables.size > 0) {
		for (const key of variables.keys()) {
			const variableValue = variables.get(key);
			gateKeeper.notUndefined(variableValue, `Value of variable ${key}`);
			logger.logDebug(`Replace key '${key}' with value '${variableValue}' if available.`);
			value = value.replaceAll(RegExp(`{${key}}`, "gi"), variableValue!);
			logger.logDebug(value, `Value after replacing key '${key}'`);
		}
	} else {
		const recordVariables = variables as Record<string, string>;
		const keys = Object.keys(recordVariables);

		if (keys.length > 0) {
			for (const key of keys) {
				const variableValue = recordVariables[key];
				gateKeeper.notUndefined(variableValue, `Value of variable ${key}`);
				logger.logDebug(`Replace key '${key}' with value '${variableValue}' if available.`);
				value = value.replaceAll(RegExp(`{${key}}`, "gi"), variableValue);
				logger.logDebug(value, `Value after replacing key '${key}'`);
			}
		}
	}

	logger.logDebug(value, "Parsed value result");
	return value;
}
