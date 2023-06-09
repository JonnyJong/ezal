type Post = import('./page').Post;
export class Tags extends Set{
  constructor(){
    super();
  }
  add(name: string): any{
    name = String(name);
    let checked = true;
    this.forEach((tag)=>{
      if (tag.name === name) {
        checked = false;
      }
    });
    if (!checked) throw new Error('Cannot create a tag with the same name')
    let tag = new Tag(name);
    super.add(tag);
    return tag;
  }
  delete(tag: Tag | string): boolean{
    if (typeof tag === 'object' && tag instanceof Tag){
      tag.remove();
      return true;
    }
    let target = this.get(tag);
    if (target) {
      target.remove();
      return true;
    }
    return false;
  }
  has(tag: Tag | string): boolean{
    switch (typeof tag) {
      case 'string':
      case 'number':
        return !!this.get(tag);
      case 'object':
        if (tag instanceof Tag){
          return super.has(tag);
        }
    }
    return false;
  }
  get(name: string): Tag | null{
    name = String(name);
    this.forEach((tag)=>{
      if (tag.name === name){
        return tag;
      }
    });
    return null;
  }
  autoGet(name: string): Tag{
    name = String(name);
    let target;
    this.forEach((tag)=>{
      if (tag.name === name){
        return target = tag;
      }
    });
    if (target) return target;
    target = this.add(name);
    return target;
  }
  clear():void {}
}
export class Tag{
  name: string;
  posts: Set<Post> = new Set();
  constructor(name: string){
    name = String(name);
    this.name = name;
  }
  addPost(post: Post): void{
    this.posts.add(post);
    post.tags.add(this);
  }
  removePost(post: Post): void{
    this.posts.delete(post);
    post.tags.delete(this);
  }
  remove(): void{
    this.posts.forEach((post)=>{
      post.tags.delete(this);
    });
    tags.delete(this);
  }
}
export let tags = new Tags();
