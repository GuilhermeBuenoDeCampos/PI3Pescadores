const { Router } = require('express');
const produtoController = require('../controllers/produtoController');

const router = Router();

router.get('/', produtoController.listar);
router.get('/:id', produtoController.detalhar);
router.post('/', produtoController.criar);
router.post('/:id/imagens', produtoController.adicionarImagem);
router.post('/:id/movimentacoes', produtoController.registrarMovimentacao);

module.exports = router;
