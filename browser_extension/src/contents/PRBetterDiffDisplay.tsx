import { getPRCommitReferences, type PRCommitInfo } from "core/api/FetchPRCommitReferences";
import type { Optional } from "core/types";
import { extractPRInfoFromURL } from "src/contents/PRBetterDiffDisplayHelpers/GHUtils";
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetShadowHostId,
} from "plasmo";
import { useEffect, useState, type FC } from "react";

// Read this in full to understand what's going on here:
// https://docs.plasmo.com/framework/content-scripts-ui/life-cycle

export const config: PlasmoCSConfig = {
  matches: ["https://*.github.com/*"],
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll("copilot-diff-entry");
  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "beforebegin",
  }));
};

export const getShadowHostId: PlasmoGetShadowHostId = (anchor) => {
  return `${anchor?.element.getAttribute("data-file-path")}-plasmo-shadow-host-id`;
};

const PRBetterDiffDisplay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [commitInfo, setCommitInfo] = useState<Optional<PRCommitInfo>>();

  useEffect(() => {
    const getDiffReferences = async () => {
      const PRInfo = extractPRInfoFromURL();
      if (!PRInfo) return;
      const hashes = await getPRCommitReferences(PRInfo.owner, PRInfo.repo, PRInfo.prNumber);
      setCommitInfo(hashes);
    };
    getDiffReferences();
  }, []);

  useEffect(() => {
    const requestBetterDiff = async () => {
      const fileName = anchor?.element.getAttribute("data-file-path");
    };
    requestBetterDiff();
  }, [anchor]);

  return (
    <div
      style={{
        borderRadius: 4,
        padding: 4,
        background: "pink",
      }}
    >
      {JSON.stringify(commitInfo)}
    </div>
  );
};

export default PRBetterDiffDisplay;
