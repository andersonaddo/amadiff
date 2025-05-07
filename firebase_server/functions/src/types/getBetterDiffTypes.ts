// These should all match the frontend
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

enum DiffMethods {
  DIFFTASTIC = "difftastic",
}

interface PRCommitInfo {
  headRepoName: string;
  headRepoOwner: string;
  headHash: string;
  baseRepoName: string;
  baseRepoOwner: string;
  baseHash: string;
}
