#!/usr/bin/env node

import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

const getTransformer =
  (pattern: string | undefined, replacement = "", strip?: string) =>
  (name: string): string => {
    let res = name;
    if (strip && strip.length > 0) {
      const chars = escapeRegExp(strip);
      const stripRe = new RegExp("[" + chars + "]", "g");
      res = res.replace(stripRe, "");
    }

    if (pattern && pattern.length > 0) {
      const re = new RegExp(pattern, "g");
      res = res.replace(re, replacement);
    }

    return res;
  };

const getFilter =
  (itemType: string, nameFilter?: string) =>
  (fullPath: string, dirent: fs.Dirent): boolean => {
    let typeMatch = true;
    if (itemType === "file") typeMatch = dirent.isFile();
    else if (itemType === "dir") typeMatch = dirent.isDirectory();

    if (!typeMatch) return false;
    if (nameFilter && nameFilter.length > 0) {
      try {
        const re = new RegExp(nameFilter);
        if (!re.test(dirent.name)) return false;
      } catch (e) {
        // invalid regex -> filter out everything
        return false;
      }
    }

    return true;
  };

const processItems = async (
  items: Array<{ fullPath: string; dirent: fs.Dirent }>,
  filterFunc: (fullPath: string, dirent: fs.Dirent) => boolean,
  transformFunc: (name: string) => string,
  dryRun = false
): Promise<void> => {
  for (const { fullPath, dirent } of items) {
    if (!filterFunc(fullPath, dirent)) continue;

    const oldName = dirent.name;
    const newName = transformFunc(oldName);
    if (newName === oldName) continue;

    const dir = path.dirname(fullPath);
    const newPath = path.join(dir, newName);

    if (dryRun) {
      console.log(`[DRY RUN] Would rename: ${oldName} -> ${newName}`);
      continue;
    }

    try {
      await fs.promises.rename(fullPath, newPath);
      console.log(`Renamed: ${oldName} -> ${newName}`);
    } catch (err: any) {
      console.error(`Error renaming ${oldName}: ${err?.message ?? err}`);
    }
  }
};

const showHelp = (): string => {
  return `
EXAMPLES:
  1. Filter by extension and replace text:
     node ./dist/index.mjs ./pics -f ".jpg$" -p "DSC" -r "Vacation"

  2. Remove specific characters from folder names only:
     node ./dist/index.mjs ./data -t dir -s "()_-"

  3. Use regex groups to swap name parts (e.g., '2023_Report' to 'Report_2023'):
     node ./dist/index.mjs . -p "(\\d+)_(\\w+)" -r "\\2_\\1"

  4. Dry run to preview changes safely:
     node ./dist/index.mjs ./docs -s " " --dry-run

NOTES:
  - The 'Filter' (-f) selects WHICH files to touch.
  - The 'Pattern' (-p) defines WHAT to change inside the filename.
  - The 'Strip' (-s) removes every instance of the characters provided.
`;
};

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
