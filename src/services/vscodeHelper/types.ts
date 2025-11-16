export interface IExtensionConfiguration {
	/**
	 * If provided only templates from the profiles will be selectable in the menu;
	 * otherwise every command will be available
	 */
	profiles: string[] | undefined;
	/** Paths to the commands */
	paths: string[];
}

export interface IVscodeWindowMessages {
	showReloadMessage(): Thenable<void>;
	showInfoMessage(message: string): Thenable<void>;
	showWarningMessage(message: string): Thenable<void>;
	showErrorMessage(message: string): Thenable<void>;
}

export interface IVscodeService {
	window: IVscodeWindowMessages;
	refetch(): void;
	has(key: string): boolean;
	get<T>(key: string, defaultValue: T): T;
	getConfigValue<T>(key: keyof IExtensionConfiguration): T | undefined;
	getConfigValue<T>(key: keyof IExtensionConfiguration, defaultValue: T): T;
	/** Overrides value of {@link IExtensionConfiguration} */
	set(key: keyof IExtensionConfiguration, value: unknown, isGlobal?: boolean): void;
	/** Add a new value to the configuration */
	add(key: string, value: unknown, isGlobal?: boolean): void;
}
