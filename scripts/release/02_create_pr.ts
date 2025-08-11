#!/usr/bin/env -S deno run -A

// This script reffers to the original Deno script for creating a PR
// https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/02_create_pr.ts

import { Octokit } from "@octokit/rest";
import { $ } from "@david/dax";
import { parseArgs } from "@std/cli";
import { parse as parseSemver } from "@std/semver";

type Args = { version: string };
const { version } = parseArgs<Args>(Deno.args);

// Ensure the version is valid semver format
parseSemver(version);
if (version.startsWith("v")) {
  $.logError("Version should not start with 'v'.");
  Deno.exit(1);
}

const auth = Deno.env.get("GITHUB_TOKEN");
if (!auth) {
  $.logError("GITHUB_TOKEN is not set.");
  Deno.exit(1);
}

const originalBranch = await $`git branch --show-current`.text();
// https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/02_create_pr.ts#L12
const newBranchName = `release_${version.replace(/\./, "_")}`;

$.logStep(`Creating branch ${newBranchName}...`);
await $`git checkout -b ${newBranchName}`;

$.logStep("Bumping version...");
await $`cargo set-version ${version}`;

$.logStep(`Committing version bump...`);
await $.raw`git commit -am "${version}"`;

$.logStep(`Update CHANGELOG.md...`);
await $.raw`git-cliff --tag v${version} -o`;
await $`git commit -am "Update CHANGELOG.md"`;

$.logStep("Pushing branch...");
await $`git push -u origin HEAD`;

const octokit = new Octokit({ auth });
const repoUrl = await $`git remote get-url origin`.text();
const [owner, repo] = new URL(repoUrl).pathname.split("/").slice(1);
$.logStep("Opening PR...");
const openedPr = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
  owner,
  repo,
  base: originalBranch,
  head: newBranchName,
  draft: true,
  title: version,
  body: getPrBody(),
});
$.log(`Opened PR at ${openedPr.data.url}`);

// https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/02_create_pr.ts#L34
function getPrBody() {
  const text = `Bumped versions for ${version}`;
  return text;
}
