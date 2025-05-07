import { removeIfExists, runCommand } from "./utils.ts";
export const removeGeneratedFiles = () => {
  removeIfExists(`${Deno.cwd()}/file-router`);
  removeIfExists(`${Deno.cwd()}/hwr.config.ts`);
};
export const setupFiles = async () => {
  removeGeneratedFiles();
  await runCommand("deno run init");
};
