import { Fn, Result } from "./_base.ts";
import { expand, log } from "../util/mod.ts";
import { v } from "../vars.ts";

type Args = {
  [key: string]: string | string[];
};

// deno-lint-ignore require-await
export const set: Fn = async (args) => {
  const _v = v;
  const a = args as Args;
  _set(a);
  return Result.SUCCESS;
};

function _set(args: Args) {
  for (const [key, value] of Object.entries(args)) {
    log.debug(`[${key}] <- [${value}] (before)`);
    log.debug(`[${expand(key)}] <- [${expand(value)}] (after)`);
    v[expand(key) as string] = expand(value);
  }
}
