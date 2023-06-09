// Type definitions for Ezal 0.0.10
// Project: https://github.com/JonnyJong/ezal
// Definitions by: Jonny <https://github.com/JonnyJong>
// Definitions: https://github.com/JonnyJong/ezal

declare module 'ezal'{
  /**
   * Add a listener on ezal event
   * @param type Event type
   * @param listener Event listener
   */
  export function addListener(type: 'init', listener: ()=>any): void
  export function addListener(type: 'init-pages', listener: ()=>any): void
  export function addListener(type: 'pre-render', listener: (page: Page | Post)=>any): void
  export function addListener(type: 'post-render', listener: (page: Page | Post, variables: any)=>any): void
  export function addListener(type: 'pre-generate', listener: (page: Page | Post)=>any): void
  export function addListener(type: 'post-generate', listener: (generated: {page: Page | Post, html: string})=>any): void
  export function addListener(type: 'pre-style', listener: (styleContent: {stylus: string, css: ''})=>any): void
  export function addListener(type: 'post-style', listener: (styleContent: {stylus: string, css: string})=>any): void
  export function addListener(type: 'pre-assets', listener: ()=>any): void
  export function addListener(type: 'post-assets', listener: ()=>any): void
  /**
   * Set pug option in HTML template
   */
  export let pug: {
    [x: string | number | symbol]: any,
    }
  /**
   * Set stylus option in CSS template
   */
  export let stylus: {
    /**
     * Set variables that can be obtained in stylus by get('keyName.keyName')
     */
    var: {
      [x: string | number | symbol]: any,
    },
    /**
     * Set the functions that can be called in stylus
     */
    function: {
      [x: string | number | symbol]: Function,
    }
  }
  export namespace render {
    type MarkdownRenderResult = {
      context: string,
      variables: any,
    }
    /**
     * Render Markdown content to HTML
     * @param source Markdown content
     * @returns HTML string
     */
    function markdown(source: string, v?: MarkdownExtensionVariables, paragraph?: boolean): Promise<MarkdownRenderResult>
    function markdownLine(source: string, v?: MarkdownExtensionVariables): Promise<MarkdownRenderResult>
    /**
     * Render HTML template to HTML
     * @param layoutName Layout's name in theme's layout folder
     * @param options Set pug option in HTML template
     * @returns HTML string
     */
    function pug(layoutName: 'post' | 'page' | string, options: any): Promise<string>
    /**
     * Render stylus to CSS
     * @param stylusContext Stylus content
     * @param options Set stylus option in CSS template
     * @returns CSS string
     */
    function stylus(stylusContext: string, options: any): Promise<string>
    /**
     * Render and wrap codeblock
     * Modify this function to customize the codeblock
     */
    let codeblock: (matched: MarkdownMatched, v: MarkdownExtensionVariables)=>string
  }
  /**
   * Ezal's config
   * @readonly
   */
  export namespace config {
    /**
     * Current theme's folder name in /themes
     * @readonly
     */
    const theme: string
    const title: string
    const subtitle: string
    const description: string
    const keywords: string[]
    const author: string
    const language: string
    const host: string
    const root: string
    const timezone: number
    const markdown: {
      heading_anchor_prefix: string,
      highlight_prefix: string,
      footnote_classname: string,
      task_list_classname: string,
    }
  }
  /**
   * Theme's config
   */
  export let theme: {
    [x: string | number | symbol]: any,
  }
  /**
   * Page object model
   */
  export class Page{
    /**
     * @param path Url of page
     * @param source Markdown source
     */
    constructor(path: string, source: string)
    /**
     * Page's origin path
     */
    path: string
    /**
     * Page's url
     */
    url: string
    /**
     * Page's title
     */
    title: string | null
    /**
     * Page's date of creation
     */
    date: Date
    /**
     * Page's date of updated
     */
    updated: Date
    /**
     * Page's HTML template
     */
    layout: 'page' | 'post' | string
    /**
     * Page's origin Markdown content
     */
    source: string
    /**
     * Page's HTML content render from source
     */
    context: string
    /**
     * Update page by markdown content
     * @param source Markdown source
     */
    update(source: string): void
    /**
     * Remove page
     */
    remove(): void
  }
  /**
   * Post object model
   */
  export class Post extends Page{
    /**
     * Post's categories
     */
    categories: Map<Array<string>, Category>
    /**
     * Post's tags
     */
    tags: Set<Tag>
    /**
     * Add a tag in this post
     * @param name Tag's name
     */
    addTag(name: string): void
    /**
     * Remove a tag in this post
     * @param name Tag's name
     */
    removeTag(name: string): void
    /**
     * Add this post in a category
     * @param name Tag's name
     */
    addCategory(name: string): void
    removeCategory(name: string): void
    /**
     * Remove this post in a category
     * @param name Tag's name
     */
  }
  /**
   * All the pages
   */
  export let pages: Set<Page>
  /**
   * All the posts
   */
  export let posts: Set<Post>
  /**
   * Category array path
   */
  type CategoryPath = Array<string>;
  /**
   * Categories map
   */
  type Categories = Map<string, Category>;
  /**
   * Category root object model
   */
  class CategoryRoot{
    /**
     * Children category
     */
    children: Categories;
    /**
     * Find subcategories under the current category
     * @param path Category array path
     */
    query(path: CategoryPath): Category | undefined;
    /**
     * Add subcategories under the current category
     * @param category Category child
     */
    addChild(category: Category): void;
    /**
     * Get subcategories in the current category, or automatically create subcategories if there are none
     * @param name Category's name
     */
    getChildAuto(name: string): Category;
    /**
     * Get category's root
     */
    getAll(): Array<Category>;
    /**
     * Get subcategories at the category root, or automatically create subcategories if there are none
     * @param path Category array path
     */
    static getByPathAuto(path: CategoryPath): Category;
    /**
     * Add post to category by path
     * @param path Category array path
     * @param post Post object
     */
    static addPostByPath(path: CategoryPath, post: Post): Category;
    /**
     * Initialize categories for post
     * @param post Post object
     * @param object YAML parsed object
     */
    static initCategories(post: Post, object: any): void
  }
  /**
   * Category object model
   */
  class Category extends CategoryRoot{
    /**
     * Category's name
     */
    name: string;
    /**
     * Posts under the category
     */
    posts: Set<Post>;
    /**
     * Parent category
     */
    parent: Category | CategoryRoot;
    /**
     * Category's path
     */
    path: CategoryPath;
    /**
     * @param path Category's path
     */
    constructor(path: CategoryPath)
    /**
     * Remove category
     */
    remove(): void;
    /**
     * Add post to this category
     * @param post Post object
     */
    addPost(post: Post): void;
    /**
     * Remove post from this category
     * @param post Post object
     */
    removePost(post: Post): void;
  }
  /**
   * All the categories
   */
  export let categories: CategoryRoot;
  /**
   * Tag root object model
   */
  class Tags{
    /**
     * Create a tag that cannot have the same name as an existing tag
     * @param name Tag's name
     */
    add(name: string): Tag;
    /**
     * Remove a tag
     * @param tag Tag's name
     */
    delete(tag: string): boolean;
    /**
     * Executes a provided function once per each tag in the tags object, in insertion order.
     */
    forEach(callbackfn: (value: Tag, value2: Tag, set: Set<Tag>) => void, thisArg?: any): void;
    /**
     * Check if tag exists
     * @param name Tag's name
     */
    has(name: string): boolean;
    /**
     * Get tag
     * @param name Tag's name
     */
    get(name: string): Tag | null;
    /**
     * Get the tag, if it does not exist, it will be created automatically
     * @param name Tag's name
     */
    autoGet(name: string): Tag;
    /**
     * @returns The number of tags
     */
    readonly size: number;
  }
  /**
   * Tag object model
   */
  class Tag{
    /**
     * Tag's name
     */
    name: string;
    /**
     * Tag's posts
     */
    posts: Set<Post>;
    /**
     * Add post in this tag
     * @param post Post object
     */
    addPost(post: Post): void;
    /**
     * Remove post in this tag
     * @param post Post object
     */
    removePost(post: Post): void;
    /**
     * Remove this tag
     */
    remove(): void;
  }
  /**
   * All the tags
   */
  export let tags: Tags | Set<Tag>;
  type MarkdownExtensionVariables = {
    page?: Page | Post,
    /**
     * Shared variables when rendering markdown
     */
    markdown: any,
  }
  export type MarkdownExtension = {
    name: string,
    level: 'block' | 'inline',
    /**
     * Match start index
     * @param src Source string
     * @param v Page and Markdown variables
     */
    start(src: string, v?: MarkdownExtensionVariables): number | null | undefined | void | Promise<number | null | undefined | void>,
    /**
     * Confirm and match the syntax-compliant strings
     * @param src Source string
     * @param v Page and Markdown variables
     */
    match(src: string, v?: MarkdownExtensionVariables): MarkdownMatched | null | undefined | void | Promise<MarkdownMatched | null | undefined | void>,
    /**
     * Render matched result to HTML string
     * @param matched Matched result
     * @param v Page and Markdown variables
     */
    render(matched: MarkdownMatched, v?: MarkdownExtensionVariables): string | Promise<string>,
    priority?: number,
  }
  export type MarkdownMatched = {
    /**
     * Matched raw string
     */
    raw: string,
    text?: string,
    args?: string[],
    arg?: string,
    [x: string | number | symbol]: any,
  }
  export type MarkdownTag = {
    name: string,
    level: 'block' | 'inline',
    end: void | undefined | boolean,
    render(matched: MarkdownMatched, v?: MarkdownExtensionVariables): string | Promise<string>,
    priority?: number,
  }
  export function setMarkdownExtension(markdownExtension: MarkdownExtension | MarkdownExtension[]): void
  export function setMarkdownTag(markdownTag: MarkdownTag | MarkdownTag[]): void
  type DateTemplate = {
    D: [string, string, string, string, string, string, string],
    DD: [string, string, string, string, string, string, string],
    MMM: [string, string, string, string, string, string, string, string, string, string, string, string],
    MMMM: [string, string, string, string, string, string, string, string, string, string, string, string],
    AP: [string, string],
    ap: [string, string],
  }
  export namespace util{
    function HTMLEncode(src: string): string
    function url_for(src: string): string
    function full_url_for(src: string): string
    function now(): Date
    function parseDate(date: any, format: string | undefined | void, option: void | undefined | DateTemplate): string
    function setDateTemplate(option: DateTemplate): void
    function writeFile(url: string, data: any, option?: BufferEncoding): Promise<void>
  }
  /**
   * Auto load locale from theme's locales folder
   */
  export const locale: any
  type ProceduralItem = {
    path: string,
    data: any,
  }
  type Procedural = {
    type: 'page' | 'assets',
    /**
     * When type is page, a layout must be set
     */
    layout?: 'page' | 'post' | string,
    /**
     * When type is assets, a dataType must be set
     */
    dataType?: BufferEncoding,
    /**
     * Match pages requested in serve mode
     * @param url Require url
     * @returns Return ProceduralItem must make the path and url the same, otherwise it is considered not matched
     */
    match(url: string): ProceduralItem | undefined | void | Promise<ProceduralItem | undefined | void>,
    getItems(): ProceduralItem | ProceduralItem[] | Promise<ProceduralItem | ProceduralItem[]>,
  }
  export function setProceduralGenerater(arg: Procedural | Procedural[]): void
}
