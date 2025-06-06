import posthog from "posthog-js/dist/module.full.no-external";
import { assertDefined, isInDevMode } from "./util";

let analyticsIsSetUp = false;
export const setUpAnalytics = () => {
  if (analyticsIsSetUp) return;
  analyticsIsSetUp = true;

  // https://posthog.com/tutorials/multiple-environments
  const key = isInDevMode()
    ? assertDefined(process.env.PLASMO_PUBLIC_POSTHOG_DEV_KEY)
    : assertDefined(process.env.PLASMO_PUBLIC_POSTHOG_PROD_KEY);

  // More about this config can be found here: https://posthog.com/docs/libraries/js#config
  posthog.init(key, {
    api_host: assertDefined(process.env.PLASMO_PUBLIC_POSTHOG_HOST),
    ui_host: "https://us.posthog.com",
    loaded: (ph) => ph.set_config({ debug: isInDevMode() }),
    // Don't need to see anything that folks are doing on Github, I just need to send events
    disable_session_recording: true,
    autocapture: false,
    capture_pageview: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    disable_surveys: true,
    rageclick: false,
  });
};

type Primitive = boolean | number | string;
type JsonType = Record<string, Primitive> | Primitive;

export const recordEvent = (eventName: string, properties?: Record<string, JsonType>) => {
  posthog.capture(eventName, properties);
};
