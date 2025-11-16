import { ExtensionContext } from "vscode";

export interface IContributeWriter {
	refresh(context: ExtensionContext): Promise<void>;
	init(context: ExtensionContext): Promise<void>;
}

export interface IContributionCommand {
	command: string;
	title: string;
}

export interface IContributionSubmenu {
	id: string;
	label: string;
}

export interface IContributionSetup {
	commands: IContributionCommand[];
	explorerContext: IExplorerContext[];
	menus: Record<string, IMenu[]>;
	subMenus: IContributionSubmenu[];
}

export interface ISetup {
	commands: Map<string, (context: { path: string }) => void>;
	contribution: IContributionSetup;
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
	name: string;
	profile: string;
	title: string;
	inputs?: ICommandInput[];
}

export interface IExplorerContext {
	group: string;
	when?: string;
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
	"explorer/context": IExplorerContext[];
} & Record<string, IMenu[]>;

export interface IPackageContributes {
	commands: IContributionCommand[];
	menus: MenuDefinition;
	configuration: object;
	submenus: IContributionSubmenu[];
}
