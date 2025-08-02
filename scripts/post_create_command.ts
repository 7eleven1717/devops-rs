#!/usr/bin/env -S deno run --allow-all
import { $ } from "jsr:@david/dax";

await $`gh extension install https://github.com/nektos/gh-act`.noThrow();

await $`curl https://i.jpillora.com/orhun/git-cliff! | bash`;
