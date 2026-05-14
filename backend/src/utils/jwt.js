const crypto = require('crypto');
const AppError = require('../middlewares/appError');

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24;

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'pi3-pescadores-dev-secret';
  return String(secret);
}

function parseExpiresIn(value) {
  if (!value) {
    return DEFAULT_EXPIRES_IN_SECONDS;
  }

  if (/^\d+$/.test(String(value))) {
    return Number(value);
  }

  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) {
    return DEFAULT_EXPIRES_IN_SECONDS;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return amount * multipliers[unit];
}

function sign(payload, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = parseExpiresIn(options.expiresIn || process.env.JWT_EXPIRES_IN);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const body = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const unsignedToken = `${base64UrlJson(header)}.${base64UrlJson(body)}`;
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(unsignedToken)
    .digest('base64url');

  return `${unsignedToken}.${signature}`;
}

function verify(token) {
  const parts = String(token || '').split('.');

  if (parts.length !== 3) {
    throw new AppError(401, 'Invalid token');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(unsignedToken)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError(401, 'Invalid token');
  }

  let payload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch (error) {
    throw new AppError(401, 'Invalid token');
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new AppError(401, 'Expired token');
  }

  return payload;
}

module.exports = {
  sign,
  verify,
};
