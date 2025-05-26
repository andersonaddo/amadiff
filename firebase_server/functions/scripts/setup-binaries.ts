import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { execSync } from "node:child_process";

//Written by Claude.ai and improved by me

interface BinaryInfo {
  name: string;
  linux: {
    url: string;
    filename: string;
  };
  mac: {
    url: string;
    filename: string;
  };
}

const BINARIES_DIR = "./binaries";

const BINARY_CONFIGS: BinaryInfo[] = [
  {
    name: "terminal-to-html",
    linux: {
      url: "https://github.com/buildkite/terminal-to-html/releases/download/v3.16.8/terminal-to-html-3.16.8-linux-amd64.gz",
      filename: "terminal-to-html-linux",
    },
    mac: {
      url: "https://github.com/buildkite/terminal-to-html/releases/download/v3.16.8/terminal-to-html-3.16.8-darwin-amd64.gz",
      filename: "terminal-to-html-darwin",
    },
  },
  {
    name: "difftastic", // Using 0.61 for now since the newest version (0.63) seems to be having some issues (see https://github.com/Wilfred/difftastic/issues/810)
    linux: {
      url: "https://github.com/Wilfred/difftastic/releases/download/0.61.0/difft-x86_64-unknown-linux-gnu.tar.gz",
      filename: "difft-linux",
    },
    mac: {
      url: "https://github.com/Wilfred/difftastic/releases/download/0.61.0/difft-x86_64-apple-darwin.tar.gz",
      filename: "difft-darwin",
    },
  },
];

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    console.log(`⬇️ Downloading ${url}...`);

    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(outputPath);
            downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
            return;
          }
          reject(
            new Error(
              `❌ Failed to download: ${response.statusCode} ${response.statusMessage}`
            )
          );
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(outputPath);
          reject(
            new Error(
              `❌ Failed to download: ${response.statusCode} ${response.statusMessage}`
            )
          );
        } else {
          response.pipe(file);

          file.on("finish", () => {
            file.close();
            resolve();
          });

          file.on("error", (err) => {
            file.close();
            fs.unlinkSync(outputPath);
            reject(err);
          });
        }
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(err);
      });
  });
}

/**
 * Assumes the compressed file contains just the binary
 */
function extractTarGz(tarPath: string, finalPath: string): void {
  try {
    // Extract directly to the final location, then cleanup the tar
    execSync(`tar -xzf "${tarPath}" -O > "${finalPath}"`);
    fs.unlinkSync(tarPath);
  } catch (error) {
    throw new Error(`❌ Failed to extract ${tarPath}: ${error}`);
  }
}

/**
 * Assumes the compressed file contains just the binary
 */
function extractGz(gzPath: string, finalPath: string): void {
  try {
    // Extract directly to the final location, then cleanup the gz
    execSync(`gunzip -c "${gzPath}" > "${finalPath}"`);
    fs.unlinkSync(gzPath);
  } catch (error) {
    throw new Error(`❌ Failed to extract ${gzPath}: ${error}`);
  }
}

function giveBinaryExecutionPermissions(filePath: string): void {
  try {
    fs.chmodSync(filePath, 0o755);
    console.log(`✅ Made ${filePath} executable`);
  } catch (error) {
    console.error(`❌ Failed to make ${filePath} executable:`, error);
  }
}

function binaryExistsAndIsExecutable(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && (stat.mode & 0o111) !== 0; // Check if executable
  } catch {
    return false;
  }
}

async function setupBinary(
  config: BinaryInfo,
  platform: "linux" | "mac"
): Promise<void> {
  const platformConfig = config[platform];
  const finalPath = path.join(BINARIES_DIR, platformConfig.filename);

  if (binaryExistsAndIsExecutable(finalPath)) {
    console.log(
      `⛷️  ${config.name} for ${platform} already exists and is executable: ${finalPath}. Skipping.`
    );
    return;
  }

  console.log(`Setting up ${config.name} for ${platform}...`);

  try {
    if (platformConfig.url.endsWith(".tar.gz")) {
      const tempTarPath = path.join(
        BINARIES_DIR,
        `${platformConfig.filename}.tar.gz`
      );
      await downloadFile(platformConfig.url, tempTarPath);
      extractTarGz(tempTarPath, finalPath);
    } else if (platformConfig.url.endsWith(".gz")) {
      const tempGzPath = path.join(
        BINARIES_DIR,
        `${platformConfig.filename}.gz`
      );
      await downloadFile(platformConfig.url, tempGzPath);
      extractGz(tempGzPath, finalPath);
    } else {
    }

    giveBinaryExecutionPermissions(finalPath);
    console.log(
      `✅ Successfully set up ${config.name} for ${platform}: ${finalPath}`
    );
  } catch (error) {
    console.error(`❌ Failed to set up ${config.name} for ${platform}:`, error);
    throw error;
  }
}

async function setupAllBinaries(): Promise<void> {
  console.log("👨🏾‍💻 Setting up binaries...\n");

  for (const config of BINARY_CONFIGS) {
    console.log(`\n--- Setting up ${config.name} ---\n`);

    try {
      await setupBinary(config, "linux");
      await setupBinary(config, "mac");
    } catch (error) {
      console.error(`Failed to set up ${config.name}:`, error);
      console.log("😭 Exiting early");
      return;
    }
  }

  console.log("\n✅ Binary setup complete!");
}

setupAllBinaries();
