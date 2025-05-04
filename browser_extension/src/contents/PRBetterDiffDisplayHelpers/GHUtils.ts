/**
 * Extracts owner, repo, and PR number from window location
 * Expected URL format: https://github.com/{owner}/{repo}/pull/{number}
 */
export const extractPRInfoFromURL = () => {
  const path = window.location.pathname;
  const pathParts = path.split("/");

  // Path format should be /{owner}/{repo}/pull/{number}
  if (pathParts.length < 5 || pathParts[3] !== "pull") {
    return null;
  }

  return {
    owner: pathParts[1],
    repo: pathParts[2],
    prNumber: Number.parseInt(pathParts[4], 10),
  };
};
