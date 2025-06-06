import { useGithubToken } from "core/storage";
import type React from "react";
import { useEffect, useState } from "react";
import "./styles.scss";

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
    <div style={{ width: 500, padding: 8 }}>
      <h3>Amadiff Settings</h3>

      <div>
        <label htmlFor="github-token">Github Personal Access Token</label>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <input
            id="github-token"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            style={{ flex: 1 }}
          />
          <button
            onClick={toggleShowToken}
            title={showToken ? "Hide token" : "Show token"}
            type="button"
          >
            {showToken ? "Hide" : "Show"}
          </button>
        </div>
        <p>
          You can use a{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Amadiff%20Token"
            target="_blank"
            rel="noreferrer"
          >
            classic
          </a>{" "}
          or{" "}
          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
          >
            fine-tuned
          </a>{" "}
          Github token - we just need a way to read your repositories. <br />
          <strong>This is only stored locally.</strong>
          <br />
          Don't worry - we don't store any of your Github information or anything. Amadiff is{" "}
          <a href={process.env.PLASMO_PUBLIC_GITHUB_LINK} target="_blank" rel="noreferrer">
            open source
          </a>
          , and you can also see our{" "}
          <a href={process.env.PLASMO_PUBLIC_PRIVACY_POLICY_LINK} target="_blank" rel="noreferrer">
            privacy policy
          </a>{" "}
          here.
        </p>
      </div>

      <div>
        <button onClick={handleSaveToken} disabled={!token} type="button">
          Save Token
        </button>
      </div>
    </div>
  );
};

export default GitHubTokenManager;
