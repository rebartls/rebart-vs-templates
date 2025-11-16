/* eslint-disable @typescript-eslint/no-explicit-any */
import { window } from "vscode";
import { ILogger, ILoggerInstance, LoggerType } from "./types.js";

const outputChannel = window.createOutputChannel("rebart-vs-commands");

export function createLoggerInstance(name: string): ILoggerInstance {
	const getData = (data: any): string => (typeof data !== "string" ? JSON.stringify(data, null, 2) : data);

	const getMessage = (message: any): string => `[${name}] ${getData(message)}`;

	const getLoggingEnabled = (type: LoggerType) => LoggerType.Debug <= type;

	const write = (data: any, message?: string, type?: LoggerType): string => {
		const output = message ? `${getMessage(message)} / ${getData(data)}` : getMessage(data);
		let msg: string;

		switch (type) {
			case LoggerType.Info:
				msg = `[I] ${output}`;
				console.log(msg);
				break;
			case LoggerType.Error:
				msg = `[E] ${output}`;
				console.error(msg);
				break;
			case LoggerType.Warn:
				msg = `[W] ${output}`;
				console.warn(msg);
				break;
			case LoggerType.Debug:
				msg = `[D] ${output}`;
				console.debug(msg);
				break;
			default:
				msg = `[C] ${output}`;
				break;
		}

		outputChannel.appendLine(msg);
		return msg;
	};

	const logger: ILogger = {
		logDebug(data: any, message?: string) {
			if (getLoggingEnabled(LoggerType.Debug)) {
				write(data, message, LoggerType.Debug);
			}
		},
		log(data: any, message?: string) {
			if (getLoggingEnabled(LoggerType.Info)) {
				write(data, message, LoggerType.Info);
			}
		},
		logWarn(data: any, message?: string) {
			if (getLoggingEnabled(LoggerType.Warn)) {
				write(data, message, LoggerType.Warn);
			}
		},
		logError(data: any, message?: string) {
			if (getLoggingEnabled(LoggerType.Error)) {
				write(data, message, LoggerType.Error);
			}
		},
		logCritical(data: any, message?: string): Error {
			const msg = write(data, message);
			window.showErrorMessage(msg);
			return new Error(msg);
		},
	};

	return {
		...logger,
		name,
		getLogChild: (childName: string): ILoggerInstance => createLoggerInstance(`${name}/${childName}`),
	};
}
