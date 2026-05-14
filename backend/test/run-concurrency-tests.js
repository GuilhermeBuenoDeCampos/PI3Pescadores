const assert = require('node:assert/strict');
const path = require('node:path');

const loadEnv = require('../src/config/loadEnv');

loadEnv(path.resolve(__dirname, '../.env'), { override: true });

const db = require('../src/database/models');
const produtoService = require('../src/services/produtoService');

async function createTemporaryProduct() {
  const now = new Date();
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const categoria = await db.Categoria.create({
    nome: `Categoria concorrencia ${suffix}`,
    descricao: 'Criada por teste concorrente automatizado',
    id_categoria_pai: null,
    criado_em: now,
    atualizado_em: now,
  });

  const produto = await db.Produto.create({
    nome: `Produto concorrencia ${suffix}`,
    descricao: 'Criado por teste concorrente automatizado',
    preco_custo: '1.00',
    preco_venda: '2.00',
    peso: null,
    altura: null,
    largura: null,
    profundidade: null,
    id_categoria: categoria.id,
    ativo: true,
    criado_em: now,
    atualizado_em: now,
  });

  await db.EstoqueMovimentacao.create({
    id_produto: produto.id,
    tipo: 'entrada',
    quantidade: 1,
    motivo: 'compra',
    created_at: now,
  });

  return { categoria, produto };
}

async function calculateStock(productId) {
  const movimentacoes = await db.EstoqueMovimentacao.findAll({
    where: { id_produto: productId },
    attributes: ['tipo', 'quantidade'],
  });

  return movimentacoes.reduce((total, movimentacao) => {
    const quantidade = Number(movimentacao.quantidade) || 0;
    return movimentacao.tipo === 'entrada' ? total + quantidade : total - quantidade;
  }, 0);
}

async function cleanup({ categoria, produto }) {
  if (produto) {
    await db.Produto.destroy({ where: { id: produto.id } });
  }

  if (categoria) {
    await db.Categoria.destroy({ where: { id: categoria.id } });
  }
}

async function run() {
  await db.sequelize.authenticate();

  const fixture = await createTemporaryProduct();

  try {
    const attempts = await Promise.allSettled([
      produtoService.registrarMovimentacao(fixture.produto.id, {
        tipo: 'saida',
        quantidade: 1,
        motivo: 'venda',
      }),
      produtoService.registrarMovimentacao(fixture.produto.id, {
        tipo: 'saida',
        quantidade: 1,
        motivo: 'venda',
      }),
    ]);

    const fulfilled = attempts.filter((attempt) => attempt.status === 'fulfilled');
    const rejected = attempts.filter((attempt) => attempt.status === 'rejected');
    const estoqueFinal = await calculateStock(fixture.produto.id);

    assert.equal(fulfilled.length, 1, 'only one concurrent stock output should succeed');
    assert.equal(rejected.length, 1, 'one concurrent stock output should be rejected');
    assert.match(rejected[0].reason.message, /insufficient stock/);
    assert.equal(estoqueFinal, 0, 'stock should never become negative');

    console.log('✓ concurrent stock outputs are serialized and never go negative');
  } finally {
    await cleanup(fixture);
    await db.sequelize.close();
  }
}

run().catch(async (error) => {
  console.error('✗ concurrency test failed');
  console.error(error);
  try {
    await db.sequelize.close();
  } catch (closeError) {
    console.error(closeError);
  }
  process.exitCode = 1;
});
