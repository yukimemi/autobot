import * as colors from "https://deno.land/std@0.150.0/fmt/colors.ts";
import * as log from "https://deno.land/std@0.150.0/log/mod.ts";
import { ensureDir } from "https://deno.land/std@0.150.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.141.0/path/mod.ts";
import { getLogger, LogRecord } from "https://deno.land/std@0.150.0/log/mod.ts";
import { LevelName } from "https://deno.land/std@0.150.0/log/levels.ts";
import { expand } from "/util.ts";
import type { Config } from "/config.ts";

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

export { log };
