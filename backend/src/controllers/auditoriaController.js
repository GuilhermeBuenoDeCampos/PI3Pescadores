const asyncHandler = require('../utils/asyncHandler');
const produtoService = require('../services/produtoService');
const db = require('../database/models');

// Get 5 random products for audit
exports.getProdutosAleatorios = asyncHandler(async (req, res) => {
  // Get 5 random products
  const produtos = await db.Produto.findAll({
    attributes: ['id', 'nome', 'preco_venda'],
    limit: 5,
    order: db.sequelize.random(),
  });

  // For each product, calculate stock from movements
  const produtosComEstoque = await Promise.all(
    produtos.map(async (p) => {
      const movimentacoes = await db.EstoqueMovimentacao.findAll({
        where: { id_produto: p.id },
        attributes: ['tipo', 'quantidade'],
      });

      let estoque = 0;
      movimentacoes.forEach((mov) => {
        const quantidade = parseInt(mov.quantidade, 10);
        if (mov.tipo === 'entrada') {
          estoque += quantidade;
        } else if (mov.tipo === 'saida') {
          estoque -= quantidade;
        }
      });

      return {
        id: p.id,
        nome: p.nome,
        preco_venda: p.preco_venda,
        quantidade_sistema: Math.max(0, estoque),
      };
    })
  );

  res.json({
    data: produtosComEstoque,
  });
});

// Save audit record
exports.salvarAuditoria = asyncHandler(async (req, res) => {
  const { auditorias } = req.body;

  if (!auditorias || !Array.isArray(auditorias) || auditorias.length === 0) {
    return res.status(400).json({
      error: { message: 'Invalid audit data' },
    });
  }

  const registros = auditorias.map((item) => {
    const diferenca = item.quantidade_fisica - item.quantidade_sistema;
    
    // Calculate accuracy: if sistema=0, check if físico=0 (100%) or físico>0 (0%)
    let acuracidade;
    if (item.quantidade_sistema === 0) {
      acuracidade = item.quantidade_fisica === 0 ? 100 : 0;
    } else {
      acuracidade = ((item.quantidade_sistema - Math.abs(diferenca)) / item.quantidade_sistema) * 100;
    }

    return {
      product_id: item.product_id,
      quantidade_sistema: item.quantidade_sistema,
      quantidade_fisica: item.quantidade_fisica,
      diferenca,
      acuracidade: Math.max(0, Math.min(100, acuracidade)),
      usuario_id: req.user?.id || null,
    };
  });

  const resultado = await db.AuditoriaProduto.bulkCreate(registros);

  res.json({
    message: 'Audit records saved successfully',
    data: resultado,
  });
});

// Get audit history
exports.getHistoricoAuditoria = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await db.AuditoriaProduto.findAndCountAll({
    include: [
      {
        model: db.Produto,
        as: 'produto',
        attributes: ['id', 'nome'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  });
});
