// Type definitions for Ezal 0.0.3
// Project: https://github.com/JonnyJong/ezal
// Definitions by: Jonny <https://github.com/JonnyJong>
// Definitions: https://github.com/JonnyJong/ezal

type EventType = 'init' | 'init-pages' | 'pre-render' | 'post-render' | 'pre-generate' | 'post-generate' | 'pre-style' | 'post-style' | 'pre-assets' | 'post-assets'

declare module 'ezal'{
  /**
   * Add a listener on ezal event
   * @param type Event type
   * @param listener Event listener
   */
  export function addListener(type: EventType, listener: Function): void
  /**
   * Set pug option in HTML template
   */
  export let pug: {
    [x: string | number | symbol] : any,
  }
  /**
   * Set stylus option in CSS template
   */
  export let stylus: {
    [x: string | number | symbol] : any,
  }
  export namespace render {
    /**
     * Render Markdown content to HTML
     * @param source Markdown content
     * @returns HTML string
     */
    function markdown(source: string): Promise<string>
    /**
     * Render HTML template to HTML
     * @param layoutName Layout's name in theme's layout folder
     * @param options Set pug option in HTML template
     * @returns HTML string
     */
    function pug(layoutName: string, options: any): Promise<string>
    /**
     * Render stylus to CSS
     * @param stylusContext Stylus content
     * @param options Set stylus option in CSS template
     * @returns CSS string
     */
    function stylus(stylusContext: string, options: any): Promise<string>
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
  }
  /**
   * Theme's config
   */
  export let theme: {
    [x: string | number | symbol] : any,
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
    layout: string
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
    categories: Set<string>
    /**
     * Post's tags
     */
    tags: Set<string>
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
   * All the categories
   */
  export let categories: Map<string, Set<Post>>
  /**
   * All the tags
   */
  export let tags: Map<string, Set<Post>>
  /**
   * Set marked code highlight extension
   * @param markedHighlight Marked code highlight extension
   */
  export function setMarkedHighlight(markedHighlight: import('marked').marked.MarkedExtension):void
  /**
   * Set marked extensions
   * @param markedExtensions Marked extensions
   */
  export function setMarkedExtension(markedExtensions: import('marked').marked.TokenizerAndRendererExtension[]):void
}
