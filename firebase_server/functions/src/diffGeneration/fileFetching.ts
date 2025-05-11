import { Octokit } from "@octokit/rest";

export interface FileFetchResult {
  textContent?: string;
  status: "missing" | "bad-format" | "success";
}

export async function fetchTextFileContent(
  authToken: string,
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<FileFetchResult> {
  const octokit = new Octokit({
    auth: authToken,
  });

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
        ref,
        mediaType: {
          format: "text",
        },
      }
    );

    const data = response.data;
    if (!("content" in data)) {
      return {
        status: "bad-format",
      };
    }

    return {
      // GitHub API returns content as Base64 encoded
      textContent: Buffer.from(data.content, "base64").toString("utf8"),
      status: "success",
    };

    // biome-ignore lint/suspicious/noExplicitAny: error handling
  } catch (error: any) {
    //https://github.com/octokit/request-error.js
    if (error.status && error.status === 404) {
      return {
        status: "missing",
      };
    }
    throw error;
  }
}
