import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

import { Fn, Result } from "./_base.ts";
import { log, loop } from "../util/mod.ts";
import { start } from "../main.ts";

type Task = {
  id: string;
  path?: string;
};

type Args = Task | Task[];

export const run: Fn = async (args) => {
  const a = args as Args;
  await _run(a);
  return Result.SUCCESS;
};

async function _run(args: Args) {
  if (isArray<Task>(args)) {
    await loop(args, async (a) => {
      await _run(a);
    });
    return;
  }
  log.debug(`[_run] Run id: [${args.id}], path: [${args.path}]`);
  await start(args.path, args.id, "try");
}
