import { exec } from "node:child_process";
import * as util from "node:util";
import type { DiffOptions } from "../types/getBetterDiffTypes";
const execPromise = util.promisify(exec);

export const getPrettyDiffHTML = async (
  diffOptions: DiffOptions,
  baseFilePath: string,
  headFilePath: string
) => {
  const diffCommand = getDiffCommand(diffOptions, baseFilePath, headFilePath);
  const htmlCommand = getAnsiToHtmlCommand();
  const completeCommand = `${diffCommand} | ${htmlCommand}`;
  const { stdout: htmlOutput } = await execPromise(completeCommand);
  return htmlOutput;
};

const getDiffCommand = (
  options: DiffOptions,
  baseFilePath: string,
  headFilePath: string
) => {
  return `difft ${baseFilePath} ${headFilePath} --color always --background ${
    options.colorMode === "light" ? "light" : "dark"
  } --missing-as-empty --width 150`;
};

const getAnsiToHtmlCommand = () => {
  return "ansi2html";
};
