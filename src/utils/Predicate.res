let getFilter: (string, ~nameFilter: string=?) => (string, Bindings.dirent) => bool = (
  itemType,
  ~nameFilter=?,
) =>
  (_fullPath, dirent) => {
    let typeMatch = switch itemType {
    | "file" => dirent.isFile()
    | "dir" => dirent.isDirectory()
    | _ => true
    }

    if !typeMatch {
      false
    } else {
      switch nameFilter {
      | Some(f) => {
          let re = RegExp.fromString(f)
          re->RegExp.test(dirent.name)
        }
      | None => false
      }
    }
  }
