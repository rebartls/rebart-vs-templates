import { CancellationToken } from "vscode";

export type CancellationTokenDebug = Omit<CancellationToken, "onCancellationRequested">;

export interface IInputHelper {
	getValue(question: string, cancelToken?: CancellationToken): Promise<string>;
	getSelectValue(values: string[], question: string, cancelToken?: CancellationToken): Promise<string>;
	getBoolValue(question: string, cancelToken?: CancellationToken): Promise<boolean>;
}
