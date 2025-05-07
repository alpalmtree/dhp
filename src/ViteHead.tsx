import type { FC } from "hono/jsx";
import { html, raw } from "hono/html";
import { appConfig, viteScripts } from "./index.ts";

export const ViteHead: FC<{ script?: string }> = ({ script }) => {
  if (!script) return null;

  if (appConfig.viteDevMode === false) {
    const scriptsString = viteScripts[script];
    const Head = () =>
      html`
        ${raw(scriptsString)}
      `;

    return (
      <>
        <Head />
      </>
    );
  }

  const ViteClient: FC = () => (
    <script type="module" src="http://localhost:5173/@vite/client"></script>
  );
  const ViteScript: FC = () => (
    <script
      type="module"
      src={`http://localhost:5173${script}`}
    />
  );

  return (
    <>
      <ViteClient />
      <ViteScript />
    </>
  );
};
