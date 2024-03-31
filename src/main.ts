import { info, warn } from "./console";
import { IPlugin } from "./plugin";
import { Theme, tryLoadTheme } from "./theme";

export interface IEzalInitOptions<ThemeConfig> {
  source?: string,
  out?: string,
  themeName: string,
  plugins?: IPlugin[],
  site: {
    title: string,
    subtitle?: string,
    description?: string,
    keywords?: string[],
    author: string,
    language: string,
    host: string,
    root?: string,
    timezone?: number,
  },
  theme: ThemeConfig,
  compile?: {
    trailingDotHTML?: boolean,
    trailingIndexDotHTML?: boolean,
  }
};
export interface IEzalOptions<ThemeConfig> {
  source: string,
  out: string,
  themeName: string,
  plugins: IPlugin[],
  site: {
    title: string,
    subtitle?: string,
    description?: string,
    keywords?: string[],
    author: string,
    language: string,
    host: string,
    root: string,
    timezone: number,
  },
  theme: Theme<ThemeConfig>,
  compile: {
    trailingDotHTML: boolean,
    trailingIndexDotHTML: boolean,
  }
};

let config: IEzalOptions<any>;

export async function init<ThemeConfig>(options: IEzalInitOptions<ThemeConfig>) {
  info('ezal', 'Checking config');
  if (typeof options !== 'object') throw new TypeError('Valid configurations must be provided.');

  if (typeof options.themeName !== 'string') {
    throw new Error('Theme name required.');
  }
  if (typeof options.site !== 'object') {
    throw new Error('Site config required.');
  }
  for (const key of ['title', 'author', 'language', 'host']) {
    // @ts-ignore
    if (typeof options.site[key] !== 'string') throw new Error(`Site ${key} config required.`);
  }
  config = {
    source: 'src',
    out: 'dist',
    themeName: options.themeName,
    plugins: [],
    site: {
      title: options.site.title,
      author: options.site.author,
      language: options.site.language,
      host: options.site.host,
      root: '/',
      timezone: 0,
    },
    theme: await tryLoadTheme<ThemeConfig>(options.themeName) as Theme<ThemeConfig>,
    compile: {
      trailingDotHTML: false,
      trailingIndexDotHTML: false,
    },
  };
  if (config.theme === undefined) {
    throw new Error(`Unable to load theme "${config.themeName}".`);
  }
  if (Array.isArray(options.plugins)) {
    let themeDependencies = new Set<string>();
    if (Array.isArray(config.theme.dependencies)) {
      themeDependencies = new Set(config.theme.dependencies);
    }
    for (const plugin of options.plugins) {
      themeDependencies.delete(plugin.name);
    }
    if (themeDependencies.size !== 0) {
      throw new Error('Dependencies of the theme matter are not satisfied and are missing: ' + [...themeDependencies].join(', '));
    }
  }
  if (typeof options.source === 'string') {
    config.source = options.source;
  }
  if (typeof options.out === 'string') {
    config.out = options.out;
  }
  if (typeof options.site.subtitle === 'string') {
    config.site.subtitle = options.site.subtitle;
  }
  if (typeof options.site.description === 'string') {
    config.site.description = options.site.description;
  }
  if (typeof options.site.root === 'string') {
    config.site.root = options.site.root;
  }
  if (Array.isArray(options.site.keywords) && options.site.keywords.every((v)=>typeof v === 'string')) {
    config.site.keywords = [...new Set(options.site.keywords)];
  }
  if (typeof options.site.timezone === 'number') {
    if (options.site.timezone < 13 && options.site.timezone > -13) {
      config.site.timezone = Math.trunc(options.site.timezone);
    } else {
      warn('ezal', 'Time zone out of range');
    }
  }
  if (typeof options.compile === 'object') {
    if (typeof options.compile.trailingDotHTML === 'boolean') {
      config.compile.trailingDotHTML = options.compile.trailingDotHTML;
    }
    if (typeof options.compile.trailingIndexDotHTML === 'boolean') {
      config.compile.trailingIndexDotHTML = options.compile.trailingIndexDotHTML;
    }
  }

  info('ezal', 'Initialisation theme');
  config.theme.init(options.theme);
}