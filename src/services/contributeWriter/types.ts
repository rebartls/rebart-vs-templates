import { ExtensionContext } from "vscode";

export interface ICommandSetup {
	commands: Map<string, (context: { path: string }) => void>;
	contribution: IContributionSetup;
}

export interface IContributionSetup {
	commands: ICommand[];
	menu: IMenuExplorer[];
}

export interface IProfileConfig {
	name: string;
	shortName: string;
	title: string;
}

export interface ICommandInput {
	type: "select" | "text";
	question: string;
	out: string;
	format: string;
	/** TBD - name of the source script to retrieve a string array from. */
	valueSource?: string;
	/** Array of strings which are available to select by the user. */
	values?: string[];
}

export interface ICommandConfiguration {
	group: string;
	when: string;
	execute: string;
	profileConfig: IProfileConfig;
	inputs?: ICommandInput[];
}

export interface ICommand {
	command: string;
	title: string;
}

export interface IMenuExplorer {
	group: string;
	when: string;
	submenu?: string;
	command?: string;
}

export interface IMenu {
	command: string;
	group: string;
}

export interface IPackageConfiguration {
	contributes: IPackageContributes;
}

export type MenuDefinition = {
	"explorer/context": IMenuExplorer[];
} & Record<string, IMenu[]>;

export interface IPackageContributes {
	commands: ICommand[];
	menus: MenuDefinition;
	configuration: object;
}

export interface IContributeWriter {
	refresh(context: ExtensionContext): Promise<void>;
	init(context: ExtensionContext): Promise<void>;
}
