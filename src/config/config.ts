import * as yaml from "https://deno.land/std@0.150.0/encoding/yaml.ts";
import { resolve } from "https://deno.land/std@0.150.0/path/mod.ts";

import type { Tasks } from "../config/mod.ts";
import { existsSync, log, pathParseEx } from "../util/mod.ts";
import { v } from "../vars.ts";

export type Config = {
  tasks: Tasks;
  init: boolean;
  log: Record<string, string>;
  path: string;
};

export let cfgs: Config[] = [];

export async function parseConfig(
  configPath: string,
): Promise<Config> {
  if (!existsSync(configPath)) {
    throw `config path: ${configPath} is not found !`;
  }
  log.debug(`[parseConfig] load ${configPath}.`);
  const cfg = yaml.parse(await Deno.readTextFile(configPath)) as Config;
  cfg.path = configPath;
  cfg.init = false;
  cfgs.push(cfg);
  return cfg;
}

export function isLoaded(path: string): boolean {
  return cfgs.some((c) => resolve(c.path) === resolve(path));
}

export async function addConfig(path: string): Promise<void> {
  if (isLoaded(path)) {
    log.debug(`[addConfig] ${path} is already loaded !`);
    return;
  }
  await parseConfig(path);
}

export function findConfig(path: string): Config | undefined {
  return cfgs.find((c) => resolve(c.path) === resolve(path));
}

export async function getConfig(path: string): Promise<Config> {
  await addConfig(path);
  return (findConfig(path) as Config);
}

export function updateCfgs(config: Config) {
  cfgs = cfgs.map((c) => {
    if (c.path === config.path) {
      return config;
    }
    return c;
  });
}

export function setConfig(config: Config): void {
  v.c = {
    init: config.init,
    p: pathParseEx(config.path),
  };
}
