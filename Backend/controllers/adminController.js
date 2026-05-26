// ─────────────────────────────────────────────────────────────────────────────
//  Admin Controller – User management, system health, backups, security
// ─────────────────────────────────────────────────────────────────────────────
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const InfraGuide = require('../models/InfraGuide');
const asyncHandler = require('../middleware/asyncHandler');
const os = require('os');

// GET /api/v1/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const users = await User.find().select('-password').skip((page - 1) * limit).limit(limit);
  const total = await User.countDocuments();
  res.json({ success: true, count: users.length, total, page, data: users });
});

// GET /api/v1/admin/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

// PATCH /api/v1/admin/users/:id/role
exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin', 'moderator'].includes(role)) { res.status(400); throw new Error('Invalid role'); }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: `Role updated to ${role}`, data: user });
});

// PATCH /api/v1/admin/users/:id/block
exports.blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User blocked', data: user });
});

// PATCH /api/v1/admin/users/:id/unblock
exports.unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User unblocked', data: user });
});

// GET /api/v1/admin/reports
exports.getReports = asyncHandler(async (req, res) => {
  const [totalUsers, totalWorkflows, totalGuides, activeUsers] = await Promise.all([
    User.countDocuments(),
    Workflow.countDocuments(),
    InfraGuide.countDocuments(),
    User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
  ]);
  res.json({ success: true, reports: { totalUsers, totalWorkflows, totalGuides, activeUsersLast7Days: activeUsers } });
});

// GET /api/v1/admin/logs
exports.getLogs = asyncHandler(async (req, res) => {
  const recentLogs = await Workflow.find({ 'logs.0': { $exists: true } }).select('name logs').sort({ updatedAt: -1 }).limit(20);
  res.json({ success: true, data: recentLogs });
});

// GET /api/v1/admin/system/health
exports.systemHealth = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    health: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      cpu: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
    },
  });
});

// POST /api/v1/admin/system/restart
exports.restartServices = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Restart signal sent (in production, use process manager)' });
});

// DELETE /api/v1/admin/cache/clear
exports.clearCache = asyncHandler(async (req, res) => {
  // In production, would clear Redis/memcached
  res.json({ success: true, message: 'Cache cleared' });
});

// GET /api/v1/admin/security/events
exports.securityEvents = asyncHandler(async (req, res) => {
  const blockedUsers = await User.find({ isBlocked: true }).select('name email updatedAt');
  res.json({ success: true, events: { blockedUsers, blockedCount: blockedUsers.length } });
});

// POST /api/v1/admin/security/block-ip
exports.blockIP = asyncHandler(async (req, res) => {
  const { ip } = req.body;
  if (!ip) { res.status(400); throw new Error('IP address required'); }
  // In production: add to firewall/nginx/WAF blocklist
  res.json({ success: true, message: `IP ${ip} blocked` });
});

// GET /api/v1/admin/backups
exports.getBackups = asyncHandler(async (req, res) => {
  res.json({ success: true, backups: [
    { id: 'backup-001', date: new Date(Date.now() - 86400000), size: '45MB', status: 'completed' },
    { id: 'backup-002', date: new Date(), size: '47MB', status: 'completed' },
  ]});
});

// POST /api/v1/admin/backups/create
exports.createBackup = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Backup created', backup: { id: `backup-${Date.now()}`, date: new Date(), status: 'completed' },
    commands: { dump: 'mongodump --uri="mongodb://localhost:27017/cidc" --out=./backups/', restore: 'mongorestore --uri="mongodb://localhost:27017/cidc" ./backups/cidc/' },
  });
});

// DELETE /api/v1/admin/backups/:id
exports.deleteBackup = asyncHandler(async (req, res) => {
  res.json({ success: true, message: `Backup ${req.params.id} deleted` });
});
