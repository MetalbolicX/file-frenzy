/**
 * Returns the CLI help text detailing usage and available flags.
 * @returns {string} A formatted help message as a string.
 */
export const showHelp = (): string => `
USAGE:
  node file-frenzy.mts -d <path> [OPTIONS]

OPTIONS:
  -d, --directory <path>   (Required) The target directory to process.
  -h, --help               Show this help message.
  -e, --example            Show usage examples.
  -f, --filter <regex>     Filter files to touch by name or extension.
  -t, --type <type>        Target item type: 'file', 'dir', or 'both'. (Default: both)
  -p, --pattern <regex>    Regex pattern defining what to change inside the filename.
  -r, --replace <text>     Text to replace the pattern matches with.
  -s, --strip <chars>      Specific characters to strip from filenames entirely.
  --dry-run                Preview proposed changes safely without modifying the filesystem.
`;

/**
 * Returns a set of common usage examples for the CLI.
 * @returns {string} A formatted examples message as a string.
 */
export const showExamples = (): string => `
EXAMPLES:
  1. Filter by extension and replace text:
     node ./dist/file-frenzy.mts -d ./pics -f ".jpg$" -p "DSC" -r "Vacation"

  2. Remove specific characters from folder names only:
     node ./dist/file-frenzy.mts -d ./data -t dir -s "()_-"

  3. Use regex groups to swap name parts:
     node ./dist/file-frenzy.mts -d . -p "(\\d+)_(\\w+)" -r "\\2_\\1"

  4. Dry run to preview changes safely:
     node ./dist/file-frenzy.mts -d ./docs -s " " --dry-run
`;
