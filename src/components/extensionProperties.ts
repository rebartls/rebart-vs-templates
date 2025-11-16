export const extensionProperties = {
	name: "rebart.vs-commands",
	commands: "configurations/commands",
};

export const getExtensionProperty = (name: string) => `${extensionProperties.name}.${name}`;
