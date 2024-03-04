// Type definitions for Ezal 1.0.0
// Project: https://github.com/JonnyJong/ezal
// Definitions by: Jonny <https://github.com/JonnyJong>
// Definitions: https://github.com/JonnyJong/ezal

import { NormalToc } from "ezal-markdown";

type Async<T> = T | Promise<T>;
type SerializedData = string | number | boolean | null | undefined | SerializedData[] | { [key: string]: SerializedData };

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
  /**
   * 页面对象
   */
  export class IPage {
    /**
     * 页面布局模板名
     * @default 'page'
     */
    layout: string;
    /**
     * 页面标题
     */
    title?: string;
    /**
     * 页面描述
     */
    description?: string;
    /**
     * 页面关键词
     */
    keywords?: string[];
    /**
     * 页面创建时间
     */
    date: Date;
    /**
     * 页面更新时间
     */
    updated: Date;
    /**
     * 页面链接
     */
    link: string;
    /**
     * 源路径
     */
    path?: string;
    /**
     * 页面编译路径
     */
    dist: string;
    /**
     * Markdown 源文本
     */
    source: string;
    /**
     * HTML
     */
    content: string;
    /**
     * 页面目录
     */
    toc: NormalToc;
    /**
     * 页面元数据
     */
    meta: {
      /**
       * 页面永久链接
       */
      permalink?: string;
      [name: string]: SerializedData;
    };
  }
  /**
   * 文章对象
   */
  export class IPost extends IPage {
    /**
     * 文章布局模板名
     * @default 'post'
     * @readonly
     */
    layout: 'post';
    /**
     * 文章标签
     */
    tags: Set<ITag>;
    /**
     * 文章分类
     */
    categories: Set<ICategory>;
    /**
     * 文章为草稿
     */
    draft: boolean;
  }
  /**
   * 标签对象
   */
  export class ITag {
    /**
     * 标签名
     */
    name: string;
    /**
     * 标签相关文章
     */
    posts: Set<IPost>;
  }
  /**
   * 分类对象
   */
  export class ICategory {
    /**
     * 分类名
     */
    name: string;
    /**
     * 分类相关文章
     */
    posts: Set<IPost>;
    /**
     * 父级分类
     */
    parent: ICategory | null;
    /**
     * 子分类
     */
    children: Map<string, ICategory>;
    /**
     * 获取分类路径
     */
    getPath(): string[];
  }
  /**
   * 获取所有标签
   */
  export function getAllTags(): Set<ITag>;
  /**
   * 获取所有根分类
   */
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
  /**
   * 请求刷新源
   * @param path 指定刷新的源文件路径
   * @description 仅 serve 模式可用
   */
  export function requestRefreshSource(path?: string): Promise<boolean>;
  /**
   * 程序化生成器
   */
  export class IProceduralGenerater {
    generate(path: string): Async<any>;
  }
  /**
   * 设置多个程序化生成器
   * @param generaters key 为对应产物生成路径
   */
  export function setProceduralGeneraters(generaters: Map<string, IProceduralGenerater>): void;
  /**
   * 移除程序化生成器
   * @param generaters 要移除的生成器
   */
  export function removeProceduralGeneraters(generaters: string[]): void;
  /**
   * 请求插件
   * @param name 插件名称
   * @description 请求其他插件提供的函数……插件不存在时返回 undefined
   */
  export function requirePlugin(name: string): undefined | { [x: string | number | symbol]: any };
  /**
   * 组成辅助函数
   * @param helpers 辅助函数
   */
  export function registerHelpers(helpers: { [name: string]: Function }): void;

  /*
    Layout
   */
  export type LayoutHandlers = { [name: string]: Function };
  /**
   * Layout 编译器
   */
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
