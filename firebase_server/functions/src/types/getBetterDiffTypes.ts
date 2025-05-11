// The frontend and backend versions of this should match
export interface DiffRequestArgs {
  token: string;
  commitInfo: PRCommitInfo;
  fileName: string;
  diffOptions: DiffOptions;
}

export interface DiffRequestResponse {
  status: "invalid-format" | "error" | "success";
  diff?: string;
}

export interface DiffOptions {
  method: DiffMethod;
  colorMode?: "light" | "dark";
}

export enum DiffMethod {
  DIFFTASTIC = "difftastic",
}

export interface DiffMethodsColorMode {
  status: "invalid-format" | "error" | "success";
  diff?: string;
}

export interface PRCommitInfo {
  headRepoName: string;
  headRepoOwner: string;
  headHash: string;
  baseRepoName: string;
  baseRepoOwner: string;
  baseHash: string;
}
