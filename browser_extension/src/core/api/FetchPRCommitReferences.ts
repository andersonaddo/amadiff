import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import { getGithubToken } from "core/storage";

interface Repo {
  name: string;
  owner: {
    login: string;
  };
}

interface GraphQLResponse {
  data: {
    repository: {
      pullRequest: {
        headRefOid: string;
        baseRefOid: string;
        headRepository: Repo;
        baseRepository: Repo;
      };
    };
  };
}

export interface PRCommitInfo {
  headRepoName: string;
  headRepoOwner: string;
  headHash: string;
  baseRepoName: string;
  baseRepoOwner: string;
  baseHash: string;
}

const makeGraphQLQuery = (owner: string, repo: string, prNumber: number) => `{
  repository(owner: "${owner}", name: "${repo}") {
    pullRequest(number: ${prNumber}) {
      baseRepository {
        name 
        owner {
          login
        }
      }
      baseRefOid
      headRepository {
        name 
        owner {
          login
        }
      }
      headRefOid
    }
  }
}`;

// TODO: this should be true and might result in some problems
// TODO: actually - this whole caching thing isn't working
const axiosInstance = setupCache(
  axios.create({
    baseURL: "https://api.github.com/graphql",
  }),
  {
    cacheTakeover: false,
  },
);

export const getPRCommitReferences = async (
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PRCommitInfo> => {
  const key = await getGithubToken();

  const response = await axiosInstance.post(
    "",
    {
      query: makeGraphQLQuery(owner, repo, prNumber),
    },
    {
      headers: {
        Authorization: `bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = response.data as GraphQLResponse;

  return {
    headRepoName: data.data.repository.pullRequest.headRepository.name,
    headRepoOwner: data.data.repository.pullRequest.headRepository.owner.login,
    headHash: data.data.repository.pullRequest.headRefOid,
    baseRepoName: data.data.repository.pullRequest.baseRepository.name,
    baseRepoOwner: data.data.repository.pullRequest.baseRepository.owner.login,
    baseHash: data.data.repository.pullRequest.baseRefOid,
  };
};
