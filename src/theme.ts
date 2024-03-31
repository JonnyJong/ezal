import path from "path";

export declare class Theme<ThemeConfig> {
  dependencies?: string[];
  constructor();
  init(config: ThemeConfig): any;
};

export async function tryLoadTheme<ThemeConfig>(name: string): Promise<Theme<ThemeConfig> | undefined> {
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