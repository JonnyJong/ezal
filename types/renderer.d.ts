type MatchResult = boolean | number | undefined | null | void
type InlineMatchResult = number | false | undefined | null | void

interface BlockRenderer{
  /**
   * Renderer with the same name and level will be overwritten
   */
  name: string;
  /**
   * The higher priority will overwrite,
   * and the new renderer will overwrite the old one when the priority is the same
   */
  priority: number | undefined;
  /**
   * Match the beginning
   * 
   * @param source One line of the source
   * @param variables Public variables within the source
   * @returns Match result
   */
  start: (source: string, variables: object) => MatchResult | Promise<MatchResult>;
  /**
   * Matching endings
   * 
   * @param source One line of the source
   * @param variables Public variables within the source
   * @returns Match result
   */
  end: (source: string, variables: object) => MatchResult | Promise<MatchResult>;
  /**
   * Render markdown
   * 
   * @param source Matched markdown
   * @param variables Public variables within the source
   * @returns Rendered results
   */
  renderer: (source: string, variables: object) => string | Promise<String>;
}

interface LineRenderer{
  /**
   * Renderer with the same name and level will be overwritten
   */
  name: string;
  /**
   * The higher priority will overwrite,
   * and the new renderer will overwrite the old one when the priority is the same
   */
  priority: number | undefined;
  /**
   * Match the line
   * 
   * @param source One line of the source
   * @param variables Public variables within the source
   * @returns Match result
   */
  match: (source: string, variables: object) => MatchResult | Promise<MatchResult>;
  /**
   * Matching endings
   * 
   * @param source One line of the source
   * @param variables Public variables within the source
   * @returns Match result
   */
  renderer: (source: string, variables: object) => string | Promise<String>;
}

interface InlineRenderer{
  /**
   * Renderer with the same name and level will be overwritten
   */
  name: string;
  /**
   * The higher priority will overwrite,
   * and the new renderer will overwrite the old one when the priority is the same
   */
  priority: number | undefined;
  /**
   * Match inline
   * 
   * @param source One line of the source
   * @param variables Public variables within the source
   * @returns Match result
   */
  match: (source: string, variables: object) => InlineMatchResult | Promise<InlineMatchResult>;
  /**
   * Render markdown
   * 
   * @param source Matched markdown
   * @param variables Public variables within the source
   * @returns Rendered results
   */
  renderer: (source: string, variables: object) => string | Promise<String>;
}

type Renderer = BlockRenderer | LineRenderer | InlineRenderer;

interface Renderers{
  block: BlockRenderer[],
  line: LineRenderer[],
  inline: InlineRenderer[],
}

export {
  BlockRenderer,
  LineRenderer,
  InlineRenderer,
  Renderers,
  Renderer,
}
