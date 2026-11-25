const http = require('node:http');

const { getDefaultConfig } = require('expo/metro-config');

const API_PREFIX = '/api';
const API_HOST = process.env.API_PROXY_HOST ?? '127.0.0.1';
const API_PORT = Number(process.env.API_PROXY_PORT ?? 3000);

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    if (!req.url || (req.url !== API_PREFIX && !req.url.startsWith(`${API_PREFIX}/`))) {
      return middleware(req, res, next);
    }

    const targetPath = req.url.slice(API_PREFIX.length) || '/';

    const proxyRequest = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: targetPath,
        method: req.method,
        headers: { ...req.headers, host: `${API_HOST}:${API_PORT}` },
      },
      (proxyResponse) => {
        res.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
        proxyResponse.pipe(res);
      }
    );

    proxyRequest.on('error', (error) => {
      console.warn(`[api proxy] ${req.method} ${req.url} failed: ${error.message}`);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
    });

    req.pipe(proxyRequest);
  },
};

module.exports = config;
