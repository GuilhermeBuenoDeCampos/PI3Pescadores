const { Router } = require('express');
const categoriasRoutes = require('./categorias');
const produtosRoutes = require('./produtos');

const router = Router();

router.use('/categorias', categoriasRoutes);
router.use('/produtos', produtosRoutes);

module.exports = router;
