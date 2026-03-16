let processItems: (
  array<Bindings.fileItem>,
  (string, Bindings.dirent) => bool,
  string => string,
  ~dryRun: bool=?,
) => promise<unit> = async (items, filterFunc, transformFunc, ~dryRun=false) => {
  let promises = items->Array.map(async item => {
    let {fullPath, dirent} = item
    if filterFunc(fullPath, dirent) {
      let oldName = dirent.name
      let newName = transformFunc(oldName)

      if newName !== oldName {
        let dir = Bindings.dirname(fullPath)
        let newPath = Bindings.join([dir, newName])

        if dryRun {
          Console.log(`[DRY RUN] Would rename: ${oldName} -> ${newName}`)
        } else {
          try {
            await Bindings.rename(fullPath, newPath)
            Console.log(`Renamed: ${oldName} -> ${newName}`)
          } catch {
          | _ => Console.error(`Error renaming ${oldName}`)
          }
        }
      }
    }
  })

  let _ = await Promise.all(promises)
}
