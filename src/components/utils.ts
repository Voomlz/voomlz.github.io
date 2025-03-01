/**
 * Gets a parameter by name from the URL
 * @param name The parameter name
 * @param url Optional URL to parse, defaults to window.location.href
 * @returns The parameter value or null if not found
 */
export function getParameterByName(
  name: string,
  url: string = window.location.href
): string | null {
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Enable or disable all input elements
 * @param enable Whether to enable the inputs
 */
export function enableInput(enable = true): void {
  const elements = ["input", "button", "select"].flatMap((s) =>
    Array.from(document.querySelectorAll(s))
  );

  elements.forEach((el) => {
    (el as HTMLInputElement).disabled = !enable;
  });
}
