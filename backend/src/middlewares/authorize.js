const AppError = require('./appError');

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'unauthenticated'));
    }

    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return next(new AppError(403, 'forbidden'));
    }

    return next();
  };
};
