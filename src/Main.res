// --- Bindings ---
@module("node:util")
external parseArgs: {
  "args": array<string>,
  "allowPositionals": bool,
  "options": {..},
} => {"values": {..}} = "parseArgs"

type stats = {
  isDirectory: unit => bool
}

@module("node:fs") @scope("promises")
external stat: string => promise<stats> = "stat"

@val @scope("process")
external argv: array<string> = "argv"
@val @scope("process")
external setExitCode: int => unit = "exitCode"

// --- Main Execution ---

let main = async () => {
  let rawArgs = argv->Array.slice(~start=2, ~end=Array.length(argv))

  let config = {
    "args": rawArgs,
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

  let results = parseArgs(config)
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
        let pathStat = await stat(targetPath)
        if !pathStat.isDirectory() {
          Console.error(`Path not a directory: ${targetPath}`)
        } else {
          // Construct options record for the main command
          let options: renameOptions = {
            type_: values["type"],
            filter: values["filter"],
            pattern: values["pattern"],
            replace: values["replace"],
            strip: values["strip"],
            dryRun: values["dry-run"],
          }

          await Main.renameCommand(targetPath, options)
        }
      } catch {
      | _ => Console.error(`Path not found: ${targetPath}`)
      }
    }
  }
}

// Equivalent of if (import.meta.main)
main()->Promise.catch(err => {
  Console.error(err)
  setExitCode(1)
  Promise.resolve()
})
