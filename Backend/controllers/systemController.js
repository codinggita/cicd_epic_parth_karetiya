// ─────────────────────────────────────────────────────────────────────────────
//  System Controller – Health, info, version, uptime, status
// ─────────────────────────────────────────────────────────────────────────────
const asyncHandler = require('../middleware/asyncHandler');
const os = require('os');
const mongoose = require('mongoose');

// GET /api/v1/health
exports.health = asyncHandler(async (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date(), uptime: process.uptime() });
});

// GET /api/v1/system/info
exports.info = asyncHandler(async (req, res) => {
  res.json({ success: true, info: { name: 'CI/CD Platform API', version: '2.0.0', node: process.version, platform: os.platform(), arch: os.arch(), hostname: os.hostname() } });
});

// GET /api/v1/system/version
exports.version = asyncHandler(async (req, res) => {
  res.json({ success: true, version: '2.0.0', api: 'v1', node: process.version });
});

// GET /api/v1/system/uptime
exports.uptime = asyncHandler(async (req, res) => {
  res.json({ success: true, uptime: { process: process.uptime(), system: os.uptime(), startedAt: new Date(Date.now() - process.uptime() * 1000) } });
});

// GET /api/v1/system/config
exports.config = asyncHandler(async (req, res) => {
  res.json({ success: true, config: { port: process.env.PORT, environment: process.env.NODE_ENV, rateLimitMax: process.env.RATE_LIMIT_MAX || 100, apiVersion: 'v1' } });
});

// GET /api/v1/system/status
exports.status = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ success: true, status: { api: 'operational', database: states[dbState] || 'unknown', uptime: process.uptime() } });
});

// GET /api/v1/system/memory
exports.memory = asyncHandler(async (req, res) => {
  const mem = process.memoryUsage();
  res.json({ success: true, memory: { rss: mem.rss, heapTotal: mem.heapTotal, heapUsed: mem.heapUsed, external: mem.external, systemTotal: os.totalmem(), systemFree: os.freemem() } });
});

// GET /api/v1/system/storage
exports.storage = asyncHandler(async (req, res) => {
  let dbStats = {};
  try { dbStats = await mongoose.connection.db.stats(); } catch (e) { dbStats = { error: e.message }; }
  res.json({ success: true, storage: dbStats });
});

// GET /api/v1/system/connections
exports.connections = asyncHandler(async (req, res) => {
  let serverStatus = {};
  try { serverStatus = await mongoose.connection.db.admin().serverStatus(); } catch (e) { serverStatus = { error: e.message }; }
  res.json({ success: true, connections: { mongodb: serverStatus.connections || {}, readyState: mongoose.connection.readyState } });
});

// GET /api/v1/system/environment
exports.environment = asyncHandler(async (req, res) => {
  res.json({ success: true, environment: { nodeEnv: process.env.NODE_ENV, nodeVersion: process.version, platform: os.platform(), arch: os.arch(), cpus: os.cpus().length, totalMemory: os.totalmem() } });
});
