import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

import { Fn, Result } from "./_base.ts";
import { log, loop, existsSync } from "../util/mod.ts";

type _Args = {
  path: string;
  options?: {
    recurse: boolean;
  }
};

type Args = (_Args | _Args[]) & {
  parallel?: boolean;
};

export const rm: Fn = async (args) => {
  const a = args as Args;
  await _rm(a);
  return Result.SUCCESS;
};

async function _rm(args: Args) {
  if (isArray<_Args>(args)) {
    await loop(args, async (a) => {
      await _rm(a);
    }, args.parallel);
    return;
  }

  log.debug(`rm ${args.path}, recurse: ${args.options?.recurse}`);

  if (!existsSync(args.path)) {
    log.debug(`${args.path} is not found !`);
    return;
  }

  if (args.options?.recurse) {
    await Deno.remove(args.path, { recursive: true });
  } else {
    await Deno.remove(args.path);
  }
}
