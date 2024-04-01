import path from "path";
import { ITheme } from "./types";

export async function tryLoadTheme<ThemeConfig>(name: string): Promise<ITheme<ThemeConfig> | undefined> {
  try {
    return require(path.join(process.cwd(), 'themes', name));
  } catch {}
  try {
    return require(path.join(process.cwd(), 'themes', 'ezal-theme-' + name));
  } catch {}
  try {
    return require('ezal-theme-' + name);
  } catch {}
  return undefined;
}