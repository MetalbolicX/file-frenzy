/**
* @param itemType - The type of item to filter ("file" or "dir")
* @param nameFilter - An optional regex pattern to filter by name
* @returns A function that takes a `dirent` and returns `true` if it matches the filter criteria
* @example
* ```
* let filter = getFilter("file", ~nameFilter=".*\\.js")
* let matches = filter()
* ```
*/
let getFilter: (string, ~nameFilter: string=?) => Bindings.dirent => bool = (
  itemType,
  ~nameFilter=?,
) =>
  dirent => {
    let typeMatch = switch itemType {
    | "file" => dirent.isFile()
    | "dir" => dirent.isDirectory()
    | _ => true
    }

    if !typeMatch {
      false
    } else {
      switch nameFilter {
      | Some(f) => f->RegExp.fromString->RegExp.test(dirent.name)
      | None => false
      }
    }
  }
