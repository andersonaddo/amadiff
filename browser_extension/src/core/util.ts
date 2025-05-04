export function isInDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}
