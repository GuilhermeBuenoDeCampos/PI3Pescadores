'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const agora = new Date();

    await queryInterface.bulkDelete('estoque_movimentacoes', null, {});
    await queryInterface.bulkDelete('produto_imagens', null, {});
    await queryInterface.bulkDelete('produto', null, {});
    await queryInterface.bulkDelete('categoria', null, {});

    await queryInterface.bulkInsert('categoria', [
      {
        id: 1,
        nome: 'Pesca',
        descricao: 'Categoria raiz de itens para pesca',
        id_categoria_pai: null,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 2,
        nome: 'Vestuário',
        descricao: 'Categoria raiz de vestuário esportivo',
        id_categoria_pai: null,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 3,
        nome: 'Vara de Pesca',
        descricao: 'Subcategoria de varas',
        id_categoria_pai: 1,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 4,
        nome: 'Molinete',
        descricao: 'Subcategoria de molinetes',
        id_categoria_pai: 1,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 5,
        nome: 'Camisetas UV',
        descricao: 'Subcategoria de camisetas para sol forte',
        id_categoria_pai: 2,
        criado_em: agora,
        atualizado_em: agora,
      },
    ], {});

    await queryInterface.bulkInsert('produto', [
      {
        id: 1,
        nome: 'Vara Carbon Pro 2.10m',
        descricao: 'Vara leve para pesca em rios e lagos',
        preco_custo: 120.00,
        preco_venda: 199.90,
        peso: 0.250,
        altura: 0.050,
        largura: 0.050,
        profundidade: 2.100,
        id_categoria: 3,
        ativo: true,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 2,
        nome: 'Molinete Ocean 4000',
        descricao: 'Molinete com carretel de alumínio',
        preco_custo: 180.00,
        preco_venda: 289.90,
        peso: 0.380,
        altura: 0.120,
        largura: 0.110,
        profundidade: 0.090,
        id_categoria: 4,
        ativo: true,
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        id: 3,
        nome: 'Camiseta UV Pescador Azul',
        descricao: 'Proteção solar UV50+ com secagem rápida',
        preco_custo: 35.00,
        preco_venda: 79.90,
        peso: 0.200,
        altura: 0.030,
        largura: 0.250,
        profundidade: 0.300,
        id_categoria: 5,
        ativo: true,
        criado_em: agora,
        atualizado_em: agora,
      },
    ], {});

    await queryInterface.bulkInsert('produto_imagens', [
      {
        id: 1,
        id_produto: 1,
        url: 'https://picsum.photos/seed/produto-1/800/600',
        criado_em: agora,
      },
      {
        id: 2,
        id_produto: 2,
        url: 'https://picsum.photos/seed/produto-2/800/600',
        criado_em: agora,
      },
      {
        id: 3,
        id_produto: 3,
        url: 'https://picsum.photos/seed/produto-3/800/600',
        criado_em: agora,
      },
    ], {});

    await queryInterface.bulkInsert('estoque_movimentacoes', [
      {
        id: 1,
        id_produto: 1,
        tipo: 'entrada',
        quantidade: 30,
        motivo: 'compra',
        created_at: agora,
      },
      {
        id: 2,
        id_produto: 1,
        tipo: 'saida',
        quantidade: 4,
        motivo: 'venda',
        created_at: agora,
      },
      {
        id: 3,
        id_produto: 2,
        tipo: 'entrada',
        quantidade: 18,
        motivo: 'compra',
        created_at: agora,
      },
      {
        id: 4,
        id_produto: 3,
        tipo: 'entrada',
        quantidade: 50,
        motivo: 'compra',
        created_at: agora,
      },
      {
        id: 5,
        id_produto: 3,
        tipo: 'saida',
        quantidade: 7,
        motivo: 'venda',
        created_at: agora,
      },
      {
        id: 6,
        id_produto: 2,
        tipo: 'entrada',
        quantidade: 2,
        motivo: 'ajuste',
        created_at: agora,
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('estoque_movimentacoes', null, {});
    await queryInterface.bulkDelete('produto_imagens', null, {});
    await queryInterface.bulkDelete('produto', null, {});
    await queryInterface.bulkDelete('categoria', null, {});
  },
};