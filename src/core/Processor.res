/**
 * Processes a list of file items, applying a filter and transformation function to each.
 * @param items - The array of file items to process
 * @param filterFunc - A function that filters `dirent` objects
 * @param transformFunc - A function that transforms the old file name to the new name
 * @param ~isDryRun - If `true`, performs a dry run without actually renaming files
 * @returns A promise that resolves when all items have been processed
 * @example
 * ```
 * let filter = getFilter("file", ~nameFilter=".*\\.js")
 * let transform = name => name.replace(/\.js$/, ".ts")
 * await processItems(items, filter, transform, ~isDryRun=true)
 * ```
 */
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
