import axios from "axios";

// If you update this, be sure to update the frontend too
const MAX_FILE_SIZE_IN_BYTES = 1028 * 512; // 512kb

export interface FileFetchResult {
  textContent?: string;
  status: "missing" | "bad-format" | "too-large" | "success" | "no-permissions";
}

interface FileSizeResponse {
  data: {
    data: {
      repository: {
        object: {
          file?: {
            size: number;
          };
        };
      };
    };
  };
}

interface FileContentsResponse {
  content: string;
  encoding: string;
  type: string;
}

export async function fetchTextFileContent(
  authToken: string,
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<FileFetchResult> {
  const graphqlInstance = axios.create({
    baseURL: "https://api.github.com/graphql",
    headers: {
      Authorization: `bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  try {
    // First, check file size using GraphQL
    const fileSizeResponse = (await graphqlInstance.post("", {
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
      }`,
    })) as FileSizeResponse;

    const fileInfo = fileSizeResponse.data.data.repository.object.file;
    if (!fileInfo) {
      return {
        status: "missing",
      };
    }

    const fileSize = fileInfo.size;
    if (fileSize > MAX_FILE_SIZE_IN_BYTES) {
      return {
        status: "too-large",
      };
    }

    // Now we can proceed with getting the file content
    const restInstance = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `bearer ${authToken}`,
        Accept: "application/vnd.github.v3.text+json", // We only want text format!
      },
    });

    const fileContentResponse = await restInstance.get(
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        params: { ref },
      }
    );

    const data = fileContentResponse.data as FileContentsResponse;
    if (!data.content || data.type !== "file") {
      return {
        status: "bad-format",
      };
    }

    return {
      textContent: Buffer.from(
        data.content,
        data.encoding as BufferEncoding
      ).toString("utf8"),
      status: "success",
    };
  } catch (error: any) {
    // Handle axios errors
    if (error.response?.status === 404) {
      return {
        status: "missing",
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        status: "no-permissions",
      };
    }
    throw error;
  }
}
