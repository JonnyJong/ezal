declare module 'ezal/category' {
  import { IPost } from "ezal/page";
  export class ICategory {
      name: string;
      posts: Set<IPost>;
      parent: ICategory | null;
      children: Map<string, ICategory>;
      getPath(): string[];
  }

}
declare module 'ezal/console' {
  export function info(scope: string, ...msgs: any[]): void;
  export function warn(scope: string, ...msgs: any[]): void;

}
declare module 'ezal/main' {
  import { IPlugin } from "ezal/plugin";
  import { Theme } from "ezal/theme";
  export interface IEzalInitOptions<ThemeConfig> {
      source?: string;
      out?: string;
      themeName: string;
      plugins?: IPlugin[];
      site: {
          title: string;
          subtitle?: string;
          description?: string;
          keywords?: string[];
          author: string;
          language: string;
          host: string;
          root?: string;
          timezone?: number;
      };
      theme: ThemeConfig;
      compile?: {
          trailingDotHTML?: boolean;
          trailingIndexDotHTML?: boolean;
      };
  }
  export interface IEzalOptions<ThemeConfig> {
      source: string;
      out: string;
      themeName: string;
      plugins: IPlugin[];
      site: {
          title: string;
          subtitle?: string;
          description?: string;
          keywords?: string[];
          author: string;
          language: string;
          host: string;
          root: string;
          timezone: number;
      };
      theme: Theme<ThemeConfig>;
      compile: {
          trailingDotHTML: boolean;
          trailingIndexDotHTML: boolean;
      };
  }
  export function init<ThemeConfig>(options: IEzalInitOptions<ThemeConfig>): Promise<void>;

}
declare module 'ezal/page' {
  import { ICategory } from "ezal/category";
  import { ITag } from "ezal/tag";
  type SerializedData = string | number | boolean | null | undefined | SerializedData[] | {
      [key: string]: SerializedData;
  };
  export interface IFlatToc {
      name: string;
      id: string;
      level: number;
  }
  export interface ITreeToc {
      name: string;
      id: string;
      child: ITreeToc[];
  }
  export interface INormalToc {
      flat: IFlatToc[];
      tree: ITreeToc[];
  }
  export class IPage {
      layout: string;
      title?: string;
      description?: string;
      keywords?: string[];
      date: Date;
      updated: Date;
      link: string;
      path?: string;
      dist: string;
      source: string;
      content: string;
      toc: INormalToc;
      meta: {
          permalink?: string;
          [name: string]: SerializedData;
      };
  }
  export class IPost extends IPage {
      layout: 'post';
      tags: Set<ITag>;
      categories: Set<ICategory>;
      draft: boolean;
  }
  export {};

}
declare module 'ezal/plugin' {
  export class IPlugin {
      name: string;
  }

}
declare module 'ezal/state' {
  export type State = 'init' | 'ready';
  export function state(): State;
  export function setState(state: State): void;

}
declare module 'ezal/tag' {
  import { IPost } from "ezal/page";
  export class ITag {
      name: string;
      posts: Set<IPost>;
      rename(name: string): boolean;
  }
  export function getAllTags(): ITag[];

}
declare module 'ezal/theme' {
  export class Theme<ThemeConfig> {
      dependencies?: string[];
      constructor();
      init(config: ThemeConfig): any;
  }
  export function tryLoadTheme<ThemeConfig>(name: string): Promise<Theme<ThemeConfig> | undefined>;

}
declare module 'ezal' {
  import main = require('ezal/main');
  export = main;
}