import {
  copy,
  CopyOptions,
  ensureDir,
} from "https://deno.land/std@0.157.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.157.0/path/mod.ts";
import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

import { Fn, Result } from "./_base.ts";
import { log, loop } from "../util/mod.ts";

type Args = {
  src: string | string[];
  dst: string | string[];
  options?: CopyOptions;
  parallel?: boolean;
};

export const cp: Fn = async (_sb: symbol, args) => {
  const a = args as Args;
  await _cp(a);
  return Result.SUCCESS;
};

async function _cp(args: Args) {
  if (isArray<string>(args.src)) {
    await loop(args.src, async (s) => {
      const a: Args = {
        src: s,
        dst: args.dst,
        options: args.options,
      };
      await _cp(a);
    }, args.parallel);
    return;
  }

  if (isArray<string>(args.dst)) {
    await loop(args.dst, async (d) => {
      const a: Args = {
        src: args.src,
        dst: d,
        options: args.options,
      };
      await _cp(a);
    }, args.parallel);
    return;
  }

  log.debug(`Create [${args.dst}]'s dir`);
  await ensureDir(dirname(args.dst));

  log.info(`[${args.src}] -> [${args.dst}]`);
  await copy(args.src, args.dst, args.options);
}
