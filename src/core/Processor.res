// --- Node Interop Bindings ---
type dirent = {
  name: string,
  isFile: unit => bool,
  isDirectory: unit => bool,
}

type item = {
  fullPath: string,
  dirent: dirent,
}

@module("node:path") external dirname: string => string = "dirname"
@module("node:path") @variadic
external join: array<string> => string = "join"

// @module("node:fs/promises")
@module("node:path") @scope("promises")
external rename: (string, string) => promise<unit> = "rename"

// --- Main Logic ---

/**
 * Asynchronously processes a list of filesystem entries and optionally renames them.
 */
let processItems = async (
  items: array<item>,
  filterFunc: (string, dirent) => bool,
  transformFunc: string => string,
  ~dryRun: bool=false,
): unit => {
  // for item in items {
  //   let {fullPath, dirent} = item

  //   if filterFunc(fullPath, dirent) {
  //     let oldName = dirent.name
  //     let newName = transformFunc(oldName)

  //     if newName !== oldName {
  //       let dir = dirname(fullPath)
  //       let newPath = join([dir, newName])

  //       if dryRun {
  //         Console.log(`[DRY RUN] Would rename: ${oldName} -> ${newName}`)
  //       } else {
  //         try {
  //           await rename(fullPath, newPath)
  //           Console.log(`Renamed: ${oldName} -> ${newName}`)
  //         } catch {
  //         | Exn.Error(obj) =>
  //           let msg = Exn.message(obj)->Option.getOr("Unknown error")
  //           Console.error(`Error renaming ${oldName}: ${msg}`)
  //         | _ => Console.error(`Error renaming ${oldName}: Unexpected error`)
  //         }
  //       }
  //     }
  //   }
  // }
  items->Array.forEach(async item => {
    let {fullPath, dirent} = item

    if filterFunc(fullPath, dirent) {
      let oldName = dirent.name
      let newName = transformFunc(oldName)

      if newName !== oldName {
        let dir = dirname(fullPath)
        let newPath = join([dir, newName])

        if dryRun {
          Console.log(`[DRY RUN] Would rename: ${oldName} -> ${newName}`)
        } else {
          try {
            await rename(fullPath, newPath)
            Console.log(`Renamed: ${oldName} -> ${newName}`)
          } catch {
          | Exn.Error(obj) =>
            let msg = Exn.message(obj)->Option.getOr("Unknown error")
            Console.error(`Error renaming ${oldName}: ${msg}`)
          | _ => Console.error(`Error renaming ${oldName}: Unexpected error`)
          }
        }
      }
    }
   })
}
