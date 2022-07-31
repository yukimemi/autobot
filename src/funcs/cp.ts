import { Fn, Result } from "/funcs/_base.ts";
import { copy, CopyOptions } from "https://deno.land/std@0.150.0/fs/mod.ts";
import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { loop } from "/util.ts";
import { log } from "/logger.ts";

type Args = {
  src: string | string[];
  dst: string | string[];
  options?: CopyOptions;
  parallel?: boolean;
};

export const cp: Fn = async (args) => {
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

  log.info(`[${args.src}] -> [${args.dst}]`);
  await copy(args.src, args.dst, args.options);
}
