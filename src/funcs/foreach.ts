import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { cloneDeep } from "https://cdn.skypack.dev/lodash@4.17.21";

import { Fn, Result } from "./_base.ts";
import { loop } from "../util/mod.ts";
import { start } from "../main.ts";
import { get, set } from "../vars.ts";

type Args = {
  get: string;
  set: string;
  task: {
    id: string;
    path?: string;
  };
  parallel?: boolean;
};

export const foreach: Fn = async (sb: symbol, args) => {
  const a = args as Args;
  await _foreach(sb, a);
  return Result.SUCCESS;
};

async function _foreach(sb: symbol, args: Args) {
  const v = get(sb);
  const g = v[args.get];
  if (isArray<unknown>(g)) {
    await loop(g, async (x) => {
      if (args.parallel) {
        const vc = cloneDeep(v);
        const sb = Symbol();
        set(sb, vc);
        vc[args.set] = x;
        await start(sb, args.task.path, args.task.id, "try");
      } else {
        v[args.set] = x;
        await start(sb, args.task.path, args.task.id, "try");
      }
    }, args.parallel);
    return;
  }
  v[args.set] = g;
  await start(sb, args.task.path, args.task.id, "try");
}
