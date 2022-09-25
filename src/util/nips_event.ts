import * as colors from "https://deno.land/std@0.157.0/fmt/colors.ts";
import { EventEmitter } from "https://deno.land/std@0.157.0/node/events.ts";
import { Nip, Nips } from "https://deno.land/x/nips@0.1.2/mod.ts";

type Fn = {
  no: number;
  path: string;
  id: string;
  func: string;
  type: string;
  state: string;
};

const dots = new Nip(
  ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map(colors.cyan),
  ["✔"].map(colors.green),
  ["✘"].map(colors.red),
);

const nips = new Nips({
  interval: 70,
  n: { dots },
});

const fns = new Map<symbol, Fn>();

export const ee = new EventEmitter();

ee.on("nips", (data) => {
  switch (data.action) {
    case "start":
      console.log("start");
      fns.set(data.sb, {
        no: data.no,
        path: data.path,
        id: data.id,
        func: data.func,
        type: data.type,
        state: data.state,
      });
      start();
      break;
    case "stop":
      stop();
      break;
    case "clear":
      nips.clear(data.count);
      break;
    default:
  }
});

function start() {
  const text = getText();
  nips.start(text.join("\n"));
}

function stop() {
  const text = getText();
  nips.stop(text.join("\n") + "\n");
}

function getText() {
  return [...fns.values()].map((fn, idx) => {
    `${fn.state} ${idx}-${fn.no} ${fn.path} ${fn.id} ${fn.func} [${fn.type}]`;
  });
}
