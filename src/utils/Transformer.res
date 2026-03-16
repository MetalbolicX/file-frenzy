/**
 * Returns a transformer function that applies a pattern replacement and strip transformation to a string.
 * @param pattern - The pattern to match and replace
 * @param replacement - The replacement string (default: "")
 * @param strip - The characters to strip from the string
 * @returns A function that takes a string and returns the transformed string
 * @example
 * ```
 * let transform = getTransformer(~pattern=Some(".*\\.js"), ~replacement=".ts", ~strip=Some(" "))
 * let result = transform("file name.js") // "filename.ts"
 * ```
 */
let getTransformer: (
  ~pattern: option<string>,
  ~replacement: string=?,
  ~strip: option<string>,
) => string => string = (~pattern, ~replacement="", ~strip) =>
  name => {
    // 1. Apply strip transformation if applicable
    let afterStrip = switch strip {
    | Some(s) if s->String.length > 0 =>
      let chars = RegExp.escape(s)
      let stripRe = RegExp.fromString(`[${chars}]`, ~flags="g")
      name->String.replaceRegExp(stripRe, "")
    | _ => name
    }

    // 2. Apply pattern replacement if applicable
    switch pattern {
    | Some(p) if p->String.length > 0 =>
      let re = RegExp.fromString(p, ~flags="g")
      afterStrip->String.replaceRegExp(re, replacement)
    | _ => afterStrip
    }
  }
