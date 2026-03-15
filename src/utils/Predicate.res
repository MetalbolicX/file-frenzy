type dirent = {
  name: string,
  isFile: unit => bool,
  isDirectory: unit => bool
}

type itemType = File | Directory | Both

// let getPredicate: (itemType: itemType, nameFilter?: string) => (fullPath: string, dirent: dirent) => boolean
/**
 * Returns a predicate function that can be used to filter directory entries based on the specified item type and optional name filter.
 *
 * @param itemType - The type of item to filter for ("file" or "directory").
 * @param nameFilter - An optional string to filter entries by name (case-insensitive).
 * @returns A predicate function with signature (dirent: Dirent) => boolean.
 */
let getFilter = (itemType: itemType, nameFilter: option<string>) => (
  dirent: dirent
): bool => {
  let typeMatch = switch itemType {
    | File => dirent.isFile()
    | Directory => dirent.isDirectory()
    | Both => true
  }

  if !typeMatch {
    false
  } else {
    switch nameFilter {
      | Some(f) => {
        let re = RegExp.fromString(f)
        re.test(dirent.name)
      }
      | None => false
    }
  }

  true
}
