/**
 * Vite head component to be used in your application.
 * In development mode, it will add the corresponding
 * vite's dev entrypoints. In production mode, it will
 * grab the generated scripts using the in-house built
 * plugin "@timberstack/vite-plugin-better-manifest"
 * @module
 */

import { appConfig, viteScripts } from "./index.ts";

export const ViteHead = ({ script }: { script?: string }) => {
  if (!script) return null;

  if (appConfig.viteDevMode === false) {
    const scriptsString = viteScripts[script];
    return (
      <>
        {{ __html: scriptsString }}
      </>
    );
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
