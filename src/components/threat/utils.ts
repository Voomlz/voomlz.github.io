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
 * Helper function to determine the encounter sort order
 * @param param0 Object with encounter and id properties
 * @returns Sort value
 */
export const TRASH_ID = 9999999;
export function encounterSort({
  encounter,
  id,
}: {
  encounter: number;
  id: string | number;
}): number {
  return encounter === 0 ? TRASH_ID + Number(id) : encounter + Number(id);
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

/**
 * Print an error to console and alert
 * @param e Error message
 */
export function printError(e: any): void {
  console.error(e);
  alert("Error:\n" + e + "\n\nRefresh the page to start again.");
}

/**
 * Toggle the display of an element
 * @param divId The ID of the element to toggle
 * @returns void
 */
export function showAndHide(divId: string): void {
  const element = document.getElementById(divId);
  if (!element) return;

  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}
