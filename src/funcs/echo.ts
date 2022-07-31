import { Fn, Result } from "/funcs/_base.ts";
import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { loop } from "/util.ts";
import { log } from "/logger.ts";
import * as colors from "https://deno.land/std@0.150.0/fmt/colors.ts";
import { sprintf } from "https://deno.land/std@0.150.0/fmt/printf.ts";

type Args = {
  msg: string | string[];
};

export const echo: Fn = async (args) => {
  const _colors = colors;
  const _sprintf = sprintf;
  const a = args as Args;
  await _echo(a);
  return Result.SUCCESS;
};

async function _echo(args: Args) {
  if (isArray<string>(args.msg)) {
    await loop(args.msg, async (m) => {
      const a: Args = { msg: m };
      await _echo(a);
    });
    return;
  }
  // const templ = "`" + args.msg + "`";
  // log.debug(`[_echo] ${templ}`);
  // const evalMsg = eval(templ);
  // log.info(`[echo] ${evalMsg}`);
  log.info(`[echo] ${args.msg}`);
}
