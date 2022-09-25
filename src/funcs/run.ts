import { isArray } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { cloneDeep } from "https://cdn.skypack.dev/lodash@4.17.21";

import { Fn, Result } from "./_base.ts";
import { log, loop } from "../util/mod.ts";
import { start } from "../main.ts";
import { get, set } from "../vars.ts";

type Task = {
  id: string;
  path?: string;
};

type Args = {
  task: Task | Task[];
  parallel?: boolean;
};

export const run: Fn = async (sb: symbol, args) => {
  const a = args as Args;
  await _run(sb, a);
  return Result.SUCCESS;
};

async function _run(sb: symbol, args: Args) {
  if (isArray<Task>(args.task)) {
    await loop(args.task, async (a) => {
      await _run(sb, { task: a, parallel: args.parallel });
    }, args.parallel);
    return;
  }
  log.info(
    `[_run] Run id: [${args.task.id}], path: [${args.task.path}], parallel: [${args.parallel}]`,
  );
  if (args.parallel) {
    const vc = cloneDeep(get(sb));
    const s = Symbol();
    set(s, vc);
    await start(s, args.task.path, args.task.id, "try");
  } else {
    await start(sb, args.task.path, args.task.id, "try");
  }
}
