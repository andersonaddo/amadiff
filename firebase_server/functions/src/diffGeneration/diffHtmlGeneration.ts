import { exec } from "node:child_process";
import * as util from "node:util";
import type { DiffOptions } from "../types/getBetterDiffTypes";
import { inEmulatorMode } from "../utils/devMode";
const execPromise = util.promisify(exec);

// TODO: There's lots to improve here. Read below.
/*
  Because we're sanitizing the HTML output produced here (using DOMPurify) to protect the user against XSS,
  there are some limitations as to which libraries we can use when converting ansi to html.
  We need libraries that style their HTML using css and classes and not inline styles, and that css
  needs to be easy to extract so that we can isolate it, clean the main html, then re-apply the css (since the css is trusted).

  I've found two libraries that are good enough for this so far:
  https://github.com/buildkite/terminal-to-html
  https://github.com/pycontribs/ansi2html

  For now, I'm just using terminal-to-html since it's easier
  They provided an entire css stylesheet file with all the classes they use, so we can just refer to that on the frontend.
  However, that has a problem - terminal-to-html doesn't seem to respect the background color that difftastic uses.

  ansi2html does respect the background, but its styling is more cumbersome to extract.
  I'd have to run the command twice. Once with the --headers flag to be given just the styling, then another
  time to actually get the entire HTML output.
  I don't want to have to run difftastic twice, so I'd need to find a way to store difftastic's output in a JS variable
  but still pipe it into ansi2html the way it expects to be piped. I'll figure out how to do that later.
  If/when I do this, I should probably just start doing the sanitizing on the backend as well.
 */

export const getPrettyDiffHTML = async (
  diffOptions: DiffOptions,
  baseFilePath: string,
  headFilePath: string
) => {
  const diffCommand = getDiffCommand(diffOptions, baseFilePath, headFilePath);
  const htmlCommand = getAnsiToHtmlCommand();
  const completeCommand = `${diffCommand} | ${htmlCommand}`;
  const { stdout: htmlOutput, stderr: error } = await execPromise(
    completeCommand
  );
  if (error) {
    console.error("Error when generating html diff!");
    throw new Error(error);
  }
  return htmlOutput;
};

const getDiffCommand = (
  options: DiffOptions,
  baseFilePath: string,
  headFilePath: string
) => {
  const binaryPath = inEmulatorMode()
    ? "./binaries/difft-darwin"
    : "./binaries/difft-linux";
  const background = options.colorMode === "light" ? "light" : "dark";
  return `${binaryPath} --color always --background ${background} --width 150 ${baseFilePath} ${headFilePath}`;
};

const getAnsiToHtmlCommand = () => {
  if (inEmulatorMode()) {
    return "./binaries/terminal-to-html-darwin";
  }
  return "./binaries/terminal-to-html-linux";
};
