#!/usr/bin/env -S deno run -A

// This script reffers to the original Deno script for creating a PR
//https://github.com/denoland/deno/blob/c86e277fc1e0795f3602981e36c690e1abfbfe49/tools/release/04_post_publish.ts

import { $ } from "@david/dax";
import { parseArgs } from "@std/cli";
import { parse as parseSemver } from "@std/semver";

type Args = { version: string };
const { version } = parseArgs<Args>(Deno.args);

// Ensure the version is valid semver format
parseSemver(version);

$.logStep("Creating release tag...");
await createReleaseTag();

async function createReleaseTag() {
  const tagName = version.startsWith("v") ? version : `v${version}`;
  await $`git fetch origin --tags`;
  const tags = (await $`git tag`.text()).split("\n");
  if (tags.includes(tagName)) {
    $.log(`Tag ${tagName} already exists.`);
  } else {
    const changeLog = await getChangeLog(tagName);
    await $
      .raw`git tag -a ${tagName} -m "Release ${tagName}" -m "${changeLog}"`;
    await $`git push origin ${tagName}`;
  }
}

// generate a changelog for the tag message
// https://github.com/orhun/git-cliff/blob/05eb1923aef586d7fabf14c9894af43da5124d76/release.sh#L24
async function getChangeLog(tagName: string) {
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
    .raw`git-cliff --tag ${tagName} --config detailed --unreleased --strip all`
    .text();

  return changeLog;
}
