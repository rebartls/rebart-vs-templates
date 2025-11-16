export const extensionProperties = {
	name: "rebart.vs-templates",
};

export const getExtensionProperty = (name: string) => `${extensionProperties.name}.${name}`;
