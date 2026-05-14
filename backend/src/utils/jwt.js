const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 7;

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return process.env.JWT_SECRET;
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || getSecret();
}

exports.createAccessToken = (usuario) => {
  return jwt.sign(
    {
      email: usuario.email,
      role: usuario.tipo_usuario,
      type: 'access',
    },
    getSecret(),
    {
      subject: String(usuario.id),
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
};

exports.createRefreshToken = (usuario, sessionId) => {
  return jwt.sign(
    {
      type: 'refresh',
      jti: String(sessionId),
    },
    getRefreshSecret(),
    {
      subject: String(usuario.id),
      expiresIn: REFRESH_EXPIRES_IN,
    }
  );
};

exports.verifyAccessToken = (token) => {
  const payload = jwt.verify(token, getSecret());
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
};

exports.verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, getRefreshSecret());
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
};

exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

exports.getRefreshExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_EXPIRES_DAYS);
  return date;
};
