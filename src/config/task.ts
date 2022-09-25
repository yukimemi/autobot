import { filterKeys } from "https://deno.land/std@0.157.0/collections/filter_keys.ts";
import { log, pathParseEx } from "../util/mod.ts";
import type { PathEx } from "../util/mod.ts";

export type ProcessType = "try" | "catch" | "finally";

export type Func = {
  func: string;
  args: Record<string, unknown> | Record<string, unknown>[];
};

export type Process = {
  try: Func[];
  catch?: Func[];
  finally?: Func[];
};

export type Tasks = {
  [id: string]: Process;
};

export type Task = {
  id: string;
  p: PathEx;
};

export const initTask = "init";

export function findTask(tasks: Tasks, id: string): Record<string, Process> {
  return filterKeys(tasks, (x: string) => x === id);
}
