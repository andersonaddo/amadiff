import type { Nullable, Undefined } from "./types/types";

export function isInDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function assertDefined<T>(value: Undefined<T>): T {
  if (value === undefined) throw new Error("Unexpected undefined value!");
  return value;
}

export function assertNotNull<T>(value: Nullable<T>): T {
  if (value === null) throw new Error("Unexpected null value!");
  return value;
}
