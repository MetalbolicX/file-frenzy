/**
 * The main entry point for the file-frenzy CLI application.
 */
let main: unit => promise<unit> = async () => {
  let config = {
    "args": Bindings.argv->Array.slice(~start=2, ~end=Array.length(Bindings.argv)),
    "allowPositionals": false,
    "options": {
      "help": {"type": "boolean", "short": "h"},
      "example": {"type": "boolean", "short": "e"},
      "directory": {"type": "string", "short": "d"},
      "filter": {"type": "string", "short": "f"},
      "type": {"type": "string", "short": "t"},
      "pattern": {"type": "string", "short": "p"},
      "replace": {"type": "string", "short": "r"},
      "strip": {"type": "string", "short": "s"},
      "dry-run": {"type": "boolean"},
    },
  }

  let results = Bindings.parseArgs(config)
  let values = results["values"]

  // 1. Handle Help Flag
  if values["help"] == true {
    Console.log(Help.showHelp())
  } else if values["example"] == true {
    // 2. Handle Example Flag
    Console.log(Help.showExamples())
  } else {
    switch values["directory"] {
    | None =>
      // 3. Handle Missing Directory
      Console.error("Error: The --directory (-d) flag is required.\n")
      Console.log(Help.showHelp())
    | Some(targetPath) =>
      try {
        let pathStat = await Bindings.stat(targetPath)
        if !pathStat.isDirectory() {
          Console.error(`Path not a directory: ${targetPath}`)
        } else {
          // Construct options record for the main command
          let options: Rename.renameOptions = {
            type_: values["type"],
            filter: values["filter"],
            pattern: values["pattern"],
            replace: values["replace"],
            strip: values["strip"],
            dryRun: values["dry-run"],
          }

          await Rename.execCommand(targetPath, options)
        }
      } catch {
      | _ => Console.error(`Path not found: ${targetPath}`)
      }
    }
  }
}

// Equivalent of if (import.meta.main)
await main()->Promise.catch(err => {
  Console.error(err)
  Bindings.setExitCode(1)
  Promise.resolve()
})
