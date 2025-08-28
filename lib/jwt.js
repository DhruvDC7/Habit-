import jwt from 'jsonwebtoken';

export function parseExpires(str) {
  // supports e.g. 15m, 1h, 7d; returns seconds
  if (!str) return 0;
  const m = String(str).match(/^(\d+)([smhd])$/i);
  if (!m) return Number(str) || 0;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return n * mult;
}

function signGeneric(payload, secret, expStr) {
  const expiresIn = expStr || '15m';
  return jwt.sign(payload, secret, { expiresIn });
}

export function signAccess(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const exp = process.env.JWT_EXPIRES_IN || '15m';
  return signGeneric(payload, secret, exp);
}

export function signRefresh(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
  const exp = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return signGeneric(payload, secret, exp);
}

export function verifyAccess(token) {
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    return jwt.verify(token, secret);
  } catch (_) {
    return null;
  }
}

export function verifyRefresh(token) {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
    return jwt.verify(token, secret);
  } catch (_) {
    return null;
  }
}
