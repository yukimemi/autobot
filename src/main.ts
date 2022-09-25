import "https://deno.land/std@0.157.0/dotenv/load.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.1/command/mod.ts";
import { isNullish } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { delay } from "https://deno.land/std@0.157.0/async/delay.ts";

import * as fn from "./funcs/mod.ts";
import { Result } from "./funcs/_base.ts";
import type { Func, ProcessType } from "./config/mod.ts";
import { expand, log, loop, pathParseEx, setupLogger } from "./util/mod.ts";
import {
  findTask,
  getConfig,
  initTask,
  parseConfig,
  updateCfgs,
} from "./config/mod.ts";
import { get, newVar, setConfig, setTask } from "./vars.ts";

const nips = new Worker(new URL("./util/nips.ts", import.meta.url).href, {
  type: "module",
});
nips.onmessage = ({ data }) => {
  if (data.action === "terminate") {
    nips.terminate();
  }
};

const version = "0.1.2";

await new Command()
  .name("autobot")
  .version(version)
  .description("Auto bot task")
  .globalOption("-d, --debug", "Enable debug output.")
  .globalOption("-c, --config <path>", "config file.", {
    default: "autobot.yml",
  })
  .action(async (options, ...args) => {
    log.debug("Main command called.", { options, args });
    await main(options.config);
  })
  .parse(Deno.args);

async function main(configPath: string) {
  const config = await parseConfig(configPath);
  // Create init vars.
  const sb = Symbol();
  newVar(sb);
  await setupLogger(sb, config);
  const v = get(sb);

  // Set app settings.
  v.app = pathParseEx(Deno.execPath());
  // Set config settings.
  v.cfg = pathParseEx(configPath);

  const mainId = "main";

  setConfig(sb, config);
  setTask(sb, mainId, config.path);
  await start(sb, configPath, mainId, "try");
  nips.postMessage({ action: "stop" });
}

export async function start(
  sb: symbol,
  path: string | undefined,
  id: string,
  processType: ProcessType,
) {
  const v = get(sb);
  log.info({ sb, path, id, processType });
  const nowConfig = { ...v.c };
  const nowTask = { ...v.t };

  const configPath = path ?? v.t.p.full;
  const config = await getConfig(configPath);
  if (!config.init) {
    config.init = true;
    updateCfgs(config);
    await start(sb, path, initTask, "try");
  }
  setConfig(sb, config);
  setTask(sb, id, config.path);

  const task = findTask(config.tasks, id);
  const process = task[id];
  if (isNullish(process)) {
    if (id === initTask) {
      log.debug(`[start] [${configPath}] - [${initTask}] is nothing !`);
      return;
    }
    throw `[start] [${configPath}] - [${id}] is nothing !`;
  }
  const p = process[processType];
  if (isNullish(p)) {
    log.error(`[${id}] process type: [${processType}] is not found !`);
    return;
  }

  let fName = "";
  let no = 0;
  try {
    await loop(p, async (f) => {
      no++;
      let result = 1;
      const msg = {
        uuid: crypto.randomUUID(),
        action: "start",
        no,
        path: v.t.p.path,
        id: v.t.id,
        func: f.func,
        type: processType,
        state: "${this.n.dots.spin()} ",
      };
      try {
        const [func, args] = [
          expand(sb, f.func) as Func["func"],
          expand(sb, f.args) as Func["args"],
        ];
        fName = func;
        nips.postMessage(msg);
        log.info(
          `[${v.t.p.path}] [${v.t.id}] [${no}] [${fName}] [${processType}]`,
        );
        result = await fn[func as keyof typeof fn](sb, args);
        await delay(200);
        if (result === Result.SUCCESS) {
          msg.state = "${this.n.dots.success()} ";
          nips.postMessage(msg);
        } else {
          msg.state = "${this.n.dots.fail()} ";
          nips.postMessage(msg);
        }
      } catch (e) {
        msg.state = "${this.n.dots.fail()} ";
        nips.postMessage(msg);
        throw e;
      }
    });
  } catch (e) {
    const logPrefix =
      `[${v.t.p.path}] [${v.t.id}] [${no}] [${fName}] [${processType}]`;
    log.error(`${logPrefix} error: ${e}`);
    if (process.catch && processType === "try") {
      log.info(`${logPrefix} Execute catch task !`);
      await start(sb, path, id, "catch");
    } else {
      throw e;
    }
  } finally {
    const logPrefix =
      `[${v.t.p.path}] [${v.t.id}] [${no}] [${fName}] [${processType}]`;
    if (process.finally && processType === "try") {
      log.info(`${logPrefix} Execute finally task !`);
      await start(sb, path, id, "finally");
    }
    const config = await getConfig(nowConfig.p.full);
    setConfig(sb, config);
    log.info("setTask end");
    setTask(sb, nowTask.id, config.path);
  }
}
