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
        headRefOid: string;
        baseRefOid: string;
        headRepository: GraphQLRepo;
        baseRepository: GraphQLRepo;
      };
    };
  };
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

// TODO: Implement caching here (the cache should just store promises with ttl)
const axiosInstance = axios.create({
  baseURL: "https://api.github.com/graphql",
});

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

  const data = response.data as GraphQLQueryResponse;

  return {
    headRepoName: data.data.repository.pullRequest.headRepository.name,
    headRepoOwner: data.data.repository.pullRequest.headRepository.owner.login,
    headHash: data.data.repository.pullRequest.headRefOid,
    baseRepoName: data.data.repository.pullRequest.baseRepository.name,
    baseRepoOwner: data.data.repository.pullRequest.baseRepository.owner.login,
    baseHash: data.data.repository.pullRequest.baseRefOid,
  };
};
