import {
  connectFunctionsEmulator,
  type Functions,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { getFirebaseApp } from "../firebase";
import { isInDevMode } from "../util";
import type { DiffRequestArgs, DiffRequestResponse } from "../types/getBetterDiffTypes";

let functions: Functions | null = null;
const getFunctionsInstance = (): Functions => {
  if (!functions) {
    functions = getFunctions(getFirebaseApp());
    if (isInDevMode()) {
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    }
  }
  return functions;
};

const ApiGetBetterDiff = async (args: DiffRequestArgs): Promise<DiffRequestResponse> => {
  const cloudFunction = httpsCallable(getFunctionsInstance(), "getBetterDiff");
  const result = await cloudFunction(args);
  return result.data as DiffRequestResponse;
};

export const CloudFunctions = {
  ApiGetBetterDiff,
};
