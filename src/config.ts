import * as yaml from "https://deno.land/std@0.150.0/encoding/yaml.ts";
import { existsSync } from "/util.ts";
import type { Tasks } from "/task.ts";

export type Config = {
  tasks: Tasks;
  log: Record<string, string>;
};

export async function parseYaml(
  configPath: string,
): Promise<unknown> {
  if (!existsSync(configPath)) {
    throw `config path: ${configPath} is not found !`;
  }
  return yaml.parse(await Deno.readTextFile(configPath));
}
