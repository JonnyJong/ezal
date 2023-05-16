import { start, shutdown } from "live-server";
import path from "path";

function startServer() {
  start({
    open: true,
    port: 5500,
    host: '127.0.0.1',
    root: path.join(process.cwd(), 'out'),
    file: path.join(process.cwd(), 'out/404.html'),
    wait: 2,
    logLevel: 0,
  })
}
function stopServer() {
  shutdown();
}
export {
  startServer,
  stopServer,
};
