export type FormatterFunc<T = string> = (...args: unknown[]) => T;
export type FormatsSync = "path" | "pascalCase" | "camelCase";
export type Formats = "c#" | FormatsSync;
