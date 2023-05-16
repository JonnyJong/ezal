import { watch, FSWatcher } from "chokidar";
import path from "path";

export default class Watcher{
  assetsWatcher: FSWatcher;
  layoutWatcher: FSWatcher;
  pageWatcher: FSWatcher;
  postWatcher: FSWatcher;
  styleWatcher: FSWatcher;
  constructor(assets: Function, layout: Function, page: Function, post: Function, style: Function){
    this.assetsWatcher = watch(path.join(process.cwd(), 'assets'));
    this.layoutWatcher = watch(path.join(process.cwd(), 'assets'));
    this.pageWatcher = watch(path.join(process.cwd(), 'assets'));
    this.postWatcher = watch(path.join(process.cwd(), 'assets'));
    this.styleWatcher = watch(path.join(process.cwd(), 'assets'));
    
    this.assetsWatcher.on('ready',()=>{
      this.assetsWatcher.on('all', ()=>assets())
    })
    this.layoutWatcher.on('ready',()=>{
      this.layoutWatcher.on('all', (...args)=>layout(...args))
    })
    this.pageWatcher.on('ready',()=>{
      this.pageWatcher.on('all', (...args)=>page(...args))
    })
    this.postWatcher.on('ready',()=>{
      this.postWatcher.on('all', (...args)=>post(...args))
    })
    this.styleWatcher.on('ready',()=>{
      this.styleWatcher.on('all', ()=>style())
    })
  }
  close(){
    return Promise.all([
      this.assetsWatcher.close(),
      this.layoutWatcher.close(),
      this.pageWatcher.close(),
      this.postWatcher.close(),
      this.styleWatcher.close(),
    ])
  }
}
