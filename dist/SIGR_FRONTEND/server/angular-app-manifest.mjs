
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
      "chunk-MSDF3RLY.js",
      "chunk-3MMSYGCD.js"
    ],
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-MSDF3RLY.js",
      "chunk-3MMSYGCD.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-T5HCIWB4.js",
      "chunk-5BNG6NGT.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HHQ4PZSX.js",
      "chunk-3MMSYGCD.js",
      "chunk-5BNG6NGT.js"
    ],
    "route": "/ministeres"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HHQ4PZSX.js",
      "chunk-3MMSYGCD.js",
      "chunk-5BNG6NGT.js"
    ],
    "route": "/ministeres/nouveau"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HHQ4PZSX.js",
      "chunk-3MMSYGCD.js",
      "chunk-5BNG6NGT.js"
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
    'index.csr.html': {size: 1981, hash: 'd84e629bc41eecab84ca396c51fd281d7e5332d9d9c5262dcf2003d80c41a1e7', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2521, hash: 'b5a9ed5fead01ab2f06080c1e97a65d1c8b91385f9f718a9de2689519813c316', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 12278, hash: '8803851279da737b8b0cb69eec98399331d01e28e0b459140ee6ea19d38a6dcf', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)}
  },
};
