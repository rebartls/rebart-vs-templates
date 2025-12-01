export enum LogLevel {
	"debug",
	"info",
	"error",
}

let currentLogLevel: LogLevel = LogLevel.info;

export const setLogLevel = (logLevel: string) => (currentLogLevel = LogLevel[logLevel]);

export function debug(message: any, ...params: any[]) {
	if (currentLogLevel > LogLevel.debug) return;

	if (params.length === 0) console.debug(`[D] ${message}`);
	else console.debug(`[D] ${message}`, params);
}

export function info(message: any, ...params: any[]) {
	if (currentLogLevel > LogLevel.info) return;

	if (params.length === 0) console.debug(`[I] ${message}`);
	else console.debug(`[I] ${message}`, params);
}

export function error(message: any, ...params: any[]) {
	if (currentLogLevel > LogLevel.error) return;

	if (params.length === 0) console.error(`[E] ${message}`);
	else console.error(`[E] ${message}`, params);
}
