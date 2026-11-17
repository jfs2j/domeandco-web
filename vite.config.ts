import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const htmlPages: Record<string, string> = {
  'index': path.resolve(__dirname, 'index.html'),
  'services': path.resolve(__dirname, 'services/index.html'),
  'services-qualite-conformite': path.resolve(__dirname, 'services/qualite-conformite/index.html'),
  'services-structuration-procedes': path.resolve(__dirname, 'services/structuration-procedes/index.html'),
  'services-mise-sur-le-marche': path.resolve(__dirname, 'services/mise-sur-le-marche/index.html'),
  'diaspora': path.resolve(__dirname, 'diaspora/index.html'),
  'a-propos': path.resolve(__dirname, 'a-propos/index.html'),
  'ressources': path.resolve(__dirname, 'ressources/index.html'),
  'contact': path.resolve(__dirname, 'contact/index.html'),
  'mentions-legales': path.resolve(__dirname, 'mentions-legales/index.html'),
  'politique-de-confidentialite': path.resolve(__dirname, 'politique-de-confidentialite/index.html'),
  '404': path.resolve(__dirname, '404.html'),
  'en-index': path.resolve(__dirname, 'en/index.html'),
  'en-services': path.resolve(__dirname, 'en/services/index.html'),
  'en-services-qualite-conformite': path.resolve(__dirname, 'en/services/qualite-conformite/index.html'),
  'en-services-structuration-procedes': path.resolve(__dirname, 'en/services/structuration-procedes/index.html'),
  'en-services-mise-sur-le-marche': path.resolve(__dirname, 'en/services/mise-sur-le-marche/index.html'),
  'en-diaspora': path.resolve(__dirname, 'en/diaspora/index.html'),
  'en-a-propos': path.resolve(__dirname, 'en/a-propos/index.html'),
  'en-ressources': path.resolve(__dirname, 'en/ressources/index.html'),
  'en-contact': path.resolve(__dirname, 'en/contact/index.html'),
  'en-mentions-legales': path.resolve(__dirname, 'en/mentions-legales/index.html'),
  'en-politique-de-confidentialite': path.resolve(__dirname, 'en/politique-de-confidentialite/index.html'),
  'en-404': path.resolve(__dirname, 'en/404.html'),
};

export default defineConfig(() => {
  return {
    appType: 'mpa',
    plugins: [
      {
        name: 'static-mpa-dev-routing',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url) return next();
            const [rawPath, query] = req.url.split('?');
            if (rawPath.startsWith('/assets/') || rawPath.startsWith('/@')) {
              return next();
            }
            const clean = rawPath.replace(/\/+$/, '');
            const candidate = clean === ''
              ? path.resolve(__dirname, 'index.html')
              : path.resolve(__dirname, '.' + clean, 'index.html');
            if (!path.extname(rawPath) && fs.existsSync(candidate)) {
              req.url = (clean === '' ? '/index.html' : `${clean}/index.html`) + (query ? `?${query}` : '');
              return next();
            }
            const directFile = path.resolve(__dirname, '.' + rawPath);
            if (!fs.existsSync(directFile)) {
              const notFound = rawPath.startsWith('/en/')
                ? path.resolve(__dirname, 'en/404.html')
                : path.resolve(__dirname, '404.html');
              if (fs.existsSync(notFound)) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(notFound, 'utf-8'));
                return;
              }
            }
            next();
          });
        },
      },
      {
        name: 'copy-static-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) return;
          const distDir = path.resolve(__dirname, 'dist');
          if (!fs.existsSync(distDir)) return;
          const assetsSrc = path.resolve(__dirname, 'assets');
          const assetsDist = path.resolve(distDir, 'assets');
          if (fs.existsSync(assetsSrc)) {
            fs.cpSync(assetsSrc, assetsDist, {recursive: true, force: true});
          }
          for (const rootFile of [
            'CNAME',
            'robots.txt',
            'sitemap.xml',
            'site.webmanifest',
            'favicon.ico',
            'favicon.svg',
            'favicon-32.png',
            'apple-touch-icon.png',
            'icon-192.png',
            'icon-512.png',
            'domeandco-creme-sur-vert.png',
          ]) {
            const src = path.resolve(__dirname, rootFile);
            if (fs.existsSync(src)) {
              fs.copyFileSync(src, path.resolve(distDir, rootFile));
            }
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: htmlPages,
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
