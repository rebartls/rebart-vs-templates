import gateKeeper from "../../components/gateKeeper/gateKeeper";
import { createLoggerInstance } from "../../components/logger/logger";
import getCSharpNamespace from "./components/getCSharpNamespace";
import { getCamelCase, getPascalCase } from "./components/getCaseFormat";
import getPath from "./components/getPath";
import { Formats, FormatsSync, FormatterFunc } from "./types";

const logger = createLoggerInstance("Formatter");

const formats: Record<Formats, FormatterFunc<string | Promise<string>>> = {
	"c#": getCSharpNamespace,
	path: getPath,
	pascalCase: getPascalCase,
	camelCase: getCamelCase,
};

function _formatHelper() {
	const get = (name: Formats): FormatterFunc<string | Promise<string>> => {
		logger.logDebug(`Get format '${name}'`);
		gateKeeper.notUndefined(name, "Format name");
		const formatKey = Object.keys(formats).find((x) => x.toLowerCase() === name.toLowerCase());
		gateKeeper.notUndefined(formatKey, "Format key");
		const formatter = formats[formatKey as Formats];
		gateKeeper.notUndefined(formatter, "Formatter");
		logger.logDebug(`Found formatter '${name}' successfully`);
		return formatter;
	};

	return {
		get,
		getSync(name: FormatsSync): FormatterFunc {
			gateKeeper.notUndefined(name, "Format name");
			const formatter = get(name) as FormatterFunc;
			gateKeeper.notUndefined(formatter, "Formatter");
			return formatter;
		},
	};
}

const formatHelper = _formatHelper();
export default formatHelper;
