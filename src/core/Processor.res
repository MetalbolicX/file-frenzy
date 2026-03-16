let processItems: (
  array<Bindings.fileItem>,
  Bindings.dirent => bool,
  string => string,
  ~isDryRun: bool=?,
) => promise<unit> = async (items, filterFunc, transformFunc, ~isDryRun=false) => {
  let promises = items->Array.map(async item => {
    let {fullPath, dirent} = item
    if filterFunc(dirent) {
      let {name: oldName} = dirent
      let newName = transformFunc(oldName)

      if newName !== oldName {
        let dir = Bindings.dirname(fullPath)
        let newPath = Bindings.join([dir, newName])

        if isDryRun {
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
