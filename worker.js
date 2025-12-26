import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event, {});
  } catch (e) {
    // If asset not found, serve index.html for client-side routing
    try {
      let notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      return new Response(notFoundResponse.body, {
        ...notFoundResponse,
        status: 200
      });
    } catch (e) {
      return new Response(e.message || e.toString(), { status: 500 });
    }
  }
}
