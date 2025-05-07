import { getPRCommitReferences } from "core/api/FetchPRCommitReferences";
import type { Optional } from "src/core/types/types";
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetShadowHostId,
} from "plasmo";
import { useEffect, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { extractPRInfoFromURL } from "src/contents/PRBetterDiffDisplayHelpers/GHUtils";
import { useToggleState } from "src/core/hooks";
import { DiffDisplayer } from "./PRBetterDiffDisplayHelpers/DiffDisplayer";
import type { PRCommitInfo } from "src/core/types/getBetterDiffTypes";

// Context on what's going on here:
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
  const [isBetterDisplayVisible, toggleBetterDisplayVisibility] = useToggleState(true);

  const fileName = anchor?.element.getAttribute("data-file-path");

  const defaultDiffDisplayElement: Optional<HTMLTableElement> =
    anchor?.element.querySelector("table.diff-table");
  const defaultDiffDisplayElementParent = defaultDiffDisplayElement?.parentElement;

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
    if (!defaultDiffDisplayElement) return;
    if (isBetterDisplayVisible) {
      defaultDiffDisplayElement.style.display = "none";
    } else {
      defaultDiffDisplayElement.style.display = "unset";
    }
  }, [isBetterDisplayVisible, defaultDiffDisplayElement]);

  return (
    <div
      style={{
        borderRadius: 4,
        padding: 4,
        background: "pink",
      }}
    >
      <button type="button" onClick={toggleBetterDisplayVisibility}>
        Toggle visibility!
      </button>

      {defaultDiffDisplayElementParent && (
        <>
          {createPortal(
            <DiffDisplayer
              commitReferences={commitInfo}
              fileName={fileName}
              shouldShow={isBetterDisplayVisible}
            />,
            defaultDiffDisplayElementParent,
          )}
        </>
      )}
    </div>
  );
};

export default PRBetterDiffDisplay;
