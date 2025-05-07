import { removeIfExists } from "./utils.ts";
export const removeGeneratedFiles = () => {
  removeIfExists(`${Deno.cwd()}/file-router`);
  removeIfExists(`${Deno.cwd()}/hwr.config.ts`);
};
