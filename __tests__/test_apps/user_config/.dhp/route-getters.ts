import { appGlobals } from "dhp/mod.ts";
import type { Actions, Routes } from "./routes.d.ts";

export const route = (routeName: Routes, params = {}): string => {
  let foundRoute = appGlobals.namedRoutes[routeName];

  Object.entries(params).forEach(([key, value]) => {
    foundRoute = foundRoute.replace(":" + key, value as string);
  });
  return foundRoute ?? "not-found";
};

export const action = (
  actionName: Actions,
  params = {},
): string => {
  let foundAction = appGlobals.actions[actionName];

  Object.entries(params).forEach(([key, value]) => {
    foundAction = foundAction.replace(":" + key, value as string);
  });
  return foundAction ?? "not-found";
};
