type Post = import('./page').Post;
function parseCategoriesObject(object: any, parentPath: Array<string> | undefined = []) {
  let result: Array<Array<string>> = [];
  switch (typeof object) {
    case 'boolean':
    case 'number':
    case 'string':
      let path = Array.from(parentPath);
      path.push(String(object));
      result.push(path);
      break;
    case 'object':
      if (object instanceof Array){
        for (const subObject of object) {
          result = Array.from([...result, ...parseCategoriesObject(subObject, parentPath)]);
        }
        break;
      }
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          result = Array.from([...result, ...parseCategoriesObject(object[key], [...parentPath, key])]);
        }
      }
  }
  return result;
}
export class CategoryRoot{
  children: Map<string, Category> = new Map();
  constructor(){}
  query(path: Array<string>): Category | undefined{
    let target: CategoryRoot | Category | undefined = this;
    for (const name of path) {
      if (target === undefined) return undefined;
      target = target.children.get(name);
    }
    if (target === this) return undefined;
    // @ts-ignore
    return target;
  }
  addChild(category: Category): void{
    if (this.children.has(category.name)) throw new Error('Cannot add a category child with the same name.')
    this.children.set(category.name, category);
    return
  }
  getChildAuto(name: string): Category{
    if (this.children.has(name)) {
      // @ts-ignore
      return this.children.get(name);
    }
    let child = new Category(name, this);
    this.children.set(name, child);
    return child;
  }
  getAll(): Array<Category>{
    let children: Array<Category> = [];
    this.children.forEach((child)=>{
      children.push(child);
      children = children.concat(child.getAll());
    });
    return children;
  }
  static getByPathAuto(path: Array<string>): Category{
    if (!path || typeof path !== 'object' || !(path instanceof Array)) throw new Error('Need a non-empty Array<string>');
    let target = categoriesRoot;
    for (const name of path) {
      target = target.getChildAuto(name);
    }
    // @ts-ignore
    return target;
  }
  static addPostByPath(path: Array<string>, post: Post): Category{
    let target: Category = Category.getByPathAuto(path);
    target.addPost(post);
    return target;
  }
  static initCategories(post: Post, object: any): void{
    let paths = parseCategoriesObject(object);
    for (const path of paths) {
      CategoryRoot.getByPathAuto(path).addPost(post);
    }
  }
}
export class Category extends CategoryRoot{
  name: string = '';
  posts: Set<Post> = new Set();
  parent: Category | CategoryRoot = categoriesRoot;
  path: Array<string> = [];
  constructor(path: Array<string> | string, parent?: CategoryRoot | Category){
    super()
    if (typeof path === 'string' && typeof parent === 'object' && parent instanceof CategoryRoot){
      this.name = path;
      parent.addChild(this);
      this.parent = parent;
      if (parent instanceof Category) {
        this.path = [...parent.path, path];
      }else{
        this.path = [path];
      }
    };
    if (typeof path !== 'object' || !(path instanceof Array)) return
    path.forEach((name, i)=>{
      if (i === path.length - 1) {
        this.name = name;
        this.parent.addChild(this);
        this.path = Array.from(path);
        return;
      };
      this.parent = this.parent.getChildAuto(name);
    });
  }
  remove(): void{
    this.children.forEach((child)=>child.remove());
    this.parent.children.delete(this.name);
    this.posts.forEach((post)=>{
      post.categories.delete(this.path);
    });
  }
  addPost(post: Post): void{
    post.categories.set(this.path, this);
    this.posts.add(post);
  }
  removePost(post: Post): void{
    this.posts.delete(post);
    post.categories.delete(this.path);
  }
}
export let categoriesRoot: CategoryRoot = new CategoryRoot();
