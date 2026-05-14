const { Router } = require('express');
const categoriaController = require('../controllers/categoriaController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();
const canManageCatalog = [authenticate, authorize('administrador', 'vendedor')];

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.detalhar);
router.post('/', canManageCatalog, categoriaController.criar);

module.exports = router;
