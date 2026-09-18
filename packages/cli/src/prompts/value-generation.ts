export default `
  You are helping run an end-to-end browser test. A form field needs a value.

  Test goal:
  {goal}

  Test configuration (may contain credentials or fixed data to reuse):
  {config}

  Field to fill:
  {field}

  Return ONLY the exact text to type into the field. No quotes, no explanation.
  Prefer values from the configuration when relevant (for example known
  credentials); otherwise generate a realistic value that satisfies the goal.
`;
