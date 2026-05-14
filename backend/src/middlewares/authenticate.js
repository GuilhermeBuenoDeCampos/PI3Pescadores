const db = require('../database/models');
const AppError = require('./appError');
const { verifyAccessToken } = require('../utils/jwt');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'authentication token is required');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'invalid or expired token');
    }

    const usuario = await db.Usuario.findByPk(payload.sub, {
      attributes: ['id', 'nome', 'email', 'tipo_usuario', 'ativo'],
    });

    if (!usuario || !usuario.ativo) {
      throw new AppError(401, 'unauthenticated');
    }

    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
