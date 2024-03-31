export declare class IPlugin {
  /**
   * 名称
   * @example 'ezal-plugin-xxx'
   * @pattern ^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$
   * @description 命名规则同 node 包名
   */
  name: string;
};