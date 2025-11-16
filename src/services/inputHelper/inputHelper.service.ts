import { CancellationToken, CancellationTokenSource, window } from "vscode";
import gateKeeper from "../../components/gateKeeper/gateKeeper.js";
import { IInputHelper } from "./types.js";
import { createLoggerInstance } from "../../components/logger/logger.js";

function create(): IInputHelper {
	const logger = createLoggerInstance("InputHelper");

	const getValue = async (question: string, cancelToken: CancellationToken) => {
		return await window.showInputBox(
			{
				title: question,
			},
			cancelToken
		);
	};

	const getSelectValue = async (values: string[], question: string, cancelToken: CancellationToken) => {
		return await window.showQuickPick(
			values,
			{
				title: question,
			},
			cancelToken
		);
	};

	return {
		async getValue(
			question: string,
			cancelToken: CancellationToken = new CancellationTokenSource().token
		): Promise<string> {
			gateKeeper.notUndefined([question, cancelToken], "Get value properties");
			const value = await getValue(question, cancelToken);
			gateKeeper.notUndefined(question, "Value");
			return value!;
		},
		async getSelectValue(
			values: string[],
			question: string,
			cancelToken: CancellationToken = new CancellationTokenSource().token
		): Promise<string> {
			gateKeeper.notUndefined([values, question, cancelToken], "Get select value properties");
			const value = await getSelectValue(values, question, cancelToken);
			gateKeeper.notUndefined(question, "Value");
			return value!;
		},
		async getBoolValue(
			question: string,
			cancelToken: CancellationToken = new CancellationTokenSource().token
		): Promise<boolean> {
			gateKeeper.notUndefined([question, cancelToken], "Get bool value properties");
			let value = await getSelectValue(["true", "false"], question, cancelToken);
			gateKeeper.notUndefined(value, "Value");

			if (!["true", "false"].includes(value!)) {
				logger.logWarn(`Value ${value} neither 'true' nor 'false'. Fallback to 'false'`);
				value = "false";
			}

			return value === "true";
		},
	};
}

const inputHelper = create();
export default inputHelper;
