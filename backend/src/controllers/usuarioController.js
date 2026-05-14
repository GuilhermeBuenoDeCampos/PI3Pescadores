const asyncHandler = require('../utils/asyncHandler');
const usuarioService = require('../services/usuarioService');

exports.listar = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listarUsuarios();
  res.json({ data: usuarios });
});

exports.atualizarTipo = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.atualizarTipoUsuario(req.params.id, req.body.tipo_usuario);
  res.json({ data: usuario });
});

exports.atualizarStatus = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.atualizarStatusUsuario(req.params.id, req.body.ativo);
  res.json({ data: usuario });
});
