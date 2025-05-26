import axios from "axios";
import { getGithubToken } from "core/storage";
import type { PRCommitInfo } from "../types/getBetterDiffTypes";

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

export const getPRCommitReferences = async (
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PRCommitInfo> => {
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

  const mergeBaseCommit = compareInfoResponse.data.merge_base_commit.sha;

  return {
    baseRepoName: baseRepo.name,
    baseRepoOwner: baseRepo.owner.login,
    baseHash: mergeBaseCommit,
    headRepoName: headRepo.name,
    headRepoOwner: headRepo.owner.login,
    headHash: data.data.repository.pullRequest.headRefOid,
  };
};
