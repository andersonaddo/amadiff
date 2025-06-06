import { onCall } from "firebase-functions/v2/https";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { fetchTextFileContent } from "./diffGeneration/fileFetching";
import { getPrettyDiffHTML } from "./diffGeneration/diffHtmlGeneration";
import type {
  DiffRequestArgs,
  DiffRequestResponse,
} from "./types/getBetterDiffTypes";

const cleanFilePath = (path: string) => {
  return path.replace(/[\,\/]/gi, "-");
};

export const getBetterDiff = onCall(
  { memory: "1GiB" },
  async (args): Promise<DiffRequestResponse> => {
    const request = args.data as DiffRequestArgs;

    const [baseFileContent, headFileContent] = await Promise.all([
      fetchTextFileContent(
        request.token,
        request.commitInfo.baseRepoOwner,
        request.commitInfo.baseRepoName,
        request.commitInfo.baseHash,
        request.fileName
      ),
      fetchTextFileContent(
        request.token,
        request.commitInfo.headRepoOwner,
        request.commitInfo.headRepoName,
        request.commitInfo.headHash,
        request.fileName
      ),
    ]);

    if (
      baseFileContent.status === "bad-format" ||
      headFileContent.status === "bad-format"
    ) {
      return {
        status: "invalid-format",
      };
    }

    if (
      baseFileContent.status === "too-large" ||
      headFileContent.status === "too-large"
    ) {
      return {
        status: "too-large",
      };
    }

    if (
      baseFileContent.status === "no-permissions" ||
      headFileContent.status === "no-permissions"
    ) {
      return {
        status: "no-permissions",
      };
    }

    if (
      baseFileContent.status === "missing" &&
      headFileContent.status === "missing"
    ) {
      return {
        status: "invalid-format",
      };
    }

    const tmp = os.tmpdir();
    const filePath = request.fileName;
    const baseFilePath = path.join(
      tmp,
      `base_${Date.now()}_${cleanFilePath(filePath)}`
    );
    const headFilePath = path.join(
      tmp,
      `head_${Date.now()}_${cleanFilePath(filePath)}`
    );

    // This should work fine for both a DiffRequestResponse status of "missing" and "success"
    fs.writeFileSync(baseFilePath, baseFileContent.textContent ?? "");
    fs.writeFileSync(headFilePath, headFileContent.textContent ?? "");
    const htmlOutput = await getPrettyDiffHTML(
      request.diffOptions,
      baseFilePath,
      headFilePath
    );
    fs.unlinkSync(baseFilePath);
    fs.unlinkSync(headFilePath);

    return {
      status: "success",
      diff: htmlOutput,
    };
  }
);
