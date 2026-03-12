/**
 * Returns a predicate function that tests whether a directory entry matches the given criteria.
 * @param itemType - Type of item to match. Use "file" to match files, "dir" to match directories, or any other value to match both.
 * @param nameFilter - Optional regular expression string to test against the entry name. If the string is not a valid RegExp, the predicate will treat the entry as non-matching.
 * @returns A predicate function with signature (fullPath: string, dirent: import("node:fs").Dirent) => boolean.
 *
 * @param fullPath - The full path of the directory entry (provided to the predicate when called).
 * @param dirent - The Dirent object for the directory entry (provided to the predicate when called).
 */
export const getFilter = (itemType: string, nameFilter?: string) => (
  fullPath: string,
  dirent: import("node:fs").Dirent
): boolean => {
  let typeMatch = true;
  if (itemType === "file") typeMatch = dirent.isFile();
  else if (itemType === "dir") typeMatch = dirent.isDirectory();

  if (!typeMatch) return false;
  if (nameFilter && nameFilter.length > 0) {
    try {
      const re = new RegExp(nameFilter);
      if (!re.test(dirent.name)) return false;
    } catch (e) {
      return false;
    }
  }

  return true;
};
