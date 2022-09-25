import * as colors from "https://deno.land/std@0.157.0/fmt/colors.ts";
import * as log from "https://deno.land/std@0.157.0/log/mod.ts";
import { ensureDir } from "https://deno.land/std@0.157.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.157.0/path/mod.ts";
import { getLogger, LogRecord } from "https://deno.land/std@0.157.0/log/mod.ts";
import { LevelName } from "https://deno.land/std@0.157.0/log/levels.ts";
import { Nip, Nips } from "https://deno.land/x/nips@0.1.2/mod.ts";

import type { Config } from "../config/mod.ts";
import { expand, pathParseEx } from "./mod.ts";
import { get, set } from "../vars.ts";

export async function setupLogger(sb: symbol, config: Config): Promise<void> {
  const filename = expand(sb, config.log?.path || "./autobot.log") as string;
  const logLevel = expand(
    sb,
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

  log.setup({
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
        handlers: ["file"],
      },
    },
  });

  const v = get(sb);
  v.log = {
    level: logLevel,
    p: pathParseEx(filename),
  };
  // set(sb, v);

  getLogger();
}

const dots = new Nip(
  ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map(colors.cyan),
  ["✔"].map(colors.green),
  ["✘"].map(colors.red),
);

const nips = new Nips({
  interval: 70,
  n: { dots },
});

export { log, nips };
