import { extensions } from "vscode";
import { extensionProperties } from "../../../components/extensionProperties";
import getCSharpTemplates from "./getCSharpTemplates";
import gateKeeper from "../../../components/gateKeeper/gateKeeper";
import vscodeHelper from "../../vscodeHelper/vscodeHelper.service";
import { createLoggerInstance } from "../../../components/logger/logger";
import { IConfiguration } from "../types";
import formatHelper from "../../formatHelper/formatHelper.service";

export default function (): IConfiguration {
	const logger = createLoggerInstance("getConfiguration");
	gateKeeper.notUndefined(extensionProperties.name, "Extension name");
	const extension = extensions.getExtension(extensionProperties.name);
	logger.logDebug(extension, `Extension ${extensionProperties.name}`);

	if (!extension) throw new Error("Failed to find the extension");

	const configuration: IConfiguration = {
		variables: {},
		rootPath: "",
		extensionPath: formatHelper.getSync("path")(extension.extensionPath),
		profiles: vscodeHelper.getConfigValue<string[]>("profiles"),
		paths: vscodeHelper.getConfigValue<string[]>("paths", []),
		csharpTemplates: getCSharpTemplates(),
	};

	return configuration;
}
