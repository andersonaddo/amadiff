import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onCall(() => {
  logger.info("Hello logs!", { structuredData: true });
});
