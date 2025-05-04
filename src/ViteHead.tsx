import type { FC } from "hono/jsx";
import { html, raw } from "hono/html";
import { appConfig, viteScripts, runtimeConfig } from "./index.ts";

export const ViteHead: FC<{ script?: string }> = ({ script }) => {
  if (!script) return null;
  const path = `resources/entrypoints/${script}`

  if (runtimeConfig.viteDevMode === false || appConfig.viteDevMode === false) {
    const scriptsString = viteScripts[path]
    const Head = () => html`${raw(scriptsString)}`

    // deno-lint-ignore jsx-no-useless-fragment
    return <><Head /></>
  }

  const ViteClient: FC = () => (
    <script type="module" src="http://localhost:5173/@vite/client"></script>
  );
  const ViteScript: FC = () => (
    <script
      type="module"
      src={`http://localhost:5173/${path}`}
    />
  );

  return (
    <>
      <ViteClient />
      <ViteScript />
    </>
  );
};
