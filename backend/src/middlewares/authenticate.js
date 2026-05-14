const AppError = require('./appError');
const jwt = require('../utils/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError(401, 'Authentication token is required'));
  }

  try {
    req.user = jwt.verify(token);
    return next();
  } catch (error) {
    return next(error);
  }
};
