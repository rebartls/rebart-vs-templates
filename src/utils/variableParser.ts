import gateKeeper from "../components/gateKeeper/gateKeeper";

export function parseValueWithVariables(value: string, variables: Record<string, string>) {
	gateKeeper.notUndefined([value, variables], "Properties");
	const keys = Object.keys(variables);

	if (keys.length > 0) {
		for (const key of keys) {
			gateKeeper.notUndefined(key, "Key");
			const variableValue = variables[key];
			gateKeeper.notUndefined(variableValue, `Value of variable ${key}`);
			value = value.replaceAll(RegExp(`{${key}}`, "ig"), variableValue);
		}
	}

	return value;
}
