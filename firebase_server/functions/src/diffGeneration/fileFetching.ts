import { Octokit } from "@octokit/rest";
import axios from "axios";

// If you update this, be sure to update the frontend too
const MAX_FILE_SIZE_IN_BYTES = 1028 * 512; // 512kb

export interface FileFetchResult {
  textContent?: string;
  status: "missing" | "bad-format" | "too-large" | "success";
}

interface FileSizeResponse {
  data: {
    data: {
      repository: {
        object: {
          file: {
            size: number;
          };
        };
      };
    };
  };
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
  const axiosInstance = axios.create({
    baseURL: "https://api.github.com/graphql",
    headers: {
      Authorization: `bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  try {
    const fileSizeResponse = (await axiosInstance.post("", {
      query: `{
                repository(owner: "${owner}", name: "${repo}") {
                  object(expression: "${ref}") {
                    ... on Commit {
                      file(path: "${path}") {
                        size
                        }
                      }
                    }
                  }
                }
              }`,
    })) as FileSizeResponse;

    console.log(fileSizeResponse.data.data.repository);

    const fileSize = fileSizeResponse.data.data.repository.object.file.size;
    if (fileSize > MAX_FILE_SIZE_IN_BYTES) {
      return {
        status: "too-large",
      };
    }

    const fileContentResponse = await octokit.request(
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

    const data = fileContentResponse.data;
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
