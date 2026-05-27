// ─────────────────────────────────────────────────────────────────────────────
//  Infrastructure Controller – K8s, Docker, Helm, Terraform, Cloud guides
// ─────────────────────────────────────────────────────────────────────────────
const InfraGuide = require('../models/InfraGuide');
const asyncHandler = require('../middleware/asyncHandler');

const getGuides = (type) =>
  asyncHandler(async (req, res) => {
    const guides = await InfraGuide.find({ type }).sort({ createdAt: -1 });
    res.json({ success: true, count: guides.length, type, data: guides });
  });

// ── GET /api/v1/infra/k8s ───────────────────────────────────────────────────
exports.getK8sGuides = getGuides('k8s');

// ── GET /api/v1/infra/docker ─────────────────────────────────────────────────
exports.getDockerGuides = getGuides('docker');

// ── GET /api/v1/infra/helm ───────────────────────────────────────────────────
exports.getHelmGuides = getGuides('helm');

// ── GET /api/v1/infra/terraform ──────────────────────────────────────────────
exports.getTerraformGuides = getGuides('terraform');

// ── GET /api/v1/infra/aws ────────────────────────────────────────────────────
exports.getAWSGuides = getGuides('aws');

// ── GET /api/v1/infra/gcp ────────────────────────────────────────────────────
exports.getGCPGuides = getGuides('gcp');

// ── GET /api/v1/infra/azure ──────────────────────────────────────────────────
exports.getAzureGuides = getGuides('azure');

// ── GET /api/v1/infra/pods ───────────────────────────────────────────────────
exports.getPodsGuides = getGuides('pods');

// ── GET /api/v1/infra/services ───────────────────────────────────────────────
exports.getServicesGuides = getGuides('services');

// ── GET /api/v1/infra/deployments ────────────────────────────────────────────
exports.getDeploymentsGuides = getGuides('deployments');

// ── GET /api/v1/infra/ingress ────────────────────────────────────────────────
exports.getIngressGuides = getGuides('ingress');

// ── GET /api/v1/infra/configmaps ─────────────────────────────────────────────
exports.getConfigMapsGuides = getGuides('configmaps');

// ── GET /api/v1/infra/secrets ────────────────────────────────────────────────
exports.getSecretsGuides = getGuides('secrets');

// ── GET /api/v1/infra/volumes ────────────────────────────────────────────────
exports.getVolumesGuides = getGuides('volumes');

// ── GET /api/v1/infra/networking ─────────────────────────────────────────────
exports.getNetworkingGuides = getGuides('networking');

// ── GET /api/v1/infra/autoscaling ────────────────────────────────────────────
exports.getAutoscalingGuides = getGuides('autoscaling');

// ── GET /api/v1/infra/security ───────────────────────────────────────────────
exports.getSecurityGuides = getGuides('security');

// ── GET /api/v1/infra/monitoring ─────────────────────────────────────────────
exports.getMonitoringGuides = getGuides('monitoring');

// ── GET /api/v1/infra/logging ────────────────────────────────────────────────
exports.getLoggingGuides = getGuides('logging');

// ── GET /api/v1/infra/templates ──────────────────────────────────────────────
exports.getTemplates = getGuides('templates');
