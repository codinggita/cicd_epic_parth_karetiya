// ─────────────────────────────────────────────────────────────────────────────
//  Workflow Controller – Full CRUD + special operations
//  20 endpoints for CI/CD workflow management
// ─────────────────────────────────────────────────────────────────────────────
const Workflow = require('../models/Workflow');
const asyncHandler = require('../middleware/asyncHandler');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/v1/workflows ───────────────────────────────────────────────────
// Fetch all workflows with pagination, sorting, filtering
exports.getAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';

  const filter = { status: { $ne: 'archived' } };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.platform) filter.platform = req.query.platform;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.tag) filter.tags = { $in: [req.query.tag] };
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [workflows, total] = await Promise.all([
    Workflow.find(filter).sort(sort).skip(skip).limit(limit),
    Workflow.countDocuments(filter),
  ]);

  res.json({
    success: true, count: workflows.length, total, page,
    totalPages: Math.ceil(total / limit), data: workflows,
  });
});

// ── GET /api/v1/workflows/:id ───────────────────────────────────────────────
exports.getById = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, data: wf });
});

// ── POST /api/v1/workflows ──────────────────────────────────────────────────
exports.create = asyncHandler(async (req, res) => {
  const wf = await Workflow.create(req.body);
  res.status(201).json({ success: true, data: wf });
});

// ── PUT /api/v1/workflows/:id ───────────────────────────────────────────────
exports.replace = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true, overwrite: true,
  });
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, data: wf });
});

// ── PATCH /api/v1/workflows/:id/content ─────────────────────────────────────
exports.updateContent = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id);
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }

  // Save current version before updating
  wf.versions.push({
    versionNumber: wf.versions.length + 1,
    content: wf.content,
    message: req.body.message || 'Content update',
  });

  wf.content = req.body.content || wf.content;
  if (req.body.steps) wf.steps = req.body.steps;
  await wf.save();

  res.json({ success: true, data: wf });
});

// ── DELETE /api/v1/workflows/:id ────────────────────────────────────────────
exports.remove = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndDelete(req.params.id);
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, message: 'Workflow deleted', data: wf });
});

// ── GET /api/v1/workflows/random ────────────────────────────────────────────
exports.getRandom = asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count, 10) || 1;
  const workflows = await Workflow.aggregate([
    { $match: { status: 'active' } },
    { $sample: { size: count } },
  ]);
  res.json({ success: true, count: workflows.length, data: workflows });
});

// ── GET /api/v1/workflows/latest ────────────────────────────────────────────
exports.getLatest = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const workflows = await Workflow.find({ status: 'active' })
    .sort({ createdAt: -1 }).limit(limit);
  res.json({ success: true, count: workflows.length, data: workflows });
});

// ── GET /api/v1/workflows/trending ──────────────────────────────────────────
exports.getTrending = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const workflows = await Workflow.find({
    status: 'active', updatedAt: { $gte: oneWeekAgo },
  }).sort({ views: -1, likes: -1 }).limit(limit);
  res.json({ success: true, count: workflows.length, data: workflows });
});

// ── GET /api/v1/workflows/recommended ───────────────────────────────────────
exports.getRecommended = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const workflows = await Workflow.find({ status: 'active' })
    .sort({ likes: -1, successRate: -1 }).limit(limit);
  res.json({ success: true, count: workflows.length, data: workflows });
});

// ── GET /api/v1/workflows/popular ───────────────────────────────────────────
exports.getPopular = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const workflows = await Workflow.find({ status: 'active' })
    .sort({ views: -1, clones: -1 }).limit(limit);
  res.json({ success: true, count: workflows.length, data: workflows });
});

// ── GET /api/v1/workflows/history/:id ───────────────────────────────────────
exports.getHistory = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id).select('name runs');
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, workflowName: wf.name, history: wf.runs });
});

// ── PATCH /api/v1/workflows/:id/archive ─────────────────────────────────────
exports.archive = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndUpdate(
    req.params.id, { status: 'archived' }, { new: true }
  );
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, message: 'Workflow archived', data: wf });
});

// ── PATCH /api/v1/workflows/:id/restore ─────────────────────────────────────
exports.restore = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndUpdate(
    req.params.id, { status: 'active' }, { new: true }
  );
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, message: 'Workflow restored', data: wf });
});

// ── GET /api/v1/workflows/:id/versions ──────────────────────────────────────
exports.getVersions = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id).select('name versions');
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, workflowName: wf.name, versions: wf.versions });
});

// ── POST /api/v1/workflows/:id/clone ────────────────────────────────────────
exports.clone = asyncHandler(async (req, res) => {
  const original = await Workflow.findById(req.params.id);
  if (!original) { res.status(404); throw new Error('Workflow not found'); }

  const cloneData = original.toObject();
  delete cloneData._id;
  delete cloneData.createdAt;
  delete cloneData.updatedAt;
  cloneData.name = `${original.name} (Clone)`;
  cloneData.views = 0; cloneData.likes = 0;
  cloneData.bookmarks = 0; cloneData.clones = 0;
  cloneData.runs = []; cloneData.versions = []; cloneData.logs = [];

  const cloned = await Workflow.create(cloneData);
  await Workflow.findByIdAndUpdate(req.params.id, { $inc: { clones: 1 } });

  res.status(201).json({ success: true, message: 'Workflow cloned', data: cloned });
});

// ── GET /api/v1/workflows/:id/logs ──────────────────────────────────────────
exports.getLogs = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id).select('name logs');
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, workflowName: wf.name, logs: wf.logs });
});

// ── GET /api/v1/workflows/:id/metrics ───────────────────────────────────────
exports.getMetrics = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id)
    .select('name views likes bookmarks clones runCount successRate avgBuildTime');
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, data: wf });
});

// ── POST /api/v1/workflows/:id/run ──────────────────────────────────────────
exports.triggerRun = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id);
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }

  const run = {
    runId: uuidv4(),
    status: 'running',
    startedAt: new Date(),
    triggeredBy: req.body.triggeredBy || 'manual',
    logs: [`[${new Date().toISOString()}] Run started`],
  };

  wf.runs.push(run);
  wf.runCount += 1;
  wf.status = 'running';
  wf.logs.push({ level: 'info', message: `Run ${run.runId} triggered` });
  await wf.save();

  // Simulate async completion after 3 seconds
  setTimeout(async () => {
    try {
      const success = Math.random() > 0.15;
      const doc = await Workflow.findById(wf._id);
      if (!doc) return;
      const runEntry = doc.runs.find((r) => r.runId === run.runId);
      if (runEntry) {
        runEntry.status = success ? 'success' : 'failed';
        runEntry.completedAt = new Date();
        runEntry.duration = Math.floor((Date.now() - runEntry.startedAt.getTime()) / 1000);
        runEntry.logs.push(`[${new Date().toISOString()}] Run ${success ? 'completed successfully' : 'failed'}`);
      }
      doc.status = 'active';
      const successRuns = doc.runs.filter((r) => r.status === 'success').length;
      doc.successRate = Math.round((successRuns / doc.runs.length) * 100);
      const durations = doc.runs.filter((r) => r.duration).map((r) => r.duration);
      doc.avgBuildTime = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
      doc.logs.push({ level: success ? 'info' : 'error', message: `Run ${run.runId} ${success ? 'succeeded' : 'failed'}` });
      await doc.save();
    } catch (e) {
      console.error('Run simulation error:', e.message);
    }
  }, 3000);

  res.status(202).json({ success: true, message: 'Workflow run triggered', runId: run.runId, data: wf });
});

// ── POST /api/v1/workflows/:id/cancel ───────────────────────────────────────
exports.cancelRun = asyncHandler(async (req, res) => {
  const wf = await Workflow.findById(req.params.id);
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }

  const runningRun = wf.runs.find((r) => r.status === 'running');
  if (!runningRun) {
    res.status(400);
    throw new Error('No running workflow to cancel');
  }

  runningRun.status = 'cancelled';
  runningRun.completedAt = new Date();
  runningRun.logs.push(`[${new Date().toISOString()}] Run cancelled`);
  wf.status = 'active';
  wf.logs.push({ level: 'warn', message: `Run ${runningRun.runId} cancelled` });
  await wf.save();

  res.json({ success: true, message: 'Run cancelled', data: wf });
});

// ── POST /api/v1/workflows/:id/bookmark ─────────────────────────────────────
exports.bookmark = asyncHandler(async (req, res) => {
  const wf = await Workflow.findByIdAndUpdate(
    req.params.id, { $inc: { bookmarks: 1 } }, { new: true }
  );
  if (!wf) { res.status(404); throw new Error('Workflow not found'); }
  res.json({ success: true, message: 'Workflow bookmarked', bookmarks: wf.bookmarks });
});
