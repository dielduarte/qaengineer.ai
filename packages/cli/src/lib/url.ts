const URL_PATTERN = /https?:\/\/[^\s"'<>)\]]+/i;

// The loop drives page elements but cannot originate a URL, so the starting
// page is taken from the config (shared setup) first, then the test itself.
// Trailing sentence punctuation (e.g. a comma or period following the URL in
// prose) is stripped so it does not become part of the address.
export function extractStartUrl(
  config: string,
  test: string,
): string | undefined {
  const raw =
    URL_PATTERN.exec(config)?.[0] ??
    URL_PATTERN.exec(test)?.[0];
  return raw?.replace(/[.,;:!?]+$/, '');
}
