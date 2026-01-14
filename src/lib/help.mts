/**
 * Returns the multi-line CLI help text used by the application.
 *
 * The returned string is a pre-formatted help message including usage
 * examples and notes that explain the available command-line flags:
 *  - Filter (-f): selects which files to touch
 *  - Pattern (-p): defines what to change inside the filename
 *  - Strip (-s): removes every instance of the characters provided
 *
 * @returns A formatted help message as a string.
 */
export const showHelp = (): string => {
  return `
EXAMPLES:
  1. Filter by extension and replace text:
     node ./dist/index.mjs ./pics -f ".jpg$" -p "DSC" -r "Vacation"

  2. Remove specific characters from folder names only:
     node ./dist/index.mjs ./data -t dir -s "()_-"

  3. Use regex groups to swap name parts (e.g., '2023_Report' to 'Report_2023'):
     node ./dist/index.mjs . -p "(\\d+)_(\\w+)" -r "\\2_\\1"

  4. Dry run to preview changes safely:
     node ./dist/index.mjs ./docs -s " " --dry-run

NOTES:
  - The 'Filter' (-f) selects WHICH files to touch.
  - The 'Pattern' (-p) defines WHAT to change inside the filename.
  - The 'Strip' (-s) removes every instance of the characters provided.
`;
};
