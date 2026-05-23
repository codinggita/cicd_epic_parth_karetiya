// ─────────────────────────────────────────────────────────────────────────────
//  Auth Controller – Register, login, logout, profile, password, 2FA
// ─────────────────────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('Email already registered'); }
  
  const user = await User.create({ name, email, password });
  const { token, refreshToken } = authService.generateTokens(user._id);
  
  user.sessions.push(authService.createSession(token, req));
  await user.save();
  
  res.status(201).json({ success: true, token, refreshToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) { res.status(401); throw new Error('Invalid credentials'); }
  if (user.isBlocked) { res.status(403); throw new Error('Account blocked'); }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) { res.status(401); throw new Error('Invalid credentials'); }
  
  const { token, refreshToken } = authService.generateTokens(user._id);
  
  user.sessions.push(authService.createSession(token, req));
  await user.save();
  
  res.json({ success: true, token, refreshToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (req.user && token) {
    req.user.sessions = req.user.sessions.filter(s => s.token !== token);
    await req.user.save();
  }
  res.json({ success: true, message: 'Logged out' });
});

// POST /api/v1/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(400); throw new Error('Refresh token required'); }
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) { res.status(401); throw new Error('User not found'); }
  const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
  res.json({ success: true, token: newToken });
});

// GET /api/v1/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PATCH /api/v1/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (avatar) updates.avatar = avatar;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, data: user });
});

// DELETE /api/v1/auth/profile
exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});

// POST /api/v1/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

// POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No account with that email'); }
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  await user.save();
  res.json({ success: true, message: 'Reset token generated', resetToken });
});

// POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpire');
  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
});

// POST /api/v1/auth/verify-email
exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { isEmailVerified: true }, { new: true });
  res.json({ success: true, message: 'Email verified', data: user });
});

// GET /api/v1/auth/sessions
exports.getSessions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.sessions });
});

// DELETE /api/v1/auth/sessions/:id
exports.removeSession = asyncHandler(async (req, res) => {
  req.user.sessions = req.user.sessions.filter(s => s._id.toString() !== req.params.id);
  await req.user.save();
  res.json({ success: true, message: 'Session removed' });
});

// POST /api/v1/auth/2fa/enable
exports.enable2FA = asyncHandler(async (req, res) => {
  const secret = crypto.randomBytes(20).toString('hex');
  req.user.twoFactorEnabled = true;
  req.user.twoFactorSecret = secret;
  await req.user.save();
  res.json({ success: true, message: '2FA enabled', secret });
});

// POST /api/v1/auth/2fa/disable
exports.disable2FA = asyncHandler(async (req, res) => {
  req.user.twoFactorEnabled = false;
  req.user.twoFactorSecret = undefined;
  await req.user.save();
  res.json({ success: true, message: '2FA disabled' });
});
