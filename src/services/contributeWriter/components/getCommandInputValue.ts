import inputHelper from "../../inputHelper/inputHelper.service";
import { ICommandInput } from "../types";

export default async function (input: ICommandInput): Promise<string> {
	let value = "";

	switch (input.type) {
		case "select":
			if (input.values) {
				value = await inputHelper.getSelectValue(input.values, input.question);
			} else {
				throw new Error("Input values must be defined when using type select");
			}

			break;
		case "text":
			value = await inputHelper.getValue(input.question);
			break;
	}

	if (!value) throw new Error("Value of input is undefined");

	return value;
}
