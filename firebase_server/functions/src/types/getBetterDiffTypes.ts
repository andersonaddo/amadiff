// These should all match the backend
export interface DiffRequestArgs {
  token: string;
  commitInfo: PRChangeInfo;
  fileName: string;
  diffOptions: DiffOptions;
}

export interface DiffRequestResponse {
  status:
    | "invalid-format"
    | "error"
    | "no-permissions"
    | "too-large"
    | "success";
  diff?: string;
}

export interface DiffOptions {
  method: DiffMethod;
  colorMode?: "light" | "dark";
}

export enum DiffMethod {
  DIFFTASTIC = "difftastic",
}

export interface PRChangeInfo {
  headRepoName: string;
  headRepoOwner: string;
  headHash: string;
  baseRepoName: string;
  baseRepoOwner: string;
  baseHash: string;
  filesChanged: number;
  fileCountByExtensions: Record<string, number>;
}
