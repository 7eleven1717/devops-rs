#!/usr/bin/env -S deno run -A

import { dirname, parse as parsePath, resolve } from "@std/path";
import { $ } from "@david/dax";
import * as core from "@actions/core";

const target = Deno.env.get("TARGET")!;
const binPaths = Deno.env.get("BIN_PATHS")?.split("\n").filter(Boolean) || [];
const isWindows = Deno.build.os === "windows";

const paths: string[] = [];

for (const binPath of binPaths) {
  const filename = `${parsePath(binPath).name}-${target}.zip`;
  const zipPath = `${resolve(dirname(binPath), filename)}`;
  const sha256sumPath = `${zipPath}.sha256sum`;
  paths.push(zipPath, sha256sumPath);

  const $sha256sumPath = $.path(sha256sumPath);

  if (isWindows) {
    await $`powershell -NoProfile -Command "Compress-Archive -CompressionLevel Optimal -Force -Path ${binPath} -DestinationPath ${zipPath}"`;
    // https://github.com/PowerShell/PowerShell/issues/8635#issuecomment-454028787
    await $`powershell -NoProfile -Command '$env:PSModulePath = \"$PSHOME/Modules\"; Get-FileHash ${zipPath} -Algorithm SHA256 | Format-List > ${$sha256sumPath}'`;
  } else {
    await $`zip -j ${zipPath} ${binPath}`;
    await $`shasum -a 256 ${zipPath} > ${$sha256sumPath}`;
  }
}

core.setOutput("paths", paths.join("\n"));
