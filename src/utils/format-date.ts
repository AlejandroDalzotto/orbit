/**
 *
 * @param date a string in format yyyy-mm-dd
 * @returns a formatted date string in format dd M
 */
export function formatDate(date: string): string {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  });
  return formatter.format(new Date(date));
}
