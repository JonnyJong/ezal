import { info } from "./console";
import readConfig, { checkConfig } from "./config";
import { readPages, readPosts, pages, posts, categroies, tags, Page, Post, updatePage, readPage } from "./page";
import { initEvents, triggerListeners } from "./event";
import { initMarked, render, renderAll } from "./render";
import { generate, generateAll } from "./generate";
import { generateStyle, initStylus } from "./style";
import { copyAssets } from "./assets";
import clean from "./clean";
import Watcher from "./watch";
import { startServer, stopServer } from "./serve";
import init from "./init";

let config: any;

let options = {config, pages, posts, categroies, tags, Page, Post}

async function check() {
  let startStamp = Date.now()
  info('Initializing...');
  await checkConfig();
  await initMarked(options);
  await initStylus(options);
  await initEvents(options);
  info(`Ready in ${Date.now() - startStamp}ms.`)
}

async function build() {
  info('Loading config...');
  config = await readConfig();
  info('Loading pages and posts...');
  await readPages();
  await readPosts();
  await triggerListeners('pre-render');
  info('Rendering...');
  await renderAll(pages);
  await renderAll(posts);
  await triggerListeners('post-render');
  await generateAll(Array.from(pages));
  await generateAll(Array.from(posts));
  await triggerListeners('generate');
  await triggerListeners('post-generate');
  await generateStyle();
  await copyAssets();
  await triggerListeners('post-assets');
  info('Done!');
}

function serve() {
  let watcher = new Watcher(copyAssets, async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir')=>{
    if (event.includes('Dir')) return;
    await generateAll(Array.from(pages));
    await generateAll(Array.from(posts));
    await triggerListeners('generate');
    await triggerListeners('post-generate');
  }, async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', url: string)=>{
    if (event.includes('Dir')) return;
    switch (event) {
      case 'unlink':
        pages.forEach((page)=>{
          if (page.path === url) page.remove();
        });
        break;
      case 'change':
        await pages.forEach(async (page)=>{
          if (page.path === url) {
            updatePage(page);
            await triggerListeners('pre-render');
            await render(page);
            await triggerListeners('post-render');
            await generate(page);
            await triggerListeners('generate');
            await triggerListeners('post-generate');
          }
        });
        break;
      case 'add':
        await readPage(url, 'page');
        break;
    }
  }, async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', url: string)=>{
    if (event.includes('Dir')) return;
    switch (event) {
      case 'unlink':
        posts.forEach((post)=>{
          if (post.path === url) post.remove();
        });
        break;
      case 'change':
        await posts.forEach(async (post)=>{
          if (post.path === url) {
            updatePage(post);
            await triggerListeners('pre-render');
            await render(post);
            await triggerListeners('post-render');
            await generate(post);
            await triggerListeners('generate');
            await triggerListeners('post-generate');
          }
        });
        break;
      case 'add':
        await readPage(url, 'post');
        break;
    }
  }, generateStyle);
  startServer();

  process.on('SIGINT', async ()=>{
    stopServer();
    await watcher.close();
  });
  process.on('exit', async ()=>{
    stopServer();
    await watcher.close();
  });
}

if (process.execArgv.includes('clean')) {
  info('Cleaning...');
  clean();
}else if (process.execArgv.includes('serve')) {
  check().then(build).then(serve);
}else if (process.execArgv.includes('init')) {
  check().then(build);
}else{
  init();
}
