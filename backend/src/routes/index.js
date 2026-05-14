const { Router } = require('express');
const authRoutes = require('./auth');
const categoriasRoutes = require('./categorias');
const produtosRoutes = require('./produtos');
const auditoriaRoutes = require('./auditoria');
const usuariosRoutes = require('./usuarios');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/produtos', produtosRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
