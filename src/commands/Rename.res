// //--- Types---
type renameOptions = {
  @as("type") type_?: string,
  filter?: string,
  pattern?: string,
  replace?: string,
  strip?: string,
  dryRun?: bool,
}

/**
 * Programmatically accesses a directory and processes item names based on provided logic.
 */
let execCommand: (string, renameOptions) => promise<unit> = async (targetPath, options) => {
  // Extract options with defaults
  let itemType = options.type_->Option.getOr("both")
  let replace = options.replace->Option.getOr("")
  let dryRun = options.dryRun->Option.getOr(false)

  // Initialize helper functions from your utility modules
  let filterFunc = Predicate.getFilter(itemType, ~nameFilter=?options.filter)
  let transformFunc = Transformer.getTransformer(
    ~pattern=options.pattern,
    ~replacement=replace,
    ~strip=options.strip,
  )

  // // Read directory entries
  let dirents = await Bindings.readdir(targetPath, {withFileTypes: true})

  // // Map dirents to the item structure
  let items = dirents->Array.map(d => {
    {
      Bindings.fullPath: Bindings.join([targetPath, d.name]),
      dirent: d,
    }
  })

  // // Execute the process
  await Processor.processItems(items, filterFunc, transformFunc, ~dryRun)
}
