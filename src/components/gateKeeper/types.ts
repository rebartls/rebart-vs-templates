import { ILogger } from "../logger/types";

export type Required<T> = {
	[P in keyof T]-?: T[P];
};

export interface IWindowResponse {
	message?: string;
	action?: {
		name: string;
		func(): void;
	};
}

export interface IBaseOptions {
	logger?: ILogger;
	gateKeeper?: IGateKeeper;
}

export interface IGateKeeper {
	/**
	 * @param obj Object to check the properties on
	 * @param propertiesToCheck Keys of the object to check if undefined; If undefined check every property in obj
	 */
	propertiesNotUndefined<T extends object>(obj: T, propertiesToCheck?: (keyof T)[]): void | never;
	anyNotUndefined<T extends object>(
		obj: T,
		propertiesToCheck?: (keyof T)[],
		response?: IWindowResponse
	): void | never;
	notUndefined(value: unknown, name: string, response?: IWindowResponse): void | never;
	/**
	 * Overrides the undefined properties of the current options value with the base values
	 *
	 * @param current Values to override the base options with
	 * @param base
	 */
	setOptions<T extends IBaseOptions>(current: object | undefined, base: T): Required<T>;
	hasSize(obj: unknown[] | Map<unknown, unknown>, amount: number, response?: IWindowResponse): void | never;
	depthReached(depth: number, max: number): void | never;
}
