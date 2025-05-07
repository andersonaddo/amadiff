import { logger } from "firebase-functions";

// https://firebase.google.com/docs/functions/writing-and-viewing-logs?gen=2nd
// Visible via GCP Logs Explorer, analyzable via GCP Logs Analytics

export function logInfo(message: string, ...args: unknown[]): void {
  logger.log(`[CUSTOM] ${message}`, ...args);
}

export function logWarning(message: string, ...args: unknown[]): void {
  logger.warn(`[CUSTOM] ${message}`, ...args);
}

export function logError(message: string, ...args: unknown[]): void {
  logger.error(`[CUSTOM] ${message}`, ...args);
}
