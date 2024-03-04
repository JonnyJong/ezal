// Type definitions for Ezal 1.0.0
// Project: https://github.com/JonnyJong/ezal
// Definitions by: Jonny <https://github.com/JonnyJong>
// Definitions: https://github.com/JonnyJong/ezal

import { NormalToc } from "ezal-markdown";

type Async<T> = T | Promise<T>;
type SerializedData = string | number | boolean | null | SerializedData[] | { [key: string]: SerializedData };

declare module 'ezal' {
  /* 
    Global
    全局
   */
  /**
   * Ezal 选项
   */
  export interface IEzalConfig<ThemeConfig> {
    /**
     * 源路径
     * 默认为`src`
     */
    source?: string,
    /**
     * 输出路径
     * 默认为`dist`
     */
    out?: string,
    /**
     * 主题名称
     * 将按照以下优先级寻找主题文件
     * - ./themes/<name>
     * - ./themes/ezal-theme-<name>
     * - ./node_modules/ezal-theme-<name>
     */
    themeName: string,
    /**
     * 插件
     */
    plugins: IPlugin[],
    /**
     * 站点选项
     */
    site: {
      /**
       * 站点标题
       */
      title: string,
      /**
       * 站点副标题
       */
      subtitle?: string,
      /**
       * 站点描述
       */
      description?: string,
      /**
       * 站点关键词
       */
      keywords?: string[],
      /**
       * 作者
       */
      author: string,
      /**
       * 站点语言
       */
      language: string,
      /**
       * 站点域名
       */
      host: string,
      /**
       * 站点根目录
       * 默认`/`
       */
      root?: string,
      /**
       * 时区
       * 文章使用时间不为 UTC 时间时建议使用
       * 默认为 UTC+00:00
       */
      timezone?: number,
    },
    /**
     * 主题选项
     */
    theme?: ThemeConfig,
    /**
     * 编译选项
     */
    compile?: {
      /**
       * 直接将 Markdown 文件渲染成 HTML 文件
       * 默认`false`
       * - false: `src/page/example.md`->`dist/page/example/index.html`
       * - true: `src/page/example.md`->`dist/example.html`
       */
      trailingDotHTML?: boolean,
      /**
       * 页面链接尾随`index.html`
       * 默认`false`
       */
      trailingIndexDotHTML?: boolean,
    },
  }
  /**
   * 获取所有选项
   * @description
   * - 获取后可以修改选项
   * - init 阶段开始后可用
   */
  export function getConfig(): IEzalConfig<any>;
  /**
   * 读取源文件
   * @param path 源文件路径
   * @param encoding 编码
   */
  export function readSrc(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
  /**
   * 保存为分发文件
   * @param path 分发文件路径
   * @param data 分发文件数据
   * @param encoding 编码
   */
  export function writeDist(path: string, data: Buffer | string, encoding?: BufferEncoding): Promise<void>;
  /**
   * Markdown 渲染器相关
   */
  export * as markdown from "ezal-markdown";
  export class IPage {
    layout: string;
    title?: string;
    description?: string;
    date: Date;
    updated: Date;
    permalink?: string;
    published: boolean;
    source: string;
    content: string;
    toc: NormalToc;
    meta: { [name: string]: SerializedData };
  }
  export class IPost extends IPage {
    layout: 'post';
    tags: Set<ITag>;
    categories: Set<ICategory>;
    draft: boolean;
  }
  export class ITag {
    name: string;
    posts: Set<IPost>;
  }
  export class ICategory {
    name: string;
    posts: Set<IPost>;
    parent: ICategory | null;
    children: { [name: string]: ICategory };
    getPath(): string[];
  }
  export function getAllTags(): Set<ITag>;
  export function getAllRootCategories(): Set<ICategory>;

  /* 
    Plugins
    插件
   */
  /**
   * 插件
   */
  export class IPlugin {
    /**
     * 名称
     * @example 'ezal-plugin-xxx'
     * @pattern ^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$
     * @description 命名规则同 node 包名
     */
    name: string;
    /**
     * init 事件
     */
    onInit?(): Async<any>;
  }
  /**
   * 源文件处理器
   */
  export class ISourceHandler<T = any> {
    /**
     * 源文件类型
     * @example '.md'
     * @description 类型相同时，将会覆盖已注册的处理器
     */
    type: string;
    /**
     * 源文件添加事件
     * @param path 源文件路径
     */
    onAdd(path: string): Async<T>;
    /**
     * 编译源事件
     * @param source 预处理源
     */
    onCompile(source: T): Async<any>;
    /**
     * 移除源事件
     * @param source 预处理源
     */
    onRemove?(source: T): Async<any>;
  }
  /**
   * 注册源文件处理器
   * @param sourceHandlers 源文件处理器
   * @description 仅 init 阶段可用
   */
  export function registerSourceHandlers(...sourceHandlers: ISourceHandler[]): void;
  
  /*
    Layout
   */
  /**
   * Layout 编译器
   */
  export type LayoutHandlers = { [name: string]: Function };
  export class ILayoutCompiler {
    /**
     * 编译 layout
     */
    compile(): Async<string>;
  }
  
  /* 
    Theme
    主题
  */
  export function registerLayoutHandlers(layoutHandlers: LayoutHandlers): void;
}
