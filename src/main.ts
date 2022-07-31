import "https://deno.land/std@0.150.0/dotenv/load.ts";
import * as fn from "/funcs/mods.ts";
import type { Func, Process, ProcessType } from "/task.ts";
import type { Config } from "/config.ts";
import { Command } from "https://deno.land/x/cliffy@v0.24.3/command/mod.ts";
import { expand, loop } from "/util.ts";
import { findTask } from "/task.ts";
import { isNullish } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import { log, logUnderBold, setupLogger } from "/logger.ts";
import { parseYaml } from "/config.ts";

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
    log.info("Main command called.", { options, args });
    const config = await parseYaml(options.config) as Config;
    await setupLogger(config);

    await main(config);
  })
  .parse(Deno.args);

async function main(config: Config) {
  const id = "main";
  const mainTask = findTask(config.tasks, id);

  await start(id, mainTask[id], "try");
}

async function start(id: string, process: Process, processType: ProcessType) {
  const p = process[processType];
  if (isNullish(p)) {
    log.error(`[${id}] process type: [${processType}] is not found !`);
    return;
  }

  let fName = "";
  try {
    await loop(p, async (f) => {
      const logPrefix = `[${id}] [${f.func}] [${processType}]`;
      try {
        logUnderBold(
          `${logPrefix} ==================== start ====================`,
        );
        const [func, args] = [
          expand(f.func) as Func["func"],
          expand(f.args) as Func["args"],
        ];
        fName = func;
        const result = await fn[func as keyof typeof fn](args);
        log.info(`${logPrefix} result: ${result}`);
      } finally {
        logUnderBold(
          `${logPrefix} ==================== end ====================`,
        );
      }
    });
  } catch (e) {
    const logPrefix = `[${id}] [${fName}] [${processType}]`;
    log.error(`${logPrefix} error: ${e}`);
    log.debug(e);
    if (process.catch && processType === "try") {
      log.warning(`${logPrefix} Execute catch task !`);
      await start(id, process, "catch");
    }
  } finally {
    const logPrefix = `[${id}] [${fName}] [${processType}]`;
    if (process.finally && processType === "try") {
      log.info(`${logPrefix} Execute finally task !`);
      await start(id, process, "finally");
    }
  }
}
