import { useEffect, useState } from "react";
import { CloudFunctions } from "src/core/api/cloudFunctions";
import { useGithubToken } from "src/core/storage";
import {
  DiffMethods,
  type DiffRequestResponse,
  type PRCommitInfo,
} from "src/core/types/getBetterDiffTypes";
import type { Nullable } from "src/core/types/types";
import { assertDefined } from "src/core/util";

export const DiffDisplayer = (props: {
  commitReferences?: Nullable<PRCommitInfo>;
  fileName?: Nullable<string>;
  shouldShow: boolean;
}) => {
  const { commitReferences, fileName, shouldShow } = props;
  const [token] = useGithubToken();
  const [diffString, setDiffString] = useState<string>("");
  const [status, setStatus] = useState<Nullable<DiffRequestResponse["status"]>>(null);

  useEffect(() => {
    if (!commitReferences || !fileName || !token) return;
    CloudFunctions.ApiGetBetterDiff({
      commitInfo: commitReferences,
      fileName,
      diffMethod: DiffMethods.DIFFTASTIC,
      token,
    }).then((response) => {
      // TODO: finish this
      const cleanedDiff = response.diff;

      // DOMPurify.sanitize(response.diff as string, {
      //   USE_PROFILES: { html: true },
      // });

      setDiffString(assertDefined(cleanedDiff));
      setStatus(response.status);
    });
  }, [commitReferences, fileName, token]);

  if (!shouldShow) {
    return null;
  }

  if (!diffString) {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>Something went wrong</div>;
  }

  if (status === "missing-or-invalid") {
    return <div>File format is invalid or there is no real diff</div>;
  }

  return (
    <div
      style={{
        borderRadius: 4,
        padding: 4,
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: diffString }}
    />
  );
};
