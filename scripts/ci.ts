#!/usr/bin/env -S deno run -A

import { Command } from "@cliffy/command";
import { $ } from "@david/dax";

await new Command()
  .command("install-cross", new Command().action(installCross))
  .command("aarch64-apple-darwin", new Command().action(aarch64AppleDarwin))
  .parse(Deno.args);

async function installCross() {
  if (!await $.commandExists("cross")) {
    await $`cargo install cross --git https://github.com/cross-rs/cross`;
  }
}

async function aarch64AppleDarwin() {
  const TARGET = "aarch64-apple-darwin-cross";
  const TAG = "main";
  const MACOS_SDK_URL =
    "https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.3.sdk.tar.xz";

  const actor = Deno.env.get("GITHUB_ACTOR")!;
  const ghToken = Deno.env.get("GITHUB_TOKEN")!;
  const repositoryOwner = Deno.env.get("GITHUB_REPOSITORY_OWNER")!;

  await $`echo ${ghToken} | docker login ghcr.io -u ${actor} --password-stdin`;

  const ownedTag = `ghcr.io/${repositoryOwner}/${TARGET}:${TAG}`;
  const originalTag = `ghcr.io/cross-rs/${TARGET}:${TAG}`;

  const result = await $`docker pull ${ownedTag}`
    .noThrow();

  if (result.code === 0) {
    await $`docker tag ${ownedTag} ${originalTag}`;
    Deno.exit(0);
  }

  await $`git clone https://github.com/cross-rs/cross ~/cross`;
  await $`cd ~/cross && git submodule update --init --remote`.exportEnv();
  await $`cargo build-docker-image ${TARGET} \
    --repository ghcr.io/${repositoryOwner} \
    --build-arg 'MACOS_SDK_URL=${MACOS_SDK_URL}'
    --labels "org.opencontainers.image.source=https://github.com/cross-rs/cross-toolchains"`;

  await $`docker images`;
  await $`docker inspect ${ownedTag}`;
  await $`docker push ${ownedTag}`;
}
