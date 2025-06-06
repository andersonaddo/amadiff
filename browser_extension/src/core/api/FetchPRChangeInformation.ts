import axios from "axios";
import { getGithubToken } from "core/storage";
import type { PRChangeInfo } from "../types/getBetterDiffTypes";

interface GraphQLRepo {
  name: string;
  owner: {
    login: string;
  };
}

interface GraphQLQueryResponse {
  data: {
    repository: {
      pullRequest: {
        baseRepository: GraphQLRepo;
        baseRef: { name: string };

        headRepository: GraphQLRepo;
        headRef: { name: string };
        headRefOid: string;
      };
    };
  };
}

interface CompareResponse {
  merge_base_commit: {
    sha: string;
  };
  files: Array<{
    filename: string;
  }>;
}

const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return "no extension";
  }
  return filename.substring(lastDotIndex + 1).toLowerCase();
};

const makeGraphQLQueryForBasicData = (owner: string, repo: string, prNumber: number) => `{
  repository(owner: "${owner}", name: "${repo}") {
    pullRequest(number: ${prNumber}) {
      baseRepository {
        name 
        owner {
          login
        }
      }
      baseRef {
        name
      }
      
      headRepository {
        name 
        owner {
          login
        }
      }
      headRef {
        name  
      }
      headRefOid
    }
  }
}`;

// TODO: Implement caching here (the cache should just store promises with ttl)
const graphQLAxiosInstance = axios.create({
  baseURL: "https://api.github.com/graphql",
});

const restAxiosInstance = axios.create({
  baseURL: "https://api.github.com/repos/",
});

export const getPRChangeInformation = async (
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PRChangeInfo> => {
  const key = await getGithubToken();

  const basicInfoResponse = await graphQLAxiosInstance.post(
    "",
    {
      query: makeGraphQLQueryForBasicData(owner, repo, prNumber),
    },
    {
      headers: {
        Authorization: `bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = basicInfoResponse.data as GraphQLQueryResponse;

  const baseRepo = data.data.repository.pullRequest.baseRepository;
  const headRepo = data.data.repository.pullRequest.headRepository ?? baseRepo;

  // I would have though I could just compare baseRefOid and headRefOid, but that's not accurate sometimes 🤔
  // There's a separate concept called a merge_base_commit which is the actual base reference point. Sometimes its equal to baseRefOid, but sometimes its not
  const compareInfoResponse = await restAxiosInstance.get(
    `${baseRepo.owner.login}/${baseRepo.name}/compare/${baseRepo.owner.login}:${data.data.repository.pullRequest.baseRef.name}...${headRepo.owner.login}:${data.data.repository.pullRequest.headRef.name}`,
    {
      headers: {
        Authorization: `bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );
  const compareInfo = compareInfoResponse.data as CompareResponse;

  const mergeBaseCommit = compareInfo.merge_base_commit.sha;
  const fileExtensions = compareInfo.files
    .map((x) => getFileExtension(x.filename))
    .reduce(
      (acc, val) => {
        if (!acc[val]) {
          acc[val] = 0;
        }
        acc[val]++;
        return acc;
      },
      {} as Record<string, number>,
    );

  return {
    baseRepoName: baseRepo.name,
    baseRepoOwner: baseRepo.owner.login,
    baseHash: mergeBaseCommit,
    headRepoName: headRepo.name,
    headRepoOwner: headRepo.owner.login,
    headHash: data.data.repository.pullRequest.headRefOid,

    //TODO: ideally, these 2 should be fetched and returned by a separate function.
    // These are only used for analytics, so they shouldn't need to be returned from this function, which
    // is a core function of Amadiff (and this data also gets sent to the banckend).
    // But, Alas, I'm lazy right now.
    filesChanged: compareInfo.files.length,
    fileCountByExtensions: fileExtensions,
  };
};
