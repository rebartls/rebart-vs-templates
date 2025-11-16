//link casings https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/

const getValue = (value: string, result: string) => (value.length > 0 ? result : value);

export const getCamelCase = (value: string) => getValue(value, value[0].toLowerCase() + value.slice(1));

export const getPascalCase = (value: string) => getValue(value, value[0].toUpperCase() + value.slice(1));
