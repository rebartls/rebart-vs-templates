/* eslint-disable @typescript-eslint/no-explicit-any */
export enum LoggerType {
	"Debug",
	"Info",
	"Warn",
	"Error",
}

export interface ILogger {
	log(data: any, message?: string): void;
	logDebug(data: any, message?: string): void;
	logWarn(data: any, message?: string): void;
	logError(data: any, message?: string): void;
	logCritical(data: any, message?: string): Error;
}

export interface ILoggerInstance extends ILogger {
	name: string;
	getLogChild(childName: string): ILoggerInstance;
}
