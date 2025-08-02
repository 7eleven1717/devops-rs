#!/usr/bin/env -S deno run -A

import { $ } from "@david/dax";

await $`cargo install cargo-edit`;
await $`cargo install git-cliff`;
