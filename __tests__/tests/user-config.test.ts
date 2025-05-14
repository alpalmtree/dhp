import { expect } from "@std/expect";
import { defaultConfigTemplate } from "#src/templates.ts";
import { changeDir } from "../fixture/utils.ts";

changeDir("user_config");

Deno.writeTextFileSync(
  `${Deno.cwd()}/dhp.config.ts`,
  defaultConfigTemplate.replace("useVite: true", "useVite: false"),
);

globalThis.onbeforeunload = () => {
  changeDir("root");
};

Deno.test(
  "should have the user defined config",
  { sanitizeResources: false, sanitizeOps: false, sanitizeExit: false },
  async (t) => {
    await t.step("read app config", async () => {
      const { appRuntime } = await import(`${Deno.cwd()}/.dhp/bootstrap.ts`);
      expect(appRuntime.appConfig.useVite).toBe(false);
    });
  },
);
