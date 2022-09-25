import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import * as colors from "https://deno.land/std@0.157.0/fmt/colors.ts";

import { Fn, Result } from "./_base.ts";
import { log, loop } from "../util/mod.ts";

type Msg = {
  msg: string;
  color?: string;
};

type Args = Msg | Msg[];

export const echo: Fn = async (_sb: symbol, args) => {
  const a = args as Args;
  await _echo(a);
  return Result.SUCCESS;
};

async function _echo(args: Args) {
  if (isArray<Msg>(args)) {
    await loop(args, async (msg: Msg) => {
      await _echo(msg);
    });
    return;
  }
  if (args.color) {
    const colorFunc = colors[args.color as keyof typeof colors] as (
      str: string,
    ) => string;
    log.info(`[echo] ${colorFunc(args.msg)}`);
  } else {
    log.info(`[echo] ${args.msg}`);
  }
}
