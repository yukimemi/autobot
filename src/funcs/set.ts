import { Fn, Result } from "./_base.ts";
import { expand, log } from "../util/mod.ts";
import { get } from "../vars.ts";

type Args = {
  [key: string]: string | string[];
};

// deno-lint-ignore require-await
export const set: Fn = async (sb: symbol, args) => {
  const a = args as Args;
  _set(sb, a);
  return Result.SUCCESS;
};

function _set(sb: symbol, args: Args) {
  const v = get(sb);
  for (const [key, value] of Object.entries(args)) {
    log.debug(`[${key}] <- [${value}] (before)`);
    log.debug(`[${expand(sb, key)}] <- [${expand(sb, value)}] (after)`);
    v[expand(sb, key) as string] = expand(sb, value);
  }
}
