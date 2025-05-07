import { exec } from "node:child_process";
import * as util from "node:util";
const execPromise = util.promisify(exec);

export const getPrettyDiffHTML = async (
  baseFilePath: string,
  headFilePath: string
) => {
  const diffCommand = getDiffCommand(baseFilePath, headFilePath);
  const htmlCommand = getAnsiToHtmlCommand();
  const completeCommand = `${diffCommand} | ${htmlCommand}`;
  const { stdout: htmlOutput } = await execPromise(completeCommand);
  return htmlOutput;
};

const getDiffCommand = (baseFilePath: string, headFilePath: string) => {
  return `difft ${baseFilePath} ${headFilePath} --color always`;
};

const getAnsiToHtmlCommand = () => {
  return "ansi2html";
};
