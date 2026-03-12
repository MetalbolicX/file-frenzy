#!/usr/bin/env node

import { parseArgs } from "node:util";
import { promises } from "node:fs";
import { showHelp, showExamples } from "./utils/index.mts";
import { renameCommand, type RenameOptions } from "./core/main.mts";

/**
 * Main command line execution runtime.
 * Parses arguments and delegates the renaming logic to the programmatic API.
 * @returns {Promise<void>} Resolves when the CLI execution finishes.
 */
const main = async (): Promise<void> => {
  const rawArgs = process.argv.slice(2);

  const { values } = parseArgs({
    args: rawArgs,
    allowPositionals: false,
    options: {
      help: { type: "boolean", short: "h" },
      example: { type: "boolean", short: "e" },
      directory: { type: "string", short: "d" },
      filter: { type: "string", short: "f" },
      type: { type: "string", short: "t" },
      pattern: { type: "string", short: "p" },
      replace: { type: "string", short: "r" },
      strip: { type: "string", short: "s" },
      "dry-run": { type: "boolean" },
    },
  });

  // 1. Handle Help Flag
  if (values.help) {
    console.log(showHelp());
    return;
  }

  // 2. Handle Example Flag
  if (values.example) {
    console.log(showExamples());
    return;
  }

  // 3. Handle Missing Directory
  if (!values.directory) {
    console.error("Error: The --directory (-d) flag is required.\n");
    console.log(showHelp());
    return;
  }

  const targetPath = String(values.directory);

  try {
    const stat = await promises.stat(targetPath);
    if (!stat.isDirectory()) {
      console.error(`Path not a directory: ${targetPath}`);
      return;
    }
  } catch {
    console.error(`Path not found: ${targetPath}`);
    return;
  }

  const options: RenameOptions = {
    type: values.type as string | undefined,
    filter: values.filter as string | undefined,
    pattern: values.pattern as string | undefined,
    replace: values.replace as string | undefined,
    strip: values.strip as string | undefined,
    dryRun: Boolean(values["dry-run"]),
  };

  await renameCommand(targetPath, options);
};

if (import.meta.main) main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
