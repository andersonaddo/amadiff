import { getPRChangeInformation } from "src/core/api/FetchPRChangeInformation";
import type { Nullable, Optional } from "src/core/types/types";
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetShadowHostId,
  PlasmoGetStyle,
} from "plasmo";
import { useEffect, useMemo, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { extractPRInfoFromURL } from "src/core/github";
import { useToggleState } from "src/core/hooks";
import { DiffDisplayer } from "./PRBetterDiffDisplayHelpers/DiffDisplayer";
import type { PRChangeInfo } from "src/core/types/getBetterDiffTypes";
import styleText from "data-text:./PRBetterDiffDisplayHelpers/styles.scss"; // https://docs.plasmo.com/framework/content-scripts-ui/styling
import { recordEvent, setUpAnalytics } from "src/core/analytics";

setUpAnalytics();

// Plasmo configuration
// https://docs.plasmo.com/framework/content-scripts-ui/styling
// https://docs.plasmo.com/framework/content-scripts-ui/life-cycle
// (--start-- and --end-- are added just to make the code more readable)
// ------------ start ------------
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

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};

// ------------ end ------------

const PRBetterDiffDisplay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [commitInfo, setCommitInfo] = useState<Optional<PRChangeInfo>>();
  const [isBetterDisplayVisible, toggleBetterDisplayVisibility] = useToggleState(true);
  const [errorText, setErrorText] = useState<Nullable<string>>(null);

  const fileName = anchor?.element.getAttribute("data-file-path");
  const defaultDiffDisplayElement: Optional<HTMLTableElement> =
    anchor?.element.querySelector("table.diff-table");

  const portalAnchor = useMemo(() => {
    const defaultDiffDisplayElementParent = defaultDiffDisplayElement?.parentElement;
    if (!defaultDiffDisplayElementParent) return null;
    const firstSibling = document.createElement("div");
    defaultDiffDisplayElementParent?.prepend(firstSibling);
    return firstSibling;
  }, [defaultDiffDisplayElement]);

  useEffect(() => {
    const getDiffReferences = async () => {
      const PRInfo = extractPRInfoFromURL();
      if (!PRInfo) return;
      try {
        const hashes = await getPRChangeInformation(PRInfo.owner, PRInfo.repo, PRInfo.prNumber);
        setCommitInfo(hashes);
      } catch (e) {
        setErrorText(
          "Couldn't get commit info (sure BetterDiff has the correct permissions?). Showing original diff instead.",
        );
        toggleBetterDisplayVisibility();
      }
    };
    getDiffReferences();
  }, [toggleBetterDisplayVisibility]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={() => {
              recordEvent("toggle_diff_visibility", { newValue: !isBetterDisplayVisible });
              toggleBetterDisplayVisibility();
            }}
            style={{
              width: "fit-content",
            }}
          >
            Toggle visibility!
          </button>
          {commitInfo && (
            <div>
              <p style={{ fontSize: 10, margin: 0 }}>
                Merge Base:{" "}
                <a
                  href={`https://github.com/${commitInfo.baseRepoOwner}/${commitInfo.baseRepoName}/blob/${commitInfo.baseHash}/${fileName}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://github.com/{commitInfo.baseRepoOwner}/{commitInfo.baseRepoName}/blob/
                  {commitInfo.baseHash}/{fileName}
                </a>
                <br />
                HEAD:{" "}
                <a
                  href={`https://github.com/${commitInfo.headRepoOwner}/${commitInfo.headRepoName}/blob/${commitInfo.headHash}/${fileName}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://github.com/{commitInfo.headRepoOwner}/{commitInfo.headRepoName}/blob/
                  {commitInfo.headHash}/{fileName}
                </a>
              </p>
            </div>
          )}
        </div>
        {errorText && <small>⚠️ {errorText}</small>}
      </div>

      {portalAnchor && defaultDiffDisplayElement && (
        <>
          {createPortal(
            <DiffDisplayer
              commitReferences={commitInfo}
              fileName={fileName}
              enabled={isBetterDisplayVisible}
              defaultDiffElement={defaultDiffDisplayElement}
            />,
            portalAnchor,
          )}
        </>
      )}
    </div>
  );
};

export default PRBetterDiffDisplay;
