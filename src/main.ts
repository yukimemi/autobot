import "https://deno.land/std@0.150.0/dotenv/load.ts";
import * as colors from "https://deno.land/std@0.150.0/fmt/colors.ts";
import { Command } from "https://deno.land/x/cliffy@v0.24.3/command/mod.ts";
import { isNullish } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { delay } from "https://deno.land/std@0.151.0/async/delay.ts";

import * as fn from "./funcs/mod.ts";
import { Result } from "./funcs/_base.ts";
import type { Func, ProcessType } from "./config/mod.ts";
import {
  expand,
  funcStart,
  funcStop,
  log,
  loop,
  pathParseEx,
  setupLogger,
} from "./util/mod.ts";
import {
  findTask,
  getConfig,
  initTask,
  parseConfig,
  setConfig,
  setTask,
  updateCfgs,
} from "./config/mod.ts";
import { v } from "./vars.ts";

const version = "0.1.0";

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
  await setupLogger(config);
  // Set app settings.
  v.app = pathParseEx(Deno.execPath());
  // Set config settings.
  v.cfg = pathParseEx(configPath);
  // Set start stack indent.
  v.indent = -1;

  const mainId = "main";

  setConfig(config);
  setTask(mainId, config.path);
  await start(configPath, mainId, "try");
}

export async function start(
  path: string | undefined,
  id: string,
  processType: ProcessType,
) {
  const nowConfig = { ...v.c };
  const nowTask = { ...v.t };

  const configPath = path ?? v.t.p.full;
  const config = await getConfig(configPath);
  if (!config.init) {
    config.init = true;
    updateCfgs(config);
    await start(path, initTask, "try");
  }
  setConfig(config);
  setTask(id, config.path);

  const task = findTask(config.tasks, id);
  // console.log({ v });
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

  v.indent = (v.indent as number) + 1;
  let fName = "";
  let no = 0;
  const logIndent = v.indent as number;
  try {
    await loop(p, async (f) => {
      no++;
      const logPrefix = `${
        "  ".repeat(logIndent)
      }[${v.t.p.path}] [${v.t.id}] [${no}] [${f.func}] [${processType}]`;
      let result = 1;
      try {
        await funcStart(
          colors.cyan(
            `${logPrefix} start`,
          ),
        );
        const [func, args] = [
          expand(f.func) as Func["func"],
          expand(f.args) as Func["args"],
        ];
        fName = func;
        await delay(1000);
        result = await fn[func as keyof typeof fn](args);
        if (result === Result.SUCCESS) {
          await funcStop(
            "succeed",
            colors.green(
              `${logPrefix} succeed: [${result}]`,
            ),
          );
        } else {
          await funcStop(
            "fail",
            colors.red(
              `${logPrefix} fail: [${result}]`,
            ),
          );
        }
      } catch (e) {
        await funcStop(
          "fail",
          colors.red(
            `${logPrefix} fail: [${result}]`,
          ),
        );
        throw e;
      }
    });
  } catch (e) {
    const logPrefix = `${
      "  ".repeat(logIndent)
    }[${id}] [${no}] [${fName}] [${processType}]`;
    log.error(`${logPrefix} error: ${e}`);
    log.debug(e);
    if (process.catch && processType === "try") {
      log.debug(`${logPrefix} Execute catch task !`);
      await start(path, id, "catch");
    } else {
      throw e;
    }
  } finally {
    const logPrefix = `${
      "  ".repeat(logIndent)
    }[${id}] [${no}] [${fName}] [${processType}]`;
    if (process.finally && processType === "try") {
      log.debug(`${logPrefix} Execute finally task !`);
      await start(path, id, "finally");
    }
    const config = await getConfig(nowConfig.p.full);
    setConfig(config);
    log.info("setTask end");
    setTask(nowTask.id, config.path);
    v.indent = (v.indent as number) - 1;
  }
}
