import { ITemplateConfiguration } from "../../../types";
import vscodeHelper from "../../vscodeHelper/vscodeHelper.service";

export default function (configuration: ITemplateConfiguration): boolean {
	let valid = true;

	if (configuration.name.search(".") > 0) {
		vscodeHelper.window.showWarningMessage("Template name cannot contain dots.");
		valid = false;
	}

	return valid;
}
