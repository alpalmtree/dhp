import { writeFileSync } from "node:fs";
import { cwd } from "node:process";
import { existsSync } from "node:fs";

import type { AppGlobals } from "./appGlobals.ts";
import {
  bootstrapTemplate,
  defaultConfigTemplate,
  resolverTemplate,
  routeGettersTemplate,
  routesTypesTemplate,
} from "./templates.ts";

export const writeConfigFile = () => {
  if (existsSync(`${cwd()}/dhp.config.ts`)) return;

  writeFileSync(`${cwd()}/dhp.config.ts`, defaultConfigTemplate);
};

export const writeResolverFile = () => {
  if (existsSync(`${cwd()}/.dhp/resolver.ts`)) return;

  writeFileSync(
    `${cwd()}/.dhp/resolver.ts`,
    resolverTemplate,
  );
};

export const writeTypesFiles = (appGlobals: AppGlobals) => {
  const fileRouterPath: string = `${cwd()}/.dhp`;
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

export const writeTypesFilesOnInit = () => {
  if (existsSync(`${cwd()}/.dhp/routes.d.ts`)) return;

  writeFileSync(
    `${cwd()}/.dhp/routes.d.ts`,
    routesTypesTemplate.replace("@routeTypes", '""').replace(
      "@actionTypes",
      '""',
    ),
  );
};

export const writeRouteGettersFile = () => {
  if (existsSync(`${cwd()}/.dhp/route-getters.ts`)) return;

  writeFileSync(
    `${cwd()}/.dhp/route-getters.ts`,
    routeGettersTemplate,
  );
};

export const writeBootstrapFile = () => {
  if (existsSync(`${cwd()}/.dhp/bootstrap.ts`)) return;

  writeFileSync(
    `${cwd()}/.dhp/bootstrap.ts`,
    bootstrapTemplate,
  );
};
