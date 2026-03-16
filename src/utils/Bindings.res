@module("node:util")
external parseArgs: {"args": array<string>, "allowPositionals": bool, "options": {..}} => {
  "values": {..},
} = "parseArgs"

type stats = {
  isDirectory: unit => bool,
}

@module("node:fs") @scope("promises")
external stat: string => promise<stats> = "stat"

@val @scope("process")
external argv: array<string> = "argv"

@val @scope("process")
external setExitCode: int => unit = "exitCode"

@module("node:path") external dirname: string => string = "dirname"

@module("node:path") @variadic
external join: array<string> => string = "join"

@module("node:path") @scope("promises")
external rename: (string, string) => promise<unit> = "rename"

type readdirOptions = {
  withFileTypes: bool,
}

type dirent = {
  name: string,
  isFile: unit => bool,
  isDirectory: unit => bool,
}

type fileItem = {
  fullPath: string,
  dirent: dirent,
}

@module("node:fs") @scope("promises")
external readdir: (string, readdirOptions) => promise<array<dirent>> = "readdir"
