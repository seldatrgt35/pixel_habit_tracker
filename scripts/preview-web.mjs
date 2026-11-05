// Local-only preview of an Expo browser export; never use this as production hosting.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('apps/mobile/dist');
const port = Number(process.env.PREVIEW_PORT ?? 8081);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PREVIEW_PORT.');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(`${root}${sep}`)) {
      res.writeHead(403).end();
      return;
    }
    const exists = await stat(path).catch(() => undefined);
    if (!exists?.isFile()) {
      if (extname(path)) {
        res.writeHead(404).end();
        return;
      }
      path = resolve(root, 'index.html');
    }
    res.writeHead(200, {
      'Content-Type': types[extname(path)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(path)
      .on('error', () => res.destroy())
      .pipe(res);
  } catch {
    res.writeHead(400).end();
  }
}).listen(port, '127.0.0.1', () => console.log(`Local browser preview: http://localhost:${port}`));
