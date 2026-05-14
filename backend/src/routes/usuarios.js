const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();
const adminOnly = [authenticate, authorize('administrador')];

router.get('/', adminOnly, usuarioController.listar);
router.patch('/:id/tipo', adminOnly, usuarioController.atualizarTipo);
router.patch('/:id/status', adminOnly, usuarioController.atualizarStatus);

module.exports = router;
