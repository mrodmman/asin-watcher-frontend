import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Try to serve static asset
      return await getAssetFromKV(
        {
          request,
          waitUntil(promise) {
            return ctx.waitUntil(promise);
          },
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      // For SPA routing, serve index.html for non-asset requests
      try {
        const url = new URL(request.url);
        if (!url.pathname.includes('.')) {
          const indexRequest = new Request(
            new URL('/index.html', request.url),
            request
          );
          return await getAssetFromKV(
            {
              request: indexRequest,
              waitUntil(promise) {
                return ctx.waitUntil(promise);
              },
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: assetManifest,
            }
          );
        }
      } catch (err) {}
      
      return new Response('Not Found', { status: 404 });
    }
  },
};
