import { appConfig, viteScripts } from "./index.ts";
import { raw, html } from "npm:hono/html"

export const ViteHead = ({ script }: { script: string}) => {
  if (!script) return null;

  if (appConfig.viteDevMode === false) {
    const scriptsString = viteScripts[script];
    const Head = () => html`${raw(scriptsString)}`
    return <Head />;
  }

  const ViteClient = () => (
    <script type="module" src="http://localhost:5173/@vite/client"></script>
  );
  const ViteScript = () => (
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
