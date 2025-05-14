import { expect } from "@std/expect";
import { changeDir } from "../fixture/utils.ts";

globalThis.onbeforeunload = () => {
  changeDir("root");
};

changeDir("default_config");

Deno.test(
  "should have the default config",
  { sanitizeResources: false, sanitizeOps: false, sanitizeExit: false },
  async (t) => {
    await t.step("read app config", async () => {
      const { appRuntime } = await import(`${Deno.cwd()}/.dhp/bootstrap.ts`);
      expect(appRuntime.appConfig.useVite).toBe(true);
    });
  },
);
