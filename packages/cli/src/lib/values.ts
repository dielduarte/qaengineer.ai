import { faker } from '@faker-js/faker';

// The only semantic part of filling a field is deciding *what kind* of value it
// expects; producing the value itself is deterministic. Jev classifies the field
// into one of these kinds (see lib/typesafe.ts), and code generates the value —
// no LLM on the fill path.
export const VALUE_CRITERIA = {
  email: 'An email address',
  fullName: "A person's full name",
  firstName: 'A given / first name',
  lastName: 'A family / last name',
  username: 'A login or username',
  password: 'A password',
  phone: 'A phone number',
  zipCode: 'A postal or ZIP code',
  streetAddress: 'A street address',
  city: 'A city name',
  number: 'A plain number',
  freeText: 'Arbitrary text with no standard format',
} as const;

export type ValueKind = keyof typeof VALUE_CRITERIA;

const GENERATORS: Record<ValueKind, () => string> = {
  email: () => faker.internet.email(),
  fullName: () => faker.person.fullName(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  username: () => faker.internet.username(),
  password: () => faker.internet.password(),
  phone: () => faker.phone.number(),
  zipCode: () => faker.location.zipCode(),
  streetAddress: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  number: () =>
    String(faker.number.int({ min: 1, max: 9999 })),
  freeText: () => faker.lorem.words({ min: 2, max: 5 }),
};

// Extract "Label: value" / "- Label: `value`" lines from the config markdown so
// specific values (e.g. known credentials) win over generated ones.
export function parseConfigValues(
  config: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  // The `(?!\/\/)` after the colon skips URLs (e.g. `https://…`) so prose lines
  // are not mistaken for labelled values.
  const line =
    /^[\s\-*]*([A-Za-z][A-Za-z ]*?):(?!\/\/)\s*`?([^`\n]+?)`?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = line.exec(config))) {
    out[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return out;
}

export function valueForKind(
  kind: ValueKind,
  configValues: Record<string, string>,
): string {
  // A value stated in the config for this kind (e.g. a known username/password)
  // takes precedence over a generated one.
  return configValues[kind] ?? GENERATORS[kind]();
}
