// ─────────────────────────────────────────────────────────────────────────────
//  Analytics Controller – Pipeline analytics, metrics, trends
// ─────────────────────────────────────────────────────────────────────────────
const Workflow = require('../models/Workflow');
const InfraGuide = require('../models/InfraGuide');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/v1/analytics/summary
exports.summary = asyncHandler(async (req, res) => {
  const [totalWorkflows, totalGuides, totalRuns, platforms, categories] = await Promise.all([
    Workflow.countDocuments(),
    InfraGuide.countDocuments(),
    Workflow.aggregate([{ $group: { _id: null, total: { $sum: '$runCount' } } }]),
    Workflow.aggregate([{ $group: { _id: '$platform', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Workflow.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({ success: true, summary: { totalWorkflows, totalGuides, totalRuns: totalRuns[0]?.total || 0, platforms, categories } });
});

// GET /api/v1/analytics/failures
exports.failures = asyncHandler(async (req, res) => {
  const wfs = await Workflow.find({ 'runs.status': 'failed' }).select('name runs').limit(20);
  const failures = wfs.map(w => ({ name: w.name, failedRuns: w.runs.filter(r => r.status === 'failed').length, totalRuns: w.runs.length }));
  res.json({ success: true, data: failures });
});

// GET /api/v1/analytics/success-rate
exports.successRate = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $match: { runCount: { $gt: 0 } } },
    { $project: { name: 1, successRate: 1, runCount: 1 } },
    { $sort: { successRate: -1 } },
    { $limit: 20 },
  ]);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/deployments
exports.deployments = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $match: { category: { $in: ['cd', 'deployment', 'ci/cd'] } } },
    { $project: { name: 1, runCount: 1, successRate: 1, avgBuildTime: 1 } },
    { $sort: { runCount: -1 } },
  ]);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/build-times
exports.buildTimes = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $match: { avgBuildTime: { $gt: 0 } } },
    { $project: { name: 1, avgBuildTime: 1, runCount: 1 } },
    { $sort: { avgBuildTime: 1 } },
    { $limit: 20 },
  ]);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/top-tools
exports.topTools = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $group: { _id: '$platform', count: { $sum: 1 }, avgViews: { $avg: '$views' } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/top-errors
exports.topErrors = asyncHandler(async (req, res) => {
  const wfs = await Workflow.find({ 'logs.level': 'error' }).select('name logs');
  const errorMessages = {};
  wfs.forEach(w => w.logs.filter(l => l.level === 'error').forEach(l => {
    errorMessages[l.message] = (errorMessages[l.message] || 0) + 1;
  }));
  const sorted = Object.entries(errorMessages).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([msg, count]) => ({ message: msg, count }));
  res.json({ success: true, data: sorted });
});

// GET /api/v1/analytics/usage
exports.usage = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $group: { _id: null, totalViews: { $sum: '$views' }, totalLikes: { $sum: '$likes' }, totalClones: { $sum: '$clones' }, totalBookmarks: { $sum: '$bookmarks' } } },
  ]);
  res.json({ success: true, data: data[0] || {} });
});

// GET /api/v1/analytics/trending
exports.trending = asyncHandler(async (req, res) => {
  const oneWeek = new Date(Date.now() - 7 * 86400000);
  const data = await Workflow.find({ updatedAt: { $gte: oneWeek }, status: 'active' }).sort({ views: -1 }).limit(10);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/latest
exports.latest = asyncHandler(async (req, res) => {
  const data = await Workflow.find().sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/growth
exports.growth = asyncHandler(async (req, res) => {
  const thirtyDays = new Date(Date.now() - 30 * 86400000);
  const [newWorkflows, newGuides] = await Promise.all([
    Workflow.countDocuments({ createdAt: { $gte: thirtyDays } }),
    InfraGuide.countDocuments({ createdAt: { $gte: thirtyDays } }),
  ]);
  const [totalWf, totalGuides] = await Promise.all([Workflow.countDocuments(), InfraGuide.countDocuments()]);
  res.json({ success: true, last30Days: { newWorkflows, newGuides }, totals: { workflows: totalWf, guides: totalGuides } });
});

// GET /api/v1/analytics/performance
exports.performance = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $match: { runCount: { $gt: 0 } } },
    { $group: { _id: null, avgSuccessRate: { $avg: '$successRate' }, avgBuildTime: { $avg: '$avgBuildTime' }, totalRuns: { $sum: '$runCount' } } },
  ]);
  res.json({ success: true, data: data[0] || {} });
});

// GET /api/v1/analytics/security
exports.security = asyncHandler(async (req, res) => {
  const securityWorkflows = await Workflow.find({ $or: [{ category: 'security' }, { tags: 'security' }] }).select('name successRate runCount');
  res.json({ success: true, count: securityWorkflows.length, data: securityWorkflows });
});

// GET /api/v1/analytics/costs
exports.costs = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $group: { _id: '$platform', totalRuns: { $sum: '$runCount' }, avgBuildTime: { $avg: '$avgBuildTime' } } },
    { $addFields: { estimatedCostUSD: { $multiply: ['$totalRuns', { $divide: ['$avgBuildTime', 60] }, 0.008] } } },
    { $sort: { estimatedCostUSD: -1 } },
  ]);
  res.json({ success: true, data });
});

// GET /api/v1/analytics/cloud-usage
exports.cloudUsage = asyncHandler(async (req, res) => {
  const data = await Workflow.aggregate([
    { $match: { tags: { $in: ['aws', 'gcp', 'azure', 'cloud'] } } },
    { $unwind: '$tags' },
    { $match: { tags: { $in: ['aws', 'gcp', 'azure'] } } },
    { $group: { _id: '$tags', count: { $sum: 1 }, totalRuns: { $sum: '$runCount' } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data });
});
