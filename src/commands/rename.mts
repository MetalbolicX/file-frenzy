import { processItems } from "@/core/index.mts";;
import { getFilter, getTransformer } from "@/utils/index.mts";

export const renameCommand = async (
  targetPath: string,
  options: { type?: string; filter?: string; pattern?: string; replace?: string; strip?: string; dryRun?: boolean }
): Promise<void> => {
  const itemType = options.type || "both";
  const filterFunc = getFilter(itemType, options.filter);
  const transformFunc = getTransformer(options.pattern, options.replace || "", options.strip);

  // read dir here to build items; keep using node fs where caller prefers
  const fs = await import("node:fs");
  const path = await import("node:path");

  const dirents = await fs.promises.readdir(targetPath, { withFileTypes: true });
  const items = dirents.map((d) => ({ fullPath: path.join(targetPath, d.name), dirent: d }));

  await processItems(items, filterFunc, transformFunc, Boolean(options.dryRun));
};
