// --- External Bindings ---
@module("node:path") @variadic
external join: array<string> => string = "join"

type readdirOptions = {withFileTypes: bool}

@module("node:fs") @scope("promises")
external readdir: (string, readdirOptions) => promise<array<dirent>> = "readdir"

// --- Types ---
type renameOptions = {
  @as("type") type_?: string,
  filter?: string,
  pattern?: string,
  replace?: string,
  strip?: string,
  dryRun?: bool,
}

type dirent = {
  name: string,
  isFile: unit => bool,
  isDirectory: unit => bool,
}

type item = {
  fullPath: string,
  dirent: dirent,
}

/**
 * Programmatically accesses a directory and processes item names based on provided logic.
 */
let renameCommand = async (targetPath: string, options: renameOptions): unit => {
  // Extract options with defaults
  let itemType = options.type_->Option.getOr("both")
  let replace = options.replace->Option.getOr("")
  let dryRun = options.dryRun->Option.getOr(false)

  // Initialize helper functions from your utility modules
  let filterFunc = Predicate.getFilter(itemType, options.filter)
  let transformFunc = Transformer.getTransformer(~pattern=?options.pattern, ~replacement=replace, ~strip=?options.strip)

  // Read directory entries
  let dirents = await readdir(targetPath, {withFileTypes: true})

  // Map dirents to the item structure
  let items = dirents->Array.map(d => {
    {
      fullPath: join([targetPath, d.name]),
      dirent: d,
    }
  })

  // Execute the process
  await Processor.processItems(items, filterFunc, transformFunc, ~dryRun)
}
