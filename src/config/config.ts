import * as yaml from "https://deno.land/std@0.157.0/encoding/yaml.ts";
import { resolve } from "https://deno.land/std@0.157.0/path/mod.ts";

import type { Tasks } from "../config/mod.ts";
import { existsSync, log } from "../util/mod.ts";

export type Config = {
  tasks: Tasks;
  init: boolean;
  log: Record<string, string>;
  path: string;
};

export const cfgs = new Map<string, Config>();

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
  cfgs.set(cfg.path, cfg);
  return cfg;
}

export function isLoaded(path: string): boolean {
  const p = cfgs.get(path)?.path ?? "";
  if (resolve(p) === resolve(path)) {
    return true;
  }
  return false;
}

export async function addConfig(path: string): Promise<void> {
  if (isLoaded(path)) {
    log.debug(`[addConfig] ${path} is already loaded !`);
    return;
  }
  await parseConfig(path);
}

export async function getConfig(path: string): Promise<Config> {
  await addConfig(path);
  const c = cfgs.get(path);
  if (c == undefined) {
    throw `[getConfig] ${path} is not loaded`;
  }
  return c;
}

export function updateCfgs(config: Config) {
  cfgs.set(config.path, config);
}
