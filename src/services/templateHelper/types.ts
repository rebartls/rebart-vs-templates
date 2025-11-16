import { CancellationToken } from "vscode";
import { ITemplateInput, ITemplateOutput, ITemplateValue } from "../../types";

export interface ITemplateHelper {
	getInputVariables(
		inputs: ITemplateInput[],
		variables: Map<string, string>,
		cancelToken: CancellationToken
	): Promise<Map<string, string>>;
	getValues(values: ITemplateValue[], variables: Map<string, string>): Promise<Map<string, string>>;
	processOutputs(outputs: ITemplateOutput[], configPath: string, variables: Map<string, string>): Promise<void>;
}
