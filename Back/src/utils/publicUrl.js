function getPublicBaseUrl(req) {
  const fromEnv = String(process.env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('x-forwarded-host') || req.get('host');
  if (!host) return '';
  return `${proto}://${host}`.replace(/\/$/, '');
}

function toPublicUrl(req, relativePath) {
  const base = getPublicBaseUrl(req);
  const path = String(relativePath || '').startsWith('/')
    ? relativePath
    : `/${relativePath}`;
  return base ? `${base}${path}` : path;
}

module.exports = { getPublicBaseUrl, toPublicUrl };
