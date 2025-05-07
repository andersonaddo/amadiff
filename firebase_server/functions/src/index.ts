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

const appendFileExtension = (path: string, extension?: string) => {
  if (extension) {
    return `${path}.${extension}`;
  }
  return path;
};

export const getBetterDiff = onCall(
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

    if (!baseFileContent || !headFileContent) {
      return {
        status: "missing-or-invalid",
      };
    }

    const tmp = os.tmpdir();
    const fileExtension = request.fileName.split(".").pop();
    const baseFilePath = appendFileExtension(
      path.join(tmp, `base_${Date.now()}`),
      fileExtension
    );
    const headFilePath = appendFileExtension(
      path.join(tmp, `head_${Date.now()}`),
      fileExtension
    );

    fs.writeFileSync(baseFilePath, baseFileContent);
    fs.writeFileSync(headFilePath, headFileContent);
    const htmlOutput = await getPrettyDiffHTML(baseFilePath, headFilePath);
    fs.unlinkSync(baseFilePath);
    fs.unlinkSync(headFilePath);

    return {
      status: "success",
      diff: htmlOutput,
    };
  }
);
