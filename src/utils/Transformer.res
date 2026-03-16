// let getTransformer = (
//   ~pattern: option<string>=?,
//   ~replacement: string="",
//   ~strip: option<string>=?,
// ) => {
//   (name: string): string => {
//     // 1. Apply strip transformation if applicable
//     let afterStrip = switch strip {
//     | Some(s) if String.length(s) > 0 =>
//       let chars = RegExp.escape(s)
//       let stripRe = RegExp.fromString(`[${chars}]`, ~flags="g")
//       name->String.replaceRegExp(stripRe, "")
//     | _ => name
//     }

//     // 2. Apply pattern replacement if applicable
//     switch pattern {
//     | Some(p) if String.length(p) > 0 =>
//       let re = RegExp.fromString(p, ~flags="g")
//       afterStrip->String.replaceRegExp(re, replacement)
//     | _ => afterStrip
//     }
//   }
// }
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
