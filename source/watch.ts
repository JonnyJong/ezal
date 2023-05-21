import { watch, FSWatcher } from "chokidar";
import path from "path";

export default class Watcher{
  assetsWatcher: FSWatcher;
  themeAssetsWatcher: FSWatcher;
  layoutWatcher: FSWatcher;
  pageWatcher: FSWatcher;
  postWatcher: FSWatcher;
  styleWatcher: FSWatcher;
  constructor(themeName: string, assets: Function, layout: Function, page: Function, post: Function, style: Function){
    this.assetsWatcher = watch(path.join(process.cwd(), 'assets'));
    this.themeAssetsWatcher = watch(path.join(process.cwd(), 'themes', themeName, 'assets'));
    this.layoutWatcher = watch(path.join(process.cwd(), 'themes', themeName, 'layout'));
    this.pageWatcher = watch(path.join(process.cwd(), 'pages'));
    this.postWatcher = watch(path.join(process.cwd(), 'posts'));
    this.styleWatcher = watch(path.join(process.cwd(), 'themes', themeName, 'style'));
    
    this.assetsWatcher.on('ready',()=>{
      this.assetsWatcher.on('all', ()=>assets())
    })
    this.themeAssetsWatcher.on('ready',()=>{
      this.themeAssetsWatcher.on('all', ()=>assets())
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
      this.themeAssetsWatcher.close(),
      this.layoutWatcher.close(),
      this.pageWatcher.close(),
      this.postWatcher.close(),
      this.styleWatcher.close(),
    ])
  }
}
