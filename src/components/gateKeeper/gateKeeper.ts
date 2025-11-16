import { window } from "vscode";
import { IGateKeeper, IWindowResponse } from "./types";

function getResponse(errorMessage: string, response?: IWindowResponse) {
	if (response) {
		response.message ??= errorMessage;

		if (response.action) {
			window.showErrorMessage(response.message, response.action.name).then(response.action.func);
		} else window.showErrorMessage(response.message);
	} else window.showErrorMessage(errorMessage);
}

function checkNotUndefined(value: unknown, name: string, response?: IWindowResponse): void | never {
	for (const entry of Array.isArray(value) ? value : [value]) {
		if (entry === undefined) {
			const errorMessage = `${name} is undefined`;
			getResponse(errorMessage, response);
			throw new Error(errorMessage);
		}
	}
}

function _gateKeeper() {
	return {
		notUndefined: checkNotUndefined,
		setOptions<T>(current: object | undefined, base: T): Required<T> {
			if (current) {
				for (const key in current) {
					const value = current[key] as unknown;

					if (value !== undefined) base[key] = value;
				}
			}

			return base as Required<T>;
		},
		anyNotUndefined<T extends object>(
			obj: T,
			propertiesToCheck?: (keyof T)[],
			response?: IWindowResponse
		): void | never {
			checkNotUndefined(obj, "Object");

			for (const key of (propertiesToCheck ?? Object.keys(obj)) as string[]) {
				if (obj[key]) return;
			}

			const errorMessage = "No value in object found";
			getResponse(errorMessage, response);
			throw new Error(errorMessage);
		},
		hasSize(obj: unknown[] | Map<unknown, unknown>, amount: number, response?: IWindowResponse) {
			checkNotUndefined(obj, "Array or map");
			checkNotUndefined(amount, "Amount");
			const size = Array.isArray(obj) ? obj.length : obj.size;
			checkNotUndefined(size, "Size");
			const errorMessage = "Array doesn't have a correct size";

			if (size < amount) {
				getResponse(errorMessage, response);
				throw new Error(errorMessage);
			}
		},
		propertiesNotUndefined<T extends object>(obj: T, propertiesToCheck?: (keyof T)[]): void | never {
			checkNotUndefined(obj, "Object");
			const objKeys = (propertiesToCheck ?? Object.keys(obj)) as string[];

			for (const key of objKeys) {
				checkNotUndefined(obj[key], `Property ${key} of object`);
			}
		},
		depthReached(depth: number, maxDepth: number): void | never {
			if (depth >= maxDepth) {
				throw new Error(`Max depth of ${maxDepth} reached`);
			}
		},
	} as IGateKeeper;
}

const gateKeeper = _gateKeeper();
export default gateKeeper;
