import { initializeApp, type FirebaseApp } from "firebase/app";
import type { Undefined } from "./types/types";
import { assertDefined } from "./util";

let firebaseApp: Undefined<FirebaseApp>;

export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(
      JSON.parse(assertDefined(process.env.PLASMO_PUBLIC_PROD_FIREBASE_CONFIG)),
    );
  }
  return firebaseApp;
};
