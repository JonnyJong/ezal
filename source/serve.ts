import { start, shutdown } from "live-server";
import path from "path";
import { pages, posts, updatePage } from "./page";
import { render } from "./render";
import { generate } from "./generate";
import { autoGenerateProcedural } from "./procedural";

async function walkPages(url: string){
  url = url.slice(1).replace(/\//g, '\\');
  for (const page of Array.from(pages)) {
    if (page.url !== url) continue;
    updatePage(page);
    await render(page);
    await generate(page);
    throw 'MATCHED';
  }
  for (const post of Array.from(posts)) {
    if (post.url + '\\' !== url) continue;
    updatePage(post);
    await render(post);
    await generate(post);
    throw 'MATCHED';
  }
}

function startServer() {
  start({
    open: true,
    port: 5500,
    host: '127.0.0.1',
    root: path.join(process.cwd(), 'out'),
    file: path.join(process.cwd(), 'out/404.html'),
    ignore: path.join(process.cwd(), 'out'),
    logLevel: 0,
    middleware: [(req, res, next)=>{
      walkPages(req.url).then(()=>{
        return autoGenerateProcedural(req.url);
      }).catch(()=>{}).finally(()=>{
        next();
      });
    }],
  });
}
function stopServer() {
  shutdown();
}
export {
  startServer,
  stopServer,
};
