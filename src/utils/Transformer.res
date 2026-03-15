/**
 * Escapes special RegExp metacharacters in a string.
 */
let escapeRegExp = (s: string): string => {
  let re = %re("/[.*+?^${}()|[\]\\]/g")
  s->String.replaceRegExp(re, "\\$&")
}

/**
 * Creates a string transformer using a functional pipeline.
 */
let getTransformer = (~pattern: option<string>=?, ~replacement: string="", ~strip: option<string>=?) => {
  (name: string): string => {
    // 1. Apply strip transformation if applicable
    let afterStrip = switch strip {
    | Some(s) if String.length(s) > 0 =>
        let chars = escapeRegExp(s)
        let stripRe = RegExp.fromString(`[${chars}]`, ~flags="g")
        name->String.replaceRegExp(stripRe, "")
    | _ => name
    }

    // 2. Apply pattern replacement if applicable
    switch pattern {
    | Some(p) if String.length(p) > 0 =>
        let re = RegExp.fromString(p, ~flags="g")
        afterStrip->String.replaceRegExp(re, replacement)
    | _ => afterStrip
    }
  }
}
