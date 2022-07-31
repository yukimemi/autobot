import { log } from "/logger.ts";
import * as colors from "https://deno.land/std@0.150.0/fmt/colors.ts";
import { sprintf } from "https://deno.land/std@0.150.0/fmt/printf.ts";
import { format } from "https://deno.land/std@0.150.0/datetime/mod.ts";
import * as path from "https://deno.land/std@0.150.0/path/mod.ts";
import {
  isArray,
  isObject,
  isString,
} from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

export function existsSync(filePath: string): boolean {
  try {
    Deno.lstatSync(filePath);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export async function loop<T>(
  array: Array<T>,
  fn: (t: T) => Promise<void>,
  parallel = false,
): Promise<void> {
  if (parallel) {
    log.debug(`[loop] parallel execute`);
    await Promise.all(array.map(fn));
  } else {
    log.debug(`[loop] serial execute`);
    for await (const a of array) {
      await fn(a);
    }
  }
}

export function expand(x: unknown | string): unknown {
  const _format = format;
  const _colors = colors;
  const _sprintf = sprintf;
  const _path = path;
  if (isObject(x)) {
    const o: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(x)) {
      o[expand(key) as string] = expand(value);
    }
    return o;
  }

  if (isArray(x)) {
    return x.map(expand);
  }

  if (isString(x)) {
    const before = "`" + x + "`";
    log.debug(`[expand] before: ${before}`);
    const after = eval(before);
    log.debug(`[expand] after: ${after}`);
    return after;
  }

  return x;
}
