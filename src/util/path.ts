import * as path from "https://deno.land/std@0.157.0/path/mod.ts";

export type PathEx = {
  path: string;
  full: string;
  base: string;
  dir: string;
  ext: string;
  name: string;
  root: string;
};

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

export function pathParseEx(p: string): PathEx {
  const ret: PathEx = {
    path: "",
    full: "",
    base: "",
    dir: "",
    ext: "",
    name: "",
    root: "",
  };
  const full = path.resolve(p);
  const parsed = path.parse(full);
  ret.path = p;
  ret.full = full;
  ret.base = parsed.base;
  ret.dir = parsed.dir;
  ret.ext = parsed.ext;
  ret.name = parsed.name;
  ret.root = parsed.root;

  return ret;
}
