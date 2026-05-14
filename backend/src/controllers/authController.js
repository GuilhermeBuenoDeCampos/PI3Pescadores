const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  res.status(201).json({ data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  res.json({ data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken, req);
  res.json({ data: result });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.json({ message: 'Logged out successfully' });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json({ data: user });
});
