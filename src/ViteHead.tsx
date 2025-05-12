/** @jsxRuntime automatic *//** @jsxImportSource npm:hono@4.7.9/jsx */

/**
 * Vite head component to be used in your application.
 * In development mode, it will add the corresponding
 * vite's dev entrypoints. In production mode, it will
 * grab the generated scripts using the in-house built
 * plugin "@timberstack/vite-plugin-better-manifest"
 * @module 
 */

import { appConfig, viteScripts } from "./index.ts";
import { raw, html } from "npm:hono@4.7.x/html"
import type { FC } from "npm:hono@4.7.x/jsx"

export const ViteHead: FC<{script?: string}> = ({ script }) => {
  if (!script) return html``;

  if (appConfig.viteDevMode === false) {
    const scriptsString = viteScripts[script];
    return html`${raw(scriptsString)}`;
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
