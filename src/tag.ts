import { ITag, IPost } from "./types";

let tags: Map<string, Tag> = new Map();

class Tag implements ITag {
  #name: string;
  #posts: Set<IPost> = new Set();
  constructor(name: string) {
    if (typeof name !== 'string') throw new TypeError('Tag names can only be set using the string type');
    if (tags.has(name)) throw new Error('Tag with the same name already exist.');
    this.#name = name;
    tags.set(name, this);
  };
  get name(): string {
    return this.#name;
  };
  get posts(): Set<IPost> {
    return this.#posts;
  };
}

export function setTag(name: string, post: IPost) {
  let tag = tags.get(name);
  if (!tag) {
    tag = new Tag(name);
    tags.set(name, tag);
  }
  tag.posts.add(post);
  post.tags.add(tag);
}

export function removeTag(name: string, post: IPost) {
  let tag = tags.get(name);
  if (!tag || !post.tags.has(tag)) return;
  post.tags.delete(tag);
  tag.posts.delete(post);
  if (tag.posts.size === 0) {
    tags.delete(name);
  }
}

export function getAllTags(): ITag[] {
  return [...tags.values()];
}