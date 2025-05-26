import { useEffect, useMemo, useState } from "react";
import { CloudFunctions } from "src/core/api/cloudFunctions";
import { useGithubToken } from "src/core/storage";
import {
  DiffMethod,
  type DiffRequestResponse,
  type PRCommitInfo,
} from "src/core/types/getBetterDiffTypes";
import type { Nullable } from "src/core/types/types";
import { assertDefined } from "src/core/util";
import { generateDiffMessages } from "./DiffAnalysis";
import { useGithubColorTheme } from "./GHUtils";
import LoadingEmoticon from "./LoadingAnimation";
import DOMPurify from "dompurify";

import "./terminal-to-html-styling.css";

const diffMethod = DiffMethod.DIFFTASTIC;

export const DiffDisplayer = (props: {
  commitReferences?: Nullable<PRCommitInfo>;
  fileName?: Nullable<string>;
  enabled: boolean;
  defaultDiffElement: HTMLTableElement;
}) => {
  const { commitReferences, fileName, enabled, defaultDiffElement } = props;

  const [receivedDiff, setReceivedDiff] = useState<Nullable<DiffRequestResponse>>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled); // If `enabled` was initially true, then we should fetch immediately
  const [token] = useGithubToken();
  const colorTheme = useGithubColorTheme();

  const diffMessages = useMemo(() => {
    return generateDiffMessages(diffMethod, receivedDiff);
  }, [receivedDiff]);

  const betterDiffBlocked = useMemo(() => {
    return isLoading || !receivedDiff?.diff || diffMessages.some((x) => x.magnitude === "major");
  }, [diffMessages, isLoading, receivedDiff]);

  useEffect(() => {
    if (!commitReferences || !fileName || !token) return;
    setIsLoading(true);
    CloudFunctions.ApiGetBetterDiff({
      commitInfo: commitReferences,
      fileName,
      token,
      diffOptions: { method: diffMethod, colorMode: colorTheme ?? undefined },
    })
      .then((response) => {
        // We don't want any XSS here!
        // See notes in functions/src/diffGeneration/diffHtmlGeneration.ts to know more about my thoughts about this.
        const cleanedResponse = DOMPurify.sanitize(response.diff as string, {
          USE_PROFILES: { html: true },
        });
        setReceivedDiff({ ...response, diff: cleanedResponse });
      })
      .catch(() => {
        setReceivedDiff({ status: "error" });
      })
      .finally(() => setIsLoading(false));
  }, [commitReferences, fileName, token, colorTheme]);

  useEffect(() => {
    if (enabled && (isLoading || !betterDiffBlocked)) {
      defaultDiffElement.style.display = "none";
    } else {
      defaultDiffElement.style.display = "unset";
    }
  }, [defaultDiffElement, enabled, betterDiffBlocked, isLoading]);

  if (!enabled) {
    return null;
  }

  return (
    <div>
      {isLoading && <LoadingEmoticon />}

      {diffMessages.map((message) => (
        <div key={message.message} style={{ padding: 4 }}>
          ⚠️ {message.message}
        </div>
      ))}

      {!betterDiffBlocked && (
        <div
          style={{
            borderRadius: 4,
            padding: 4,
          }}
          className="term-container" // See the notes in the css stylesheet to understand why we're doing this
          // biome-ignore lint/security/noDangerouslySetInnerHtml: this is the whole point of the app lol
          dangerouslySetInnerHTML={{ __html: assertDefined(receivedDiff?.diff) }}
        />
      )}
    </div>
  );
};
