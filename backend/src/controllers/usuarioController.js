const asyncHandler = require('../utils/asyncHandler');
const usuarioService = require('../services/usuarioService');

exports.cadastrar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.criarUsuario({
    ...req.body,
    tipo_usuario: 'cliente',
  });

  res.status(201).json({
    data: usuario,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const session = await usuarioService.autenticarUsuario(req.body);

  res.json({
    data: session,
  });
});
