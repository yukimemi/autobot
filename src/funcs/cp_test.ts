import { assertEquals } from "https://deno.land/std@0.150.0/testing/asserts.ts";
import { Result } from "/funcs/_base.ts";
import { cp } from "/funcs/cp.ts";
import { existsSync } from "/util.ts";

const src = "src.txt";
const dst = "dst.txt";
const dst1 = "dst1.txt";
const dst2 = "dst2.txt";

Deno.test({
  name: "Normal cp test",
  async fn(): Promise<void> {
    await init();
    const result = await cp({
      src,
      dst,
      options: { overwrite: true },
    });
    console.log({ result });

    assertEquals(Result.SUCCESS, result);

    const sf = await Deno.readTextFile(src);
    const df = await Deno.readTextFile(dst);

    assertEquals(sf, df);
    end();
  },
});

Deno.test({
  name: "1 src -> 2 dst",
  async fn(): Promise<void> {
    await init();
    const result = await cp({
      src,
      dst: [dst1, dst2],
      options: { overwrite: true },
      parallel: true,
    });
    console.log({ result });

    assertEquals(Result.SUCCESS, result);

    const sf = await Deno.readTextFile(src);
    const df1 = await Deno.readTextFile(dst1);
    const df2 = await Deno.readTextFile(dst2);

    assertEquals(sf, df1);
    assertEquals(sf, df2);
    end();
  },
});

async function rm(path: string) {
  if (existsSync(path)) {
    await Deno.remove(path);
  }
}

async function init() {
  await removeTestFiles();
  await createTestFiles();
}

async function end() {
  await removeTestFiles();
}

async function createTestFiles() {
  await Deno.writeFile(dst, new TextEncoder().encode("This is dst file"));
  await Deno.writeFile(dst1, new TextEncoder().encode("This is dst1 file"));
  await Deno.writeFile(dst2, new TextEncoder().encode("This is dst2 file"));
  await Deno.writeFile(src, new TextEncoder().encode("This is src file"));
}
async function removeTestFiles() {
  await rm(src);
  await rm(src);
  await rm(dst1);
  await rm(dst2);
}

await end();
