export function inEmulatorMode(): boolean {
  return process.env.FUNCTIONS_EMULATOR === "true";
}
