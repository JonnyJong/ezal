import { error } from "./console";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";

const pageBase = path.join(process.cwd(), 'source/pages')
const postBase = path.join(process.cwd(), 'source/posts')
const frontMatterReg = [/---\n(.*?)\n---/sg, /(.*?)\n---/sg]

const pageKeys = ['path', 'title', 'date', 'updated', 'layout', 'source', 'context', 'constructor', 'update', 'remove']
const postKeys = ['path', 'title', 'date', 'updated', 'layout', 'source', 'context', 'constructor', 'update', 'addTag', 'removeTag', 'addCategory', 'removeCategory', 'remove']

let pages: Set<Page> = new Set();
let posts: Set<Post> = new Set();
let categroies: Map<string, Set<Post>> = new Map();
// let categroies: Set<Category> = new Set();
let tags: Map<string, Set<Post>> = new Map();

/* class Category{
  name: string;
  posts: Set<Post> = new Set();
  parent: Category | null = null;
  children: Set<Category> = new Set();
  constructor(name: string, parent: Category | null){
    Category._checkName(name, parent);
    this.name = name;
    if (parent) {
      this.parent = parent;
      this.parent.addChild(this);
    }else{
      categroies.add(this);
    }
  }
  addChild(child: Category){
    Category._checkName(child.name, this)
    categroies.delete(child);
    this.children.add(child);
    if (child.parent) {
      child.parent.children.delete(child);
    }
    child.parent = this;
  }
  setParent(parent: Category){
    Category._checkName(this.name, parent)
    if (this.parent) {
      this.parent.children.delete(this);
      this.parent = parent;
      this.parent.children.add(this);
    }else{
      categroies.delete(this);
      this.parent = parent;
      this.parent.children.add(this);
    }
  }
  removeParent(){
    Category._checkName(this.name, null)
    if (this.parent) {
      this.parent.children.delete(this);
      this.parent = null;
    }
  }
  remove(){
    if (this.parent) {
      this.parent.children.delete(this);
    }else{
      categroies.delete(this)
    }
    this.posts.forEach((post)=>{
      post.categroies.delete(this)
    })
  }
  addPost(post: Post){
    this.posts.add(post)
    post.categroies.add(this)
  }
  removePost(post: Post){
    this.posts.delete(post)
    post.categroies.delete(this)
  }
  setName(name: string){
    Category._checkName(name, this.parent)
    this.name = name
  }
  static _checkName(name: string, range: Category | null){
    let checked = true
    if (range) {
      range.children.forEach((category)=>{
        if (category.name === name) checked = false
      })
    }else{
      categroies.forEach((category)=>{
        if (category.name === name) checked = false
      })
    }
    if (!checked) {
      throw new Error('Cannot set the same name in the same hierarchy.')
    }
  }
} */

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
    // ready front matter
    let frontMatter;
    let frontMatterResult = frontMatterReg[0].exec(source);
    if (!frontMatterResult) frontMatterResult = frontMatterReg[1].exec(source);
    if (frontMatterResult) {
      frontMatter = parse(frontMatterResult[1]);
    } else {
      frontMatter = {};
    }
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
    if (frontMatterResult) {
      this.source = source.replace(frontMatterResult[0], '');
    }else{
      this.source = source;
    }
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
  categroies: Set<string> = new Set();
  // categroies: Set<Category> = new Set();
  tags: Set<string> = new Set();
  source: string = '';
  context: string = '';
  constructor(path: string, source: string){
    this.path = path;
    this.update(source);
  }
  update(source: string){
    this.remove();
    this.url = this.path.replace(postBase, 'posts');
    // ready front matter
    let frontMatter;
    let frontMatterResult = frontMatterReg[0].exec(source);
    if (!frontMatterResult) frontMatterResult = frontMatterReg[1].exec(source);
    if (frontMatterResult) {
      frontMatter = parse(frontMatterResult[1]);
    } else {
      frontMatter = {};
    }
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
    switch (typeof frontMatter.categroies) {
      case 'string':
        this.addCategory(frontMatter.categroies);
        break;
      case 'object':
        if (frontMatter.categroies instanceof Array) {
          frontMatter.categroies.forEach((tag: any)=>{
            if (typeof tag === 'string') this.addCategory(tag);
          });
        }
        break;
    }
    for (const key in frontMatter) {
      if (Object.prototype.hasOwnProperty.call(frontMatter, key) && !postKeys.includes(key)) {
        // @ts-ignore
        this[key] = frontMatter[key];
      }
    }
    // set source
    if (frontMatterResult) {
      this.source = source.replace(frontMatterResult[0], '');
    }else{
      this.source = source;
    }
    posts.add(this);
  }
  addTag(name: string){
    this.tags.add(name);
    if (tags.has(name)) {
      tags.get(name)?.add(this);
    }else{
      tags.set(name, new Set([this]));
    }
  }
  removeTag(name: string){
    if (tags.has(name)) {
      this.tags.delete(name);
      tags.get(name)?.delete(this);
    }
  }
  addCategory(name: string){
    this.categroies.add(name);
    if (categroies.has(name)) {
      categroies.get(name)?.add(this);
    }else{
      categroies.set(name, new Set([this]));
    }
  }
  removeCategory(name: string){
    if (categroies.has(name)) {
      this.categroies.delete(name);
      categroies.get(name)?.delete(this);
    }
  }
  remove(){
    posts.delete(this);
    this.tags.forEach(this.removeTag);
    this.categroies.forEach(this.removeCategory);
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
    if (dirent.name.indexOf('_') !== 0) return;
    if (dirent.isFile() && path.extname(dirent.name) === '.md') {
      result.push(path.join(dir, dirent.name));
    }else if (dirent.isDirectory()) {
      result = result.concat(readFiles(path.join(dir, dirent.name)));
    }
  })
  return result;
  /* let result: Array<string | Promise<any>> = []
  return readdir(dir, { withFileTypes: true }).then((files)=>{
    files.forEach((dirent)=>{
      if (dirent.isFile()) {
        result.push(path.join(dir, dirent.name));
      }else if (dirent.isDirectory()){
        result = result.concat(readFiles(path.join(dir, dirent.name)));
      }
    });
  }).then(()=>{
    return Promise.all(result);
  }); */
}
function readPage(path: string, type: 'page' | 'post') {
  return readFile(path, 'utf-8').catch(()=>{
    error(`Cannot read ${path}`);
    throw 'Cannot read';
  }).then((source)=>{
    let result
    if (type === 'page') {
      result = new Page(path, source)
    }else{
      result = new Post(path, source)
    }
    return result
  }).catch(()=>null)
}
async function readPosts() {
  let files = readFiles(path.join(process.cwd(), 'source/posts'))
  for (let i = 0; i < files.length; i++) {
    await readPage(files[i], 'post')
  }
  return posts
}
async function readPages() {
  let files = readFiles(path.join(process.cwd(), 'source/pages'))
  for (let i = 0; i < files.length; i++) {
    await readPage(files[i], 'page')
  }
  return pages
}
function updatePage(page: Page | Post) {
  return readFile(page.path, 'utf-8').catch(()=>{
    error(`Cannot read ${path}`);
    throw 'Cannot read';
  }).then((source)=>{
    page.update(source);
    return page;
  }).catch(()=>null)
}

export {
  pages,
  posts,
  categroies,
  tags,
  readPosts,
  readPages,
  readPage,
  Page,
  Post,
  updatePage,
}
