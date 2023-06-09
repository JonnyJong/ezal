import { error } from "./console";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import { Category, categoriesRoot } from "./category";
import { tags, Tag } from "./tag";

const pageBase = path.join(process.cwd(), 'pages');
const postBase = path.join(process.cwd(), 'posts');

const pageKeys = ['path', 'title', 'date', 'updated', 'layout', 'source', 'context', 'constructor', 'update', 'remove'];
const postKeys = ['path', 'title', 'date', 'updated', 'layout', 'source', 'context', 'constructor', 'update', 'addTag', 'removeTag', 'addcategory', 'removecategory', 'remove', 'tags', 'categories'];

let pages: Set<Page> = new Set();
let posts: Set<Post> = new Set();

function getFrontMatter(source: string) {
  try {
    let splited = source.split('---\n');
    if (source.indexOf('---') === 0) {
      return {
        frontMatter: parse(splited[1]),
        clearSource: splited.slice(2, splited.length).join('---\n'),
      };
    }else{
      return {
        frontMatter: parse(splited[0]),
        clearSource: splited.slice(1, splited.length).join('---\n'),
      };
    }
  } catch {
    return {
      frontMatter: {},
      clearSource: source,
    };
  }
}

class Page{
  path: string;
  url: string = '';
  title: string | null = null;
  date: Date = new Date();
  updated: Date = new Date();
  layout: string = 'page';
  source: string = '';
  context: string = '';
  constructor(path: string, source: string){
    this.path = path;
    this.update(source);
  }
  update(source: string){
    this.remove();
    this.url = this.path.replace(pageBase, '');
    this.url = path.join(path.dirname(this.url), path.parse(this.url).name);
    // ready front matter
    let { frontMatter, clearSource } = getFrontMatter(source);
    frontMatter = Object.assign({
      date: Date.now(),
      updated: Date.now(),
      layout: 'page',
    }, frontMatter);
    // check and set
    if (frontMatter.title) {
      this.title = String(frontMatter.title);
    }else{
      this.title = null;
    }
    this.date = new Date(frontMatter.date);
    if (isNaN(this.date.getTime())) this.date = new Date();
    this.updated = new Date(frontMatter.date);
    if (isNaN(this.updated.getTime())) this.updated = new Date();
    this.layout = String(frontMatter.layout);
    for (const key in frontMatter) {
      if (Object.prototype.hasOwnProperty.call(frontMatter, key) && !pageKeys.includes(key)) {
        // @ts-ignore
        this[key] = frontMatter[key];
      }
    }
    // set source
    this.source = clearSource;
    pages.add(this);
  }
  remove(){
    pages.delete(this);
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key) && !pageKeys) {
        delete this[key];
      }
    }
  }
}
class Post{
  path: string;
  url: string = '';
  title: string | null = null;
  date: Date = new Date();
  updated: Date = new Date();
  layout: string = 'post';
  categories: Map<Array<string>, Category> = new Map();
  tags: Set<Tag> = new Set();
  source: string = '';
  context: string = '';
  constructor(path: string, source: string){
    this.path = path;
    this.update(source);
  }
  update(source: string){
    this.remove();
    this.url = this.path.replace(postBase, 'posts');
    this.url = path.join(path.dirname(this.url), path.parse(this.url).name);
    // ready front matter
    let { frontMatter, clearSource } = getFrontMatter(source);
    frontMatter = Object.assign({
      date: Date.now(),
      updated: Date.now(),
      layout: 'post',
    }, frontMatter);
    // check and set
    if (frontMatter.title) {
      this.title = String(frontMatter.title);
    }else{
      this.title = null;
    }
    this.date = new Date(frontMatter.date);
    if (isNaN(this.date.getTime())) this.date = new Date();
    this.updated = new Date(frontMatter.date);
    if (isNaN(this.updated.getTime())) this.updated = new Date();
    this.layout = String(frontMatter.layout);
    switch (typeof frontMatter.tags) {
      case 'string':
        this.addTag(frontMatter.tags);
        break;
      case 'object':
        if (frontMatter.tags instanceof Array) {
          frontMatter.tags.forEach((tag: any)=>{
            if (typeof tag === 'string') this.addTag(tag);
          });
        }
        break;
    }
    Category.initCategories(this, frontMatter.categories);
    for (const key in frontMatter) {
      if (Object.prototype.hasOwnProperty.call(frontMatter, key) && !postKeys.includes(key)) {
        // @ts-ignore
        this[key] = frontMatter[key];
      }
    }
    // set source
    this.source = clearSource;
    posts.add(this);
  }
  addTag(name: string){
    tags.autoGet(name).addPost(this);
  }
  removeTag(name: string){
    let target: Tag | undefined;
    this.tags.forEach((tag)=>{
      if (tag.name === name){
        target = tag;
      }
    });
    if (!target) return
    target.removePost(this);
  }
  addCategory(path: Array<string>){
    Category.getByPathAuto(path).addPost(this);
  }
  removeCategory(path: Array<string>){
    let target = this.categories.get(path);
    if (!target) return;
    target.removePost(this);
  }
  remove(){
    posts.delete(this);
    this.tags.forEach((tag)=>{
      tag.removePost(this);
    })
    this.categories.forEach((category)=>{
      category.removePost(this);
    });
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key) && !postKeys.includes(key)) {
        delete this[key];
      }
    }
  }
}

function readFiles(dir: string) {
  let result: Array<string> = [];
  readdirSync(dir, { withFileTypes: true }).forEach((dirent)=>{
    if (dirent.name.indexOf('_') === 0) return;
    if (dirent.isFile() && path.extname(dirent.name) === '.md') {
      result.push(path.join(dir, dirent.name));
    }else if (dirent.isDirectory()) {
      result = result.concat(readFiles(path.join(dir, dirent.name)));
    }
  })
  return result;
}
function readPage(path: string, type: 'page' | 'post') {
  return readFile(path, 'utf-8').catch(()=>{
    error(`Cannot read ${path}`);
    throw 'Cannot read';
  }).then((source)=>{
    let result;
    if (type === 'page') {
      result = new Page(path, source.replace(/\r\n/g, '\n'));
    }else{
      result = new Post(path, source.replace(/\r\n/g, '\n'));
    }
    return result;
  }).catch((err)=>{
    console.error(err);
    return null
  });
}
async function readPosts() {
  let files = readFiles(path.join(process.cwd(), 'posts'));
  for (let i = 0; i < files.length; i++) {
    await readPage(files[i], 'post');
  }
  return posts;
}
async function readPages() {
  let files = readFiles(path.join(process.cwd(), 'pages'));
  for (let i = 0; i < files.length; i++) {
    await readPage(files[i], 'page');
  }
  return pages;
}
function updatePage(page: Page | Post) {
  return readFile(page.path, 'utf-8').catch(()=>{
    error(`Cannot read ${path}`);
    throw 'Cannot read';
  }).then((source)=>{
    page.update(source.replace(/\r\n/g, '\n'));
    return page;
  }).catch(()=>null);
}

export {
  pages,
  posts,
  categoriesRoot,
  tags,
  readPosts,
  readPages,
  readPage,
  Page,
  Post,
  updatePage,
}
