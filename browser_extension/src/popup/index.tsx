import { useGithubToken } from "core/storage";
import type React from "react";
import { useEffect, useState } from "react";

const GitHubTokenManager: React.FC = () => {
  const [storedGHToken, setStoredGHToken] = useGithubToken();

  const [token, setToken] = useState<string>("");
  const [showToken, setShowToken] = useState<boolean>(false);

  useEffect(() => {
    setToken(storedGHToken);
  }, [storedGHToken]);

  const handleSaveToken = () => {
    setStoredGHToken(token);
  };

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md">
      <h2 className="text-xl font-bold mb-4">GitHub API Token</h2>

      <div className="mb-4">
        <label htmlFor="github-token" className="block mb-1 font-medium">
          Personal Access Token
        </label>
        <div className="flex">
          <input
            id="github-token"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            className="w-full p-2 border rounded mr-2"
          />
          <button
            onClick={toggleShowToken}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title={showToken ? "Hide token" : "Show token"}
            type="button"
          >
            {showToken ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Needs permissions: repo</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSaveToken}
          disabled={!token}
          type="button"
          className={`px-4 py-2 rounded ${
            !token ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Save Token
        </button>
      </div>
    </div>
  );
};

export default GitHubTokenManager;
