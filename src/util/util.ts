import * as colors from "https://deno.land/std@0.157.0/fmt/colors.ts";
import * as path from "https://deno.land/std@0.157.0/path/mod.ts";
import { format } from "https://deno.land/std@0.157.0/datetime/mod.ts";
import { sprintf } from "https://deno.land/std@0.157.0/fmt/printf.ts";
import {
  isArray,
  isObject,
  isString,
} from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

import { log } from "./mod.ts";
import { get } from "../vars.ts";

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

export function expand(sb: symbol, x: unknown | string): unknown {
  const v = get(sb);
  const _format = format;
  const _colors = colors;
  const _sprintf = sprintf;
  const p = path;
  if (isObject(x)) {
    const o: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(x)) {
      o[expand(sb, key) as string] = expand(sb, value);
    }
    return o;
  }

  if (isArray(x)) {
    return x.map((y) => expand(sb, y));
  }

  if (isString(x)) {
    const before = "`" + x + "`";
    // log.debug(`[expand] before: ${before}`);
    const after = eval(before);
    // log.debug(`[expand] after: ${after}`);
    return after;
  }

  return x;
}
