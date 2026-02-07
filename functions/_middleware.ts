export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);

  // Set correct MIME types for JavaScript files
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', 'text/javascript; charset=utf-8');
    return newResponse;
  }

  return response;
}
