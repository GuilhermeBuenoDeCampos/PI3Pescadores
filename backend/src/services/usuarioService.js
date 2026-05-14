const db = require('../database/models');
const AppError = require('../middlewares/appError');
const { toPublicUser } = require('./authService');

const ALLOWED_ROLES = new Set(['cliente', 'administrador', 'vendedor']);

exports.listarUsuarios = async () => {
  const usuarios = await db.Usuario.findAll({
    order: [['created_at', 'DESC']],
  });

  return usuarios.map(toPublicUser);
};

exports.atualizarTipoUsuario = async (id, tipoUsuario) => {
  const tipo_usuario = String(tipoUsuario || '').trim().toLowerCase();

  if (!ALLOWED_ROLES.has(tipo_usuario)) {
    throw new AppError(400, 'tipo_usuario must be cliente, administrador or vendedor');
  }

  const usuario = await db.Usuario.findByPk(id);
  if (!usuario) {
    throw new AppError(404, 'Usuario not found');
  }

  await usuario.update({
    tipo_usuario,
    updated_at: new Date(),
  });

  return toPublicUser(usuario);
};

exports.atualizarStatusUsuario = async (id, ativo) => {
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'ativo must be boolean');
  }

  const usuario = await db.Usuario.findByPk(id);
  if (!usuario) {
    throw new AppError(404, 'Usuario not found');
  }

  await usuario.update({
    ativo,
    updated_at: new Date(),
  });

  return toPublicUser(usuario);
};
