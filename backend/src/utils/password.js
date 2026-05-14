const bcrypt = require('bcrypt');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

exports.hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

exports.comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};
