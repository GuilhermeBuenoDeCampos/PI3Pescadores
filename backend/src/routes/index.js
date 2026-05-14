const { Router } = require('express');
const categoriasRoutes = require('./categorias');
const produtosRoutes = require('./produtos');
const auditoriaRoutes = require('./auditoria');
const authRoutes = require('./auth');

const router = Router();

router.use('/categorias', categoriasRoutes);
router.use('/produtos', produtosRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/auth', authRoutes);

module.exports = router;
