#!/usr/bin/env node

import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";

import { getTransformer, getFilter, showHelp } from "@/utils/index.mts";
import { processItems } from "@/core/index.mts";

const main = async (): Promise<void> => {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    console.log(showHelp());
    return;
  }

  const { values, positionals } = parseArgs({
    args: rawArgs,
    allowPositionals: true,
    options: {
      filter: { type: "string", short: "f" },
      type: { type: "string", short: "t" },
      pattern: { type: "string", short: "p" },
      replace: { type: "string", short: "r" },
      strip: { type: "string", short: "s" },
      "dry-run": { type: "boolean" },
    },
  });

  // widen types so we can safely access unknown properties and positionals
  const vals = values as Record<string, any>;
  const pos = positionals as string[];

  const target = (pos && pos[0]) || vals.path || vals._?.[0];
  if (!target) {
    console.log(
      "Usage: node index.mjs <path> [--filter|-f <regex>] [--type|-t file|dir|both] [--pattern|-p <regex>] [--replace|-r <text>] [--strip|-s <chars>] [--dry-run]"
    );
    console.log(showHelp());
    return;
  }

  const targetPath = String(target);
  try {
    const stat = await fs.promises.stat(targetPath);
    if (!stat.isDirectory()) {
      console.error(`Path not a directory: ${targetPath}`);
      return;
    }
  } catch (e) {
    console.error(`Path not found: ${targetPath}`);
    return;
  }

  const itemType = (values.type as string) || "both";
  const nameFilter = values.filter as string | undefined;
  const transformFunc = getTransformer(
    values.pattern as string | undefined,
    (values.replace as string) || "",
    values.strip as string | undefined
  );
  const filterFunc = getFilter(itemType, nameFilter);
  const dryRun = Boolean(values["dry-run"]);

  const dirents = await fs.promises.readdir(targetPath, {
    withFileTypes: true,
  });
  const items = dirents.map((d) => ({
    fullPath: path.join(targetPath, d.name),
    dirent: d,
  }));

  await processItems(items, filterFunc, transformFunc, dryRun);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
