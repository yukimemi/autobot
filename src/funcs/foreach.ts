import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

import { Fn, Result } from "./_base.ts";
import { loop } from "../util/mod.ts";
import { start } from "../main.ts";
import { v } from "../vars.ts";

type Args = {
  get: string;
  set: string;
  task: {
    id: string;
    path?: string;
  };
};

export const foreach: Fn = async (args) => {
  const a = args as Args;
  await _foreach(a);
  return Result.SUCCESS;
};

async function _foreach(args: Args) {
  const get = v[args.get];
  if (isArray<unknown>(get)) {
    await loop(get, async (x) => {
      v[args.set] = x;
      await start(args.task.path, args.task.id, "try");
    });
    return;
  }
  v[args.set] = get;
  await start(args.task.path, args.task.id, "try");
}
