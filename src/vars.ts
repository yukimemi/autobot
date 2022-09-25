import type { PathEx } from "./util/path.ts";
import type { Config } from "./config/mod.ts";
import { log, pathParseEx } from "./util/mod.ts";
import { isUndefined } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

export type Vars = {
  app: PathEx;
  cfg: PathEx;
  c: {
    init: boolean;
    p: PathEx;
  };
  t: {
    id: string;
    p: PathEx;
  };
} & Record<string, unknown>;

const vars = new Map<symbol, Vars>();

const initVar = {
  app: {
    path: "",
    full: "",
    base: "",
    dir: "",
    ext: "",
    name: "",
    root: "",
  },
  cfg: {
    path: "",
    full: "",
    base: "",
    dir: "",
    ext: "",
    name: "",
    root: "",
  },
  c: {
    init: false,
    p: {
      path: "",
      full: "",
      base: "",
      dir: "",
      ext: "",
      name: "",
      root: "",
    },
  },
  t: {
    id: "",
    p: {
      path: "",
      full: "",
      base: "",
      dir: "",
      ext: "",
      name: "",
      root: "",
    },
  },
};

export function newVar(sb: symbol): void {
  vars.set(sb, initVar);
}

export function get(sb: symbol): Vars {
  const v = vars.get(sb);
  if (isUndefined(v)) {
    throw "Not found thread vars.";
  }
  return v;
}

export function set(sb: symbol, v: Vars): void {
  vars.set(sb, v);
}

export function setConfig(sb: symbol, config: Config): void {
  log.debug(`[setConfig] config: [${config}]`);
  const v = get(sb);

  v.c = {
    init: config.init,
    p: pathParseEx(config.path),
  };
  set(sb, v);
}

export function getConfig(sb: symbol) {
  const v = get(sb);
  return { ...v.c };
}

export function setTask(sb: symbol, id: string, path: string): void {
  log.debug(`[setTask] id: [${id}], path: [${path}]`);
  const v = get(sb);

  v.t = {
    id: id,
    p: pathParseEx(path),
  };

  set(sb, v);
}

export { vars };
