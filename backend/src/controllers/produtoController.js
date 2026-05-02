const asyncHandler = require('../utils/asyncHandler');
const produtoService = require('../services/produtoService');

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

exports.listar = asyncHandler(async (req, res) => {
  const produtos = await produtoService.listarProdutos(req.query);

  res.json({
    data: produtos,
  });
});

exports.detalhar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const produto = await produtoService.buscarProdutoPorId(id);

  res.json({
    data: produto,
  });
});

exports.criar = asyncHandler(async (req, res) => {
  const fileUrls = (req.files || []).map(file => `/uploads/${file.filename}`);
  const payload = {
    ...req.body,
    imagens: fileUrls
  };
  const produto = await produtoService.criarProduto(payload);

  res.status(201).json({
    data: produto,
  });
});

exports.adicionarImagem = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const imagem = await produtoService.adicionarImagem(id, req.body);

  res.status(201).json({
    data: imagem,
  });
});

exports.registrarMovimentacao = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const movimentacao = await produtoService.registrarMovimentacao(id, req.body);

  res.status(201).json({
    data: movimentacao,
  });
});
