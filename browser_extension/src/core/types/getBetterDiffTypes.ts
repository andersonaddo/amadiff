// These should all match the backend
export interface DiffRequestArgs {
  token: string;
  commitInfo: PRCommitInfo;
  fileName: string;
  diffMethod: DiffMethods;
}

export interface DiffRequestResponse {
  status: "missing-or-invalid" | "error" | "success";
  diff?: string;
}

export enum DiffMethods {
  DIFFTASTIC = "difftastic",
}

export interface PRCommitInfo {
  headRepoName: string;
  headRepoOwner: string;
  headHash: string;
  baseRepoName: string;
  baseRepoOwner: string;
  baseHash: string;
}
