import type { PlasmoCSConfig } from "plasmo";
import { recordEvent, setUpAnalytics } from "src/core/analytics";
import { getPRChangeInformation } from "src/core/api/FetchPRChangeInformation";
import { extractPRInfoFromURL } from "src/core/github";
import { isInDevMode } from "src/core/util";

setUpAnalytics();

export const config: PlasmoCSConfig = {
  matches: ["https://*.github.com/*"],
};

export default function ReportPRSize() {
  const path = window.location.pathname;
  if (path.split("/").at(5) !== "files") return;
  const PRInfo = extractPRInfoFromURL();
  if (!PRInfo) return;
  getPRChangeInformation(PRInfo.owner, PRInfo.repo, PRInfo.prNumber)
    .then((info) =>
      recordEvent("pr_visited", {
        extensions: info.fileCountByExtensions,
        fileCount: info.filesChanged,
      }),
    )
    .catch((error) => {
      if (isInDevMode()) {
        console.error(error);
      }
    });
}
