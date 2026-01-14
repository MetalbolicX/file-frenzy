/**
 * Escapes special RegExp metacharacters in a string so it can be used safely within a RegExp pattern.
 *
 * @param s - The input string to escape.
 * @returns A new string with RegExp metacharacters escaped with a backslash.
 *
 * @example
 * ```ts
 * const escaped = escapeRegExp('file.name?(1)');
 * // escaped === 'file\\.name\\?\\(1\\)'
 * ```
 *
 * @remarks
 * This escapes characters that have special meaning in regular expressions: . * + ? ^ $ { } ( ) | [ ] \
 * Use the returned value when constructing dynamic RegExp objects to avoid unintended pattern behavior.
 */
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");


/**
 * Creates a string transformer that optionally removes specified characters and applies a global pattern replacement.
 *
 * @param pattern - A string representing a regular expression (without flags) used to build a global RegExp for replacements. If `undefined` or an empty string, no pattern replacement is performed.
 * @param replacement - The string to replace matches of `pattern` with. Defaults to the empty string.
 * @param strip - A string whose individual characters will be escaped and removed globally from the input when provided and non-empty.
 * @returns A function that accepts a `name` string and returns the transformed result after applying the optional strip step followed by the optional pattern replacement.
 *
 * @example
 * const transform = getTransformer("\\d+", "#", "-_");
 * transform("file-123_name.txt"); // "file#name.txt"
 */
export const getTransformer = (pattern: string | undefined, replacement = "", strip?: string) => (
  name: string
): string => {
  let res = name;
  if (strip && strip.length > 0) {
    const chars = escapeRegExp(strip);
    const stripRe = new RegExp(`[${chars}]`, "g");
    res = res.replace(stripRe, "");
  }

  if (pattern && pattern.length > 0) {
    const re = new RegExp(pattern, "g");
    res = res.replace(re, replacement);
  }

  return res;
};
