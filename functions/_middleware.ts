export async function onRequest(context) {
  const response = await context.next();
  const newHeaders = new Headers(response.headers);

  // Force correct MIME types
  const pathname = new URL(context.request.url).pathname;
  if (pathname.includes('.js')) {
    newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
  } else if (pathname.includes('.mjs')) {
    newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
  } else if (pathname.includes('.css')) {
    newHeaders.set('Content-Type', 'text/css; charset=utf-8');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
