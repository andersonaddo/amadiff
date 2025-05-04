import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export const getGithubToken = async () => {
  const storage = new Storage();
  return await storage.get("gh_token");
};

export const useGithubToken = () => useStorage<string>("gh_token", "");
