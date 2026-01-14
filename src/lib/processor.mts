import fs from "node:fs";
import path from "node:path";

/**
 * Asynchronously processes a list of filesystem entries and optionally renames them.
 *
 * For each entry in `items` that satisfies `filterFunc`, the function computes a
 * new name using `transformFunc` (called with `dirent.name`). If the computed name
 * differs from the current name the entry is renamed on disk using `fs.promises.rename`,
 * unless `dryRun` is true in which case the proposed rename is logged instead.
 *
 * @param items - Array of objects with shape `{ fullPath: string; dirent: fs.Dirent }`.
 *                `fullPath` is the entry's path and `dirent` provides the current name
 *                (`dirent.name`) and type information.
 * @param filterFunc - Predicate `(fullPath, dirent) => boolean` used to decide whether
 *                     an entry should be processed. If it returns `false`, the entry is skipped.
 * @param transformFunc - Function `(name: string) => string` that receives the current entry
 *                        name and returns the desired new name.
 * @param dryRun - When `true`, no filesystem operations are performed; proposed renames are logged.
 *                 Defaults to `false`.
 * @returns A Promise that resolves when all items have been processed.
 *
 * @remarks
 * - If `transformFunc` returns the same name as the current name, the entry is skipped.
 * - Rename failures are caught and logged; processing continues for remaining items.
 * - Destination path is constructed with `path.dirname(fullPath)` and `path.join(dir, newName)`.
 *
 * @example
 * // Dry-run: log proposed renames for files only
 * await processItems(items, (p, d) => d.isFile(), name => name.toLowerCase(), true);
 */
export const processItems = async (
  items: Array<{ fullPath: string; dirent: fs.Dirent }> ,
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
