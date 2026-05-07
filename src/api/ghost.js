const KEY_ID = '6964770bf2a8f3e79fef9fed';
const KEY_SECRET = '8b9c6cbc1491a8443407f5c8b279c327b288c722d6bfbc5279e4dfa75e97331e';

async function makeJwt() {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT', kid: KEY_ID };
  const payload = { iat: now, exp: now + 300, aud: '/admin/' };

  const b64url = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  const h = b64url(header);
  const p = b64url(payload);
  const input = `${h}.${p}`;

  const secretBytes = new Uint8Array(
    KEY_SECRET.match(/.{2}/g).map((b) => parseInt(b, 16))
  );
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${input}.${sigB64}`;
}

async function ghostFetch(path) {
  const jwt = await makeJwt();
  const res = await fetch(`/ghost-api${path}`, {
    headers: { Authorization: `Ghost ${jwt}` },
  });
  if (!res.ok) throw new Error(`Ghost API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchPosts(page = 1, limit = 10) {
  const data = await ghostFetch(
    `/posts/?limit=${limit}&page=${page}&include=tags,authors` +
    `&fields=id,title,custom_excerpt,excerpt,feature_image,published_at,primary_tag,slug` +
    `&filter=status:published%2Btag:-dailynews&order=published_at%20desc`
  );
  return data.posts ?? [];
}

export async function fetchPost(id) {
  const data = await ghostFetch(`/posts/${id}/?formats=plaintext,html&include=tags,authors`);
  return data.posts[0];
}

// Rewrite Ghost image URLs through Vite proxy to avoid CORS on export
export function proxyImage(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `/ghost-image${u.pathname}`;
  } catch {
    return url;
  }
}

export function formatDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${d.getFullYear()}`;
}
