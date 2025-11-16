import { IExtensionConfiguration } from "../vscodeHelper/types";

export interface IConfigurationHelper {
	refetch(): void;
	get<T>(key: keyof IConfiguration): T;
	getVariables(): Map<string, string>;
}

export interface IConfiguration extends IExtensionConfiguration {
	/**
	 * Root path must be defined when calling the create file command,
	 * because the context includes the calling origin
	 */
	rootPath: string;
	/** Path to the extension */
	extensionPath: string;
	/** Variables to overwrite specified words in a command (e.g. "{rootPath}") */
	variables: Record<string, unknown>;
}
