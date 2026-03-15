import type { Dirent } from "node:fs";

/**
 * Returns a predicate function that tests whether a directory entry matches the given criteria.
 * @param itemType - Type of item to match. Use "file" to match files, "dir" to match directories, or any other value to match both.
 * @param nameFilter - Optional regular expression string to test against the entry name. If the string is not a valid RegExp, the predicate will treat the entry as non-matching.
 * @returns A predicate function with signature (fullPath: string, dirent: Dirent) => boolean.
 */
export const getFilter = (itemType: string, nameFilter?: string) => (
  _fullPath: string,
  dirent: Dirent
): boolean => {
const typeMatch = itemType === "file"
    ? dirent.isFile()
    : itemType === "dir"
      ? dirent.isDirectory()
      : true;

  if (!typeMatch) return false;

  if (nameFilter && nameFilter.length > 0) {
    try {
      const re = new RegExp(nameFilter);
      if (!re.test(dirent.name)) return false;
    } catch {
      return false;
    }
  }

  return true;
};
