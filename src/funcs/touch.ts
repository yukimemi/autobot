import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { ensureFile } from "https://deno.land/std@0.157.0/fs/mod.ts";

import { Fn, Result } from "./_base.ts";
import { log, loop } from "../util/mod.ts";

type Args = {
  path: string | string[];
  parallel?: boolean;
};

export const touch: Fn = async (_sb: symbol, args) => {
  const a = args as Args;
  await _touch(a);
  return Result.SUCCESS;
};

async function _touch(args: Args) {
  if (isArray<string>(args.path)) {
    await loop(args.path, async (path) => {
      const a: Args = {
        path,
        parallel: args.parallel,
      };
      await _touch(a);
    }, args.parallel);
    return;
  }

  log.debug(`touch ${args.path}`);
  await ensureFile(args.path);

  const f = await Deno.open(args.path, { write: true });
  await f.write(new Uint8Array());
  f.close();
}
