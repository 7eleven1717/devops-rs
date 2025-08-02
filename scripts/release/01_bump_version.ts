#!/usr/bin/env -S deno run -A

// This script reffers to the original Deno script for bumping versions
// https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/01_bump_crate_versions.ts

import { $ } from "jsr:@david/dax";
import { parseArgs } from "jsr:@std/cli";

type Args = { releaseKind?: "major" | "minor" | "patch"; dryRun?: boolean };
const { releaseKind, dryRun = false } = parseArgs<Args>(Deno.args);
const bump = releaseKind || "";

$.logStep("Getting bumped version...");
const result = await $
  .raw`git-cliff --bump ${bump} --bumped-version`
  .stdout("piped").stderr("piped");

if (result.stderr.includes("There is nothing to bump.")) {
  $.logWarn(result.stderr.replace(/\r?\n$/, "").trim());
  $.logError("No changes to bump version.");
  Deno.exit(1);
}

const bumpedVersion = result.stdout.replace(/\r?\n$/, "").slice(1);

const githubOutput = Deno.env.get("GITHUB_OUTPUT");
if (githubOutput) {
  await $`echo "version=${bumpedVersion}" >> ${githubOutput}`;
}

if (!dryRun) {
  $.logStep("Bumping version...");
  await $`cargo set-version ${bumpedVersion}`;
}
