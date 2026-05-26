// ─────────────────────────────────────────────────────────────────────────────
//  Search Controller
// ─────────────────────────────────────────────────────────────────────────────
const Data = require('../models/Data');
const asyncHandler = require('../middleware/asyncHandler');

exports.globalSearch = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  let query = {};
  if (q) query = { $text: { $search: q } };
  
  const results = await Data.find(query)
    .skip(skip).limit(parseInt(limit));
  const total = await Data.countDocuments(query);
  res.json({ success: true, count: results.length, total, data: results });
});

exports.getAllTags = asyncHandler(async (req, res) => {
  const topics = await Data.distinct('topic');
  res.json({ success: true, data: topics });
});

exports.searchByTag = asyncHandler(async (req, res) => {
  const results = await Data.find({ topic: req.params.tag }).limit(20);
  res.json({ success: true, data: results });
});

exports.popularSearches = asyncHandler(async (req, res) => {
  res.json({ success: true, data: ['github-actions', 'kubernetes', 'docker', 'terraform'] });
});

exports.recentSearches = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.recentSearches || [] });
});

exports.autocomplete = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const results = await Data.find({ topic: { $regex: `^${q}`, $options: 'i' } }).limit(5).select('topic');
  res.json({ success: true, data: results });
});

exports.fuzzySearch = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const results = await Data.find({ instruction: { $regex: q.split('').join('.*'), $options: 'i' } }).limit(10);
  res.json({ success: true, data: results });
});

exports.exactSearch = asyncHandler(async (req, res) => {
  const results = await Data.find({ topic: req.query.q }).limit(10);
  res.json({ success: true, data: results });
});

exports.searchByCategory = asyncHandler(async (req, res) => {
  const results = await Data.find({ difficulty: req.params.name }).limit(10);
  res.json({ success: true, data: results });
});

exports.searchByLanguage = asyncHandler(async (req, res) => {
  const results = await Data.find({ output: { $regex: req.params.lang, $options: 'i' } }).limit(10);
  res.json({ success: true, data: results });
});

exports.searchByTool = asyncHandler(async (req, res) => {
  const results = await Data.find({ topic: req.params.tool }).limit(10);
  res.json({ success: true, data: results });
});

exports.advancedSearch = asyncHandler(async (req, res) => {
  const { q, difficulty, topic } = req.query;
  let query = {};
  if (q) query.$text = { $search: q };
  if (difficulty) query.difficulty = difficulty;
  if (topic) query.topic = topic;
  const results = await Data.find(query).limit(20);
  res.json({ success: true, data: results });
});

exports.suggestions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: ['How to configure Jenkins?', 'Setup Docker Swarm', 'Kubernetes basics'] });
});

exports.searchHistory = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.searchHistory || [] });
});

exports.trendingTopics = asyncHandler(async (req, res) => {
  const trending = await Data.aggregate([{ $group: { _id: '$topic', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
  res.json({ success: true, data: trending });
});

exports.recommended = asyncHandler(async (req, res) => {
  const results = await Data.aggregate([{ $sample: { size: 5 } }]);
  res.json({ success: true, data: results });
});

exports.combinedFilter = asyncHandler(async (req, res) => {
  const { tag, type } = req.query;
  let query = {};
  if (tag) query.topic = tag;
  if (type) query.difficulty = type;
  const results = await Data.find(query).limit(20);
  res.json({ success: true, data: results });
});

exports.searchYaml = asyncHandler(async (req, res) => {
  const results = await Data.find({ output: { $regex: 'yaml', $options: 'i' } }).limit(10);
  res.json({ success: true, data: results });
});

exports.searchSnippets = asyncHandler(async (req, res) => {
  const results = await Data.find({ output: { $regex: '```', $options: 'i' } }).limit(10);
  res.json({ success: true, data: results });
});

exports.searchErrors = asyncHandler(async (req, res) => {
  const q = req.query.q || 'error';
  const results = await Data.find({ instruction: { $regex: q, $options: 'i' } }).limit(10);
  res.json({ success: true, data: results });
});
