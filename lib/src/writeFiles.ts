import { writeFileSync } from "node:fs";
import { cwd } from "node:process";

import type { AppGlobals } from "./appGlobals.ts";
import { routerTemplate, routesTypesTemplate } from "./templates.ts";
import type { Config } from "./config.ts";

export const writeTypesFiles = (appGlobals: AppGlobals, appConfig: Config) => {
  const fileRouterPath: string = `${cwd()}${appConfig.routerPath}`;

  const namedRoutesTypesFile = routesTypesTemplate.replace(
    "@routeTypes",
    Object.keys(appGlobals.namedRoutes).map((name, index) =>
      index === 0 ? `"${name}"` : `| "${name}"`
    ).join(" "),
  ).replace(
    "@actionTypes",
    Object.keys(appGlobals.actions).map((name, index) =>
      index === 0 ? `"${name}"` : `| "${name}"`
    ).join(" "),
  );

  writeFileSync(
    `${fileRouterPath}/routes.d.ts`,
    namedRoutesTypesFile,
  );
};

export const writeRoutesFile = (
  appGlobals: AppGlobals,
  appConfig: Config,
  routesStrings: string[],
) => {
  const fileRouterPath: string = `${cwd()}${appConfig.routerPath}`;
  const writeTemplate = routerTemplate
    .replace(
      "@routes",
      routesStrings.join("\n"),
    );

  writeFileSync(`${fileRouterPath}/router.js`, writeTemplate);
  writeFileSync(
    `${fileRouterPath}/names.json`,
    JSON.stringify({
      actions: appGlobals.actions,
      namedRoutes: appGlobals.namedRoutes,
    }),
  );
};
