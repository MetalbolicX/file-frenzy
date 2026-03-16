import { promises, type Dirent } from "node:fs";
import { join } from "node:path";
import { processItems } from "../core/index.mts";
import { getFilter, getTransformer } from "../utils/index.mts";

export interface RenameOptions {
  type?: string;
  filter?: string;
  pattern?: string;
  replace?: string;
  strip?: string;
  dryRun?: boolean;
}

/**
 * Programmatically accesses a directory and processes item names based on provided logic.
 * @param {string} targetPath - Directory to operate within[cite: 18].
 * @param {RenameOptions} options - Rename configuration object[cite: 18].
 * @returns {Promise<void>}
 */
export const renameCommand = async (
  targetPath: string,
  options: RenameOptions,
): Promise<void> => {
  const itemType = options.type || "both";
  const filterFunc = getFilter(itemType, options.filter);
  const transformFunc = getTransformer(
    options.pattern,
    options.replace || "",
    options.strip,
  );

  const dirents = await promises.readdir(targetPath, { withFileTypes: true });
  // const items = dirents.reduce((acc, d) => [
  //   ...acc,
  //   { fullPath: join(targetPath, d.name), dirent: d }
  // ], [] as Array<{ fullPath: string; dirent: Dirent }>);
  const items = dirents.map((d) => ({
    fullPath: join(targetPath, d.name),
    dirent: d,
  }));

  await processItems(items, filterFunc, transformFunc, Boolean(options.dryRun));
};
