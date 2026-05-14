const db = require('../database/models');
const AppError = require('../middlewares/appError');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  createAccessToken,
  createRefreshToken,
  getRefreshExpirationDate,
  hashToken,
  verifyRefreshToken,
} = require('../utils/jwt');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function toPublicUser(usuario) {
  const plain = usuario.toJSON ? usuario.toJSON() : usuario;

  return {
    id: plain.id,
    nome: plain.nome,
    email: plain.email,
    cpf: plain.cpf,
    telefone: plain.telefone,
    tipo_usuario: plain.tipo_usuario,
    ativo: plain.ativo,
    ultimo_login_em: plain.ultimo_login_em,
    created_at: plain.created_at,
  };
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError(400, 'senha must have at least 6 characters');
  }
}

async function createTokenPair(usuario, req) {
  const now = new Date();
  const session = await db.SessaoUsuario.create({
    usuario_id: usuario.id,
    refresh_token_hash: `pending-${usuario.id}-${now.getTime()}`,
    user_agent: req.headers['user-agent'] || null,
    ip: req.ip || req.socket?.remoteAddress || null,
    expira_em: getRefreshExpirationDate(),
    created_at: now,
    updated_at: now,
  });

  const accessToken = createAccessToken(usuario);
  const refreshToken = createRefreshToken(usuario, session.id);

  await session.update({
    refresh_token_hash: hashToken(refreshToken),
    updated_at: new Date(),
  });

  return { accessToken, refreshToken };
}

exports.register = async (payload, req) => {
  const nome = String(payload.nome || '').trim();
  const email = normalizeEmail(payload.email);
  const cpf = onlyDigits(payload.cpf);
  const telefone = payload.telefone ? String(payload.telefone).trim() : null;
  const senha = payload.senha || payload.password;

  if (!nome) {
    throw new AppError(400, 'nome is required');
  }

  if (!email || !email.includes('@')) {
    throw new AppError(400, 'valid email is required');
  }

  if (cpf.length !== 11) {
    throw new AppError(400, 'cpf must have 11 digits');
  }

  validatePassword(senha);

  const existing = await db.Usuario.findOne({
    where: {
      [db.Sequelize.Op.or]: [{ email }, { cpf }],
    },
  });

  if (existing) {
    throw new AppError(409, 'email or cpf already registered');
  }

  const now = new Date();
  const senhaHash = await hashPassword(senha);

  const usuario = await db.Usuario.create({
    nome,
    email,
    cpf,
    telefone,
    senha_hash: senhaHash,
    tipo_usuario: 'cliente',
    ativo: true,
    created_at: now,
    updated_at: now,
  });

  const tokens = await createTokenPair(usuario, req);

  return {
    user: toPublicUser(usuario),
    ...tokens,
  };
};

exports.login = async (payload, req) => {
  const email = normalizeEmail(payload.email);
  const senha = payload.senha || payload.password;

  if (!email || !senha) {
    throw new AppError(400, 'email and senha are required');
  }

  const usuario = await db.Usuario.findOne({ where: { email } });

  if (!usuario || !(await comparePassword(senha, usuario.senha_hash))) {
    throw new AppError(401, 'invalid email or senha');
  }

  if (!usuario.ativo) {
    throw new AppError(403, 'user is inactive');
  }

  const now = new Date();
  await usuario.update({
    ultimo_login_em: now,
    updated_at: now,
  });

  const tokens = await createTokenPair(usuario, req);

  return {
    user: toPublicUser(usuario),
    ...tokens,
  };
};

exports.refresh = async (refreshToken, req) => {
  if (!refreshToken) {
    throw new AppError(401, 'refreshToken is required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'invalid refresh token');
  }

  const session = await db.SessaoUsuario.findByPk(payload.jti, {
    include: [{ model: db.Usuario, as: 'usuario' }],
  });

  if (!session || session.revogado_em || session.expira_em < new Date()) {
    throw new AppError(401, 'refresh session expired');
  }

  if (session.refresh_token_hash !== hashToken(refreshToken)) {
    throw new AppError(401, 'invalid refresh session');
  }

  const usuario = session.usuario;

  if (!usuario || !usuario.ativo) {
    throw new AppError(403, 'user is inactive');
  }

  await session.update({ revogado_em: new Date(), updated_at: new Date() });
  const tokens = await createTokenPair(usuario, req);

  return {
    user: toPublicUser(usuario),
    ...tokens,
  };
};

exports.logout = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const session = await db.SessaoUsuario.findByPk(payload.jti);
    if (session && !session.revogado_em) {
      await session.update({ revogado_em: new Date(), updated_at: new Date() });
    }
  } catch {
    // Logout deve ser idempotente mesmo se o token já estiver inválido.
  }
};

exports.me = async (usuarioId) => {
  const usuario = await db.Usuario.findByPk(usuarioId);

  if (!usuario || !usuario.ativo) {
    throw new AppError(401, 'unauthenticated');
  }

  return toPublicUser(usuario);
};

exports.toPublicUser = toPublicUser;
