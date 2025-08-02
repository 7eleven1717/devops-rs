#!/usr/bin/env -S deno run -A

import { $ } from "jsr:@david/dax";
import { parseArgs } from "jsr:@std/cli";

$.logLight("Bumping version...");

type Args = { releaseKind?: "major" | "minor" | "patch" };
const { releaseKind } = parseArgs<Args>(Deno.args);
const bump = releaseKind || "";

const isGitHubActions = Deno.env.get("GITHUB_ACTIONS") === "true";

if (isGitHubActions) {
  $.logLight("Running in GitHub Actions environment");
  await $`git config --local user.name github-actions[bot]`;
  await $`git config --local user.email github-actions[bot]@users.noreply.github.com`;
}

const result = await $
  .raw`git-cliff --bump ${bump} --bumped-version`
  .stdout("piped").stderr("piped");

if (result.stderr.includes("There is nothing to bump.")) {
  $.logError(result.stderr.replace(/\r?\n$/, ""));
  Deno.exit(1);
}

const bumpedVersion = result.stdout.replace(/\r?\n$/, "");
const semver = bumpedVersion.slice(1);

await $`cargo set-version ${semver}`;
await $.raw`git-cliff --bump ${bump} -o`;

await $`
export GIT_CLIFF_TEMPLATE='\
	{% for group, commits in commits | group_by(attribute=\"group\") %}
	{{ group | upper_first }}\
	{% for commit in commits %}
		- {% if commit.breaking %}(breaking) {% endif %}{{ commit.message | upper_first }} ({{ commit.id | truncate(length=7, end=\"\") }})\
	{% endfor %}
	{% endfor %}'
`.exportEnv();

const changeLog = await $
  .raw`git-cliff --bump ${bump} --config detailed --unreleased --strip all`
  .text();

await $`git commit -am ${semver}`;
await $.raw`git
  -c user.name=github-actions[bot] \
  -c user.email=github-actions[bot]@users.noreply.github.com \
  tag -f -a "${bumpedVersion}" -m "Release ${bumpedVersion}" -m "${changeLog}"`;

if (isGitHubActions) {
  await $`git push origin HEAD --follow-tags`;
}
