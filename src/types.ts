import { Formats } from "./services/formatHelper/types";

export interface ITemplateInput {
	type: "text" | "select" | "bool";
	question: string;
	name: string;
	format?: Formats;
	values?: string[];
	optional?: boolean;
}

export interface ITemplateValue {
	name: string;
	value: string;
	format?: Formats;
}

export interface ITemplateOutputFile {
	name: string;
	file: string;
}

export interface ITemplateOutput {
	folder?: string;
	files?: ITemplateOutputFile[];
	name?: string;
	file?: string;
}

export interface ITemplateStep {
	inputs: ITemplateInput[];
	values: ITemplateValue[];
	outputs: ITemplateOutput[];
}

export interface ITemplateConfiguration {
	name: string;
	title: string;
	profile?: string;
	steps: ITemplateStep[];
}
