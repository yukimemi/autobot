import * as colors from "https://deno.land/std@0.150.0/fmt/colors.ts";
import * as log from "https://deno.land/std@0.150.0/log/mod.ts";
import { ensureDir } from "https://deno.land/std@0.150.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.150.0/path/mod.ts";
import { getLogger, LogRecord } from "https://deno.land/std@0.150.0/log/mod.ts";
import { LevelName } from "https://deno.land/std@0.150.0/log/levels.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";
import { SPINNERS } from "https://deno.land/x/cli_spinners@v0.0.2/spinners.ts";
import { randomNumber } from "https://deno.land/x/random_number@2.0.0/mod.ts";

import type { Config } from "../config/mod.ts";
import { expand, pathParseEx } from "./mod.ts";
import { v } from "../vars.ts";

export async function setupLogger(config: Config): Promise<void> {
  const filename = expand(config.log?.path || "./autobot.log") as string;
  const logLevel = expand(
    Deno.env.get("LOGLEVEL") || config.log?.level || "INFO",
  ) as LevelName;

  await ensureDir(dirname(filename));

  const formatter = (logRecord: LogRecord) => {
    const { datetime, levelName, msg } = logRecord;

    const d = new Date(datetime.getTime() - datetime.getTimezoneOffset() * 6e4);
    const logTime = d.toISOString().slice(0, -5) +
      d.toString().replace(/^.*GMT([-+]\d{2})(\d{2}).*$/, "$1:$2");

    return `${logTime} ${levelName.padEnd(7)} ${msg}`;
  };

  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(logLevel, {
        formatter,
      }),

      file: new log.handlers.FileHandler(logLevel, {
        filename,
        formatter,
      }),
    },

    loggers: {
      default: {
        level: logLevel,
        handlers: ["console", "file"],
      },
    },
  });

  v.log = {
    level: logLevel,
    p: pathParseEx(filename),
  };

  getLogger();
}

export function logUnderBold(msg: string) {
  log.info(
    colors.underline(
      colors.bold(
        colors.magenta(msg),
      ),
    ),
  );
}

const spinner = Spinner.getInstance();

export async function spinnerStop() {
  if (spinner.isRunning()) {
    await spinner.stop();
  }
}

export async function funcStart(msg: string) {
  await spinnerStop();
  const spinnerTypes = Object.keys(SPINNERS);
  const r = randomNumber({ max: spinnerTypes.length - 1 });
  spinner.setSpinnerType(spinnerTypes[r] as keyof typeof SPINNERS);
  await spinner.start(msg);
}

export async function funcStop(
  state: "succeed" | "fail" | "warn" | "info",
  msg: string,
) {
  if (state === "succeed") {
    await spinner.succeed(msg);
    return;
  }
  if (state === "fail") {
    await spinner.fail(msg);
    return;
  }
  if (state === "warn") {
    await spinner.warn(msg);
    return;
  }
  if (state === "info") {
    await spinner.info(msg);
    return;
  }
}

export { log };
