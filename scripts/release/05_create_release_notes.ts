#!/usr/bin/env -S deno run -A

// This script reffers to the original Deno script for creating tag.
// https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/05_create_release_notes.ts

import * as core from "@actions/core";
import { $ } from "@david/dax";

await $`cargo install git-cliff`;
const body = await $`git-cliff --latest --strip all`.text();
$.log(body);
core.setOutput("body", body);
