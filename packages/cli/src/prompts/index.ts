export const withVariables = (
  prompt: string,
  variables: Record<string, string>,
) => {
  return prompt.replace(/\{([^{}]+)\}/g, (match, p1) => variables[p1] || match);
};
