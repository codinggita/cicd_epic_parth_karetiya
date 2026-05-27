// ─────────────────────────────────────────────────────────────────────────────
//  Debug Controller – Troubleshooting guides by platform/technology
// ─────────────────────────────────────────────────────────────────────────────
const InfraGuide = require('../models/InfraGuide');
const asyncHandler = require('../middleware/asyncHandler');

const makeDebugHandler = (topic, label) => asyncHandler(async (req, res) => {
  const data = await InfraGuide.find({
    $or: [
      { type: topic },
      { title: { $regex: topic, $options: 'i' } },
      { description: { $regex: `${topic}.*(?:error|issue|debug|troubleshoot|fix)`, $options: 'i' } },
      { tags: { $in: [topic, 'debug', 'troubleshooting'] } },
    ],
  }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, topic: label, count: data.length, data });
});

exports.commonIssues     = makeDebugHandler('k8s|docker|jenkins|terraform|aws', 'Common Issues');
exports.debugLogs        = makeDebugHandler('logging', 'Debug Logs');
exports.connectivity     = makeDebugHandler('networking', 'Connectivity');
exports.commonErrors     = makeDebugHandler('security|monitoring', 'Common Errors');
exports.k8sDebug         = makeDebugHandler('k8s', 'Kubernetes');
exports.dockerDebug      = makeDebugHandler('docker', 'Docker');
exports.jenkinsDebug     = makeDebugHandler('jenkins', 'Jenkins');
exports.githubActionsDebug = makeDebugHandler('templates', 'GitHub Actions');
exports.gitlabCIDebug    = makeDebugHandler('templates', 'GitLab CI');
exports.terraformDebug   = makeDebugHandler('terraform', 'Terraform');
exports.awsDebug         = makeDebugHandler('aws', 'AWS');
exports.gcpDebug         = makeDebugHandler('gcp', 'GCP');
exports.azureDebug       = makeDebugHandler('azure', 'Azure');
exports.networkDebug     = makeDebugHandler('networking', 'Network');
exports.securityDebug    = makeDebugHandler('security', 'Security');
