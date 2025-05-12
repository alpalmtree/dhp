import { writeFileSync } from "node:fs";
import { cwd } from "node:process";
import { existsSync } from "node:fs";

import type { AppGlobals } from "./appGlobals.ts";
import {
  bootstrapTemplate,
  defaultConfigTemplate,
  routeGettersTemplate,
  routesTypesTemplate,
} from "./templates.ts";
import type { Config } from "./config.ts";

export const writeConfigFile = () => {
  if (!existsSync(`${cwd()}/dhp.config.ts`)) {
    writeFileSync(`${cwd()}/dhp.config.ts`, defaultConfigTemplate);
  }
};

export const writeTypesFiles = (appGlobals: AppGlobals, appConfig: Config) => {
  const fileRouterPath: string = `${cwd()}${appConfig.routerPath}`;
  const namedRoutesKeys = Object.keys(appGlobals.namedRoutes);
  const actionsKeys = Object.keys(appGlobals.actions);

  const namedRoutesTypesFile = routesTypesTemplate.replace(
    "@routeTypes",
    namedRoutesKeys.length
      ? namedRoutesKeys.map((name, index) =>
        index === 0 ? `"${name}"` : `| "${name}"`
      ).join(" ")
      : '""',
  ).replace(
    "@actionTypes",
    actionsKeys.length
      ? actionsKeys.map((name, index) =>
        index === 0 ? `"${name}"` : `| "${name}"`
      ).join(" ")
      : '""',
  );

  writeFileSync(
    `${fileRouterPath}/routes.d.ts`,
    namedRoutesTypesFile,
  );
};

export const writeRouteGettersFile = (appConfig: Config) => {
  writeFileSync(
    `${cwd()}${appConfig.routerPath}/route-getters.ts`,
    routeGettersTemplate,
  );
};

export const writeBootstrapFile = (appConfig: Config, dev = true) => {
  writeFileSync(
    `${cwd()}${appConfig.routerPath}/bootstrap.ts`,
    bootstrapTemplate(appConfig, dev),
  );
};
