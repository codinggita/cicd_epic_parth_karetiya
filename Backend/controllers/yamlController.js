// ─────────────────────────────────────────────────────────────────────────────
//  YAML Controller – Validate, lint, format, templates, convert
// ─────────────────────────────────────────────────────────────────────────────
const yaml = require('js-yaml');
const Workflow = require('../models/Workflow');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/v1/yaml/validate
exports.validateYaml = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) { res.status(400); throw new Error('YAML content required'); }
  try {
    const parsed = yaml.load(content);
    res.json({ success: true, valid: true, parsed });
  } catch (e) {
    res.json({ success: true, valid: false, error: e.message, line: e.mark?.line, column: e.mark?.column });
  }
});

// POST /api/v1/yaml/lint
exports.lintYaml = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) { res.status(400); throw new Error('YAML content required'); }
  const warnings = [];
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('\t')) warnings.push({ line: i + 1, message: 'Tabs found – use spaces' });
    if (line.length > 120) warnings.push({ line: i + 1, message: 'Line exceeds 120 characters' });
    if (line.endsWith(' ')) warnings.push({ line: i + 1, message: 'Trailing whitespace' });
  });
  try { yaml.load(content); } catch (e) { warnings.push({ line: e.mark?.line, message: `Syntax: ${e.message}` }); }
  res.json({ success: true, warnings, warningCount: warnings.length, clean: warnings.length === 0 });
});

// POST /api/v1/yaml/format
exports.formatYaml = asyncHandler(async (req, res) => {
  const { content, indent } = req.body;
  if (!content) { res.status(400); throw new Error('YAML content required'); }
  try {
    const parsed = yaml.load(content);
    const formatted = yaml.dump(parsed, { indent: indent || 2, lineWidth: 120, noRefs: true });
    res.json({ success: true, formatted });
  } catch (e) { res.status(400); throw new Error(`Invalid YAML: ${e.message}`); }
});

const makeTemplateHandler = (platform) => asyncHandler(async (req, res) => {
  const workflows = await Workflow.find({ platform, status: 'active', content: { $ne: '' } }).select('name content tags description').limit(20);
  res.json({ success: true, platform, count: workflows.length, templates: workflows });
});

// GET /api/v1/yaml/templates
exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await Workflow.find({ status: 'active', content: { $ne: '' } }).select('name content tags platform').limit(50);
  res.json({ success: true, count: templates.length, templates });
});

exports.getK8sTemplates = makeTemplateHandler('other'); // K8s yamls
exports.getDockerTemplates = makeTemplateHandler('other');
exports.getGithubActionsTemplates = makeTemplateHandler('github-actions');
exports.getGitlabCITemplates = makeTemplateHandler('gitlab-ci');
exports.getJenkinsTemplates = makeTemplateHandler('jenkins');

// POST /api/v1/yaml/compare
exports.compareYaml = asyncHandler(async (req, res) => {
  const { yaml1, yaml2 } = req.body;
  if (!yaml1 || !yaml2) { res.status(400); throw new Error('Both yaml1 and yaml2 are required'); }
  try {
    const obj1 = yaml.load(yaml1);
    const obj2 = yaml.load(yaml2);
    const diff = findDifferences(obj1, obj2);
    res.json({ success: true, identical: diff.length === 0, differences: diff });
  } catch (e) { res.status(400); throw new Error(`Parse error: ${e.message}`); }
});

// POST /api/v1/yaml/merge
exports.mergeYaml = asyncHandler(async (req, res) => {
  const { base, override } = req.body;
  if (!base || !override) { res.status(400); throw new Error('Both base and override are required'); }
  try {
    const baseObj = yaml.load(base);
    const overrideObj = yaml.load(override);
    const merged = deepMerge(baseObj, overrideObj);
    res.json({ success: true, merged: yaml.dump(merged, { indent: 2 }), mergedObject: merged });
  } catch (e) { res.status(400); throw new Error(`Parse error: ${e.message}`); }
});

// GET /api/v1/yaml/examples
exports.getExamples = asyncHandler(async (req, res) => {
  const examples = [
    { name: 'GitHub Actions CI', content: 'name: CI\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test' },
    { name: 'Docker Compose', content: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production' },
    { name: 'K8s Deployment', content: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: myapp\n  template:\n    metadata:\n      labels:\n        app: myapp\n    spec:\n      containers:\n        - name: app\n          image: myapp:latest\n          ports:\n            - containerPort: 3000' },
  ];
  res.json({ success: true, examples });
});

// POST /api/v1/yaml/convert/json
exports.yamlToJson = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) { res.status(400); throw new Error('YAML content required'); }
  try {
    const parsed = yaml.load(content);
    res.json({ success: true, json: parsed, jsonString: JSON.stringify(parsed, null, 2) });
  } catch (e) { res.status(400); throw new Error(`Invalid YAML: ${e.message}`); }
});

// POST /api/v1/yaml/convert/yaml
exports.jsonToYaml = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) { res.status(400); throw new Error('JSON content required'); }
  try {
    const obj = typeof content === 'string' ? JSON.parse(content) : content;
    const yamlStr = yaml.dump(obj, { indent: 2 });
    res.json({ success: true, yaml: yamlStr });
  } catch (e) { res.status(400); throw new Error(`Invalid JSON: ${e.message}`); }
});

// GET /api/v1/yaml/best-practices
exports.bestPractices = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    bestPractices: [
      { rule: 'Use 2 spaces for indentation', severity: 'high' },
      { rule: 'Always quote strings with special characters', severity: 'high' },
      { rule: 'Use anchors and aliases to avoid repetition', severity: 'medium' },
      { rule: 'Add comments to explain complex configurations', severity: 'medium' },
      { rule: 'Keep lines under 120 characters', severity: 'low' },
      { rule: 'Use consistent key ordering', severity: 'low' },
      { rule: 'Validate YAML before deploying', severity: 'critical' },
      { rule: 'Never commit secrets in YAML files', severity: 'critical' },
      { rule: 'Use multi-line strings with | or > for readability', severity: 'medium' },
      { rule: 'Version your YAML configurations', severity: 'high' },
    ],
  });
});

// Utility: find differences between two objects
function findDifferences(obj1, obj2, path = '') {
  const diffs = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    if (!(key in (obj1 || {}))) { diffs.push({ path: fullPath, type: 'added', value: obj2[key] }); }
    else if (!(key in (obj2 || {}))) { diffs.push({ path: fullPath, type: 'removed', value: obj1[key] }); }
    else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] && obj2[key]) {
      diffs.push(...findDifferences(obj1[key], obj2[key], fullPath));
    } else if (obj1[key] !== obj2[key]) {
      diffs.push({ path: fullPath, type: 'changed', from: obj1[key], to: obj2[key] });
    }
  }
  return diffs;
}

// Utility: deep merge
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
      result[key] = deepMerge(target[key], source[key]);
    } else { result[key] = source[key]; }
  }
  return result;
}
