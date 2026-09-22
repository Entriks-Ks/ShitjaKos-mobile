const backendBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';
const authOrigin =
  process.env.EXPO_PUBLIC_AUTH_ORIGIN?.replace(/\/$/, '') ?? 'http://localhost:3001';

const HOP_BY_HOP = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function cookiesFrom(headers: Headers) {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }
  const value = headers.get('set-cookie');
  return value ? [value] : [];
}

async function proxyToShitjaKos(request: Request) {
  const incoming = new URL(request.url);
  const target = `${backendBaseUrl}${incoming.pathname}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'referer') {
      headers.set(key, value);
    }
  });
  headers.set('origin', authOrigin);
  headers.set('referer', `${authOrigin}/`);

  const method = request.method.toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      redirect: 'manual',
    });
  } catch {
    return Response.json(
      { message: `Could not reach ShitjaKos at ${backendBaseUrl}. Start the web app on port 3001.` },
      { status: 502 },
    );
  }

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== 'set-cookie') {
      out.set(key, value);
    }
  });
  for (const cookie of cookiesFrom(upstream.headers)) {
    out.append('set-cookie', cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export function GET(request: Request) {
  return proxyToShitjaKos(request);
}

export function POST(request: Request) {
  return proxyToShitjaKos(request);
}

export function PUT(request: Request) {
  return proxyToShitjaKos(request);
}

export function PATCH(request: Request) {
  return proxyToShitjaKos(request);
}

export function DELETE(request: Request) {
  return proxyToShitjaKos(request);
}

export function HEAD(request: Request) {
  return proxyToShitjaKos(request);
}

export function OPTIONS(request: Request) {
  return proxyToShitjaKos(request);
}
