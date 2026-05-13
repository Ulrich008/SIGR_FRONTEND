
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/auth/login",
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TTGRVMLR.js",
      "chunk-TSQ4URFU.js"
    ],
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TTGRVMLR.js",
      "chunk-TSQ4URFU.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-Z7GESKBY.js",
      "chunk-O4EFSMHY.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BBV5NXDQ.js",
      "chunk-TSQ4URFU.js",
      "chunk-O4EFSMHY.js"
    ],
    "route": "/ministeres"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BBV5NXDQ.js",
      "chunk-TSQ4URFU.js",
      "chunk-O4EFSMHY.js"
    ],
    "route": "/ministeres/nouveau"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BBV5NXDQ.js",
      "chunk-TSQ4URFU.js",
      "chunk-O4EFSMHY.js"
    ],
    "route": "/ministeres/*/edit"
  },
  {
    "renderMode": 0,
    "redirectTo": "/ministeres",
    "route": "/ministere"
  },
  {
    "renderMode": 0,
    "redirectTo": "/ministeres",
    "route": "/ministère"
  },
  {
    "renderMode": 2,
    "redirectTo": "/auth/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1981, hash: 'e790c6e8aaa530f4f77a3697ddba372974943640e763cc83ff4549b24c46317e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2521, hash: 'd596a7166095c6b0d1cfd9a35bb2c35c861f917cd4799bfaa26977f17e53bbd8', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 12229, hash: '625948d3db87bdf85cc343ea61e4d2419ef924e42c72fc16fa2c5af5656cc058', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)}
  },
};
