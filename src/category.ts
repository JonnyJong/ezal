import { ICategory, IPost } from "./types";

let categories: Map<string, Category> = new Map();

class Category implements ICategory {
  #name: string;
  #posts: Set<IPost> = new Set();
  #parent: Category | null;
  #children: Map<string, Category> = new Map();
  constructor(name: string, parent: Category | null) {
    this.#name = name;
    this.#parent = parent;
    if (parent) {
      parent.children.set(name, this);
    } else {
      categories.set(name, this);
    }
  };
  get name(): string {
    return this.#name;
  };
  get posts(): Set<IPost> {
    return this.#posts;
  };
  get parent(): Category | null {
    return this.#parent;
  };
  get children(): Map<string, Category> {
    return this.#children;
  };
  getPath(): string[] {
    throw new Error("Method not implemented.");
  };
}

export function searchCategory(path: string[]): Category | undefined {
  let category: Category | undefined = categories.get(path[0]);
  for (const name of path.slice(1)) {
    if (!category) return undefined;
    category = category.children.get(name);
  }
  return category;
}

export function setCategory(path: string[], post: IPost) {
  if (path.length === 0) return;
  let category: Category | undefined | null = searchCategory(path);
  if (!category) {
    category = null;
    for (const name of path) {
      category = new Category(name, category);
    }
  }
  category?.posts.add(post);
  post.categories.add(category as Category);
}
export function removeCategory(path: string[], post: IPost) {
  if (path.length === 0) return;
  let category = searchCategory(path);
  if (!category) return;
  post.categories.delete(category);
  category.posts.delete(post);
}

export function getAllRootCategories() {
  return [...categories];
}