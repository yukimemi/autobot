import type { PathEx } from "/util/path.ts";

export type Vars = {
  app: PathEx;
  cfg: PathEx;
  c: {
    init: boolean;
    p: PathEx;
  };
  t: {
    id: string;
    p: PathEx;
  };
} & Record<string, unknown>;

export const v: Vars = {
  app: {
    path: "",
    full: "",
    base: "",
    dir: "",
    ext: "",
    name: "",
    root: "",
  },
  cfg: {
    path: "",
    full: "",
    base: "",
    dir: "",
    ext: "",
    name: "",
    root: "",
  },
  c: {
    init: false,
    p: {
      path: "",
      full: "",
      base: "",
      dir: "",
      ext: "",
      name: "",
      root: "",
    },
  },
  t: {
    id: "",
    p: {
      path: "",
      full: "",
      base: "",
      dir: "",
      ext: "",
      name: "",
      root: "",
    },
  },
};
