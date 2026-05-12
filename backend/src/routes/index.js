const { Router } = require('express');
const categoriasRoutes = require('./categorias');
const produtosRoutes = require('./produtos');
const auditoriaRoutes = require('./auditoria');

const router = Router();

router.use('/categorias', categoriasRoutes);
router.use('/produtos', produtosRoutes);
router.use('/auditoria', auditoriaRoutes);

module.exports = router;
