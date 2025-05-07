import { Octokit } from "@octokit/rest";

export async function fetchTextFileContent(
  authToken: string,
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<string | null> {
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
      return null;
    }

    // GitHub API returns content as Base64 encoded
    return Buffer.from(data.content, "base64").toString("utf8");

    // biome-ignore lint/suspicious/noExplicitAny: error handling
  } catch (error: any) {
    //https://github.com/octokit/request-error.js
    if (error.status && error.status === 404) {
      return null;
    }
    throw error;
  }
}
