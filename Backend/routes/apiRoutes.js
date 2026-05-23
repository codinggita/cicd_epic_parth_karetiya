// ─────────────────────────────────────────────────────────────────────────────
//  Unified Express Router – Mounts all route groups
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validate, workflowCreateRules, registerRules, loginRules } = require('../middleware/validate');

// ── Controllers ─────────────────────────────────────────────────────────────
const wfCtrl = require('../controllers/workflowController');
const infraCtrl = require('../controllers/infraController');
const searchCtrl = require('../controllers/searchController');
const yamlCtrl = require('../controllers/yamlController');
const analyticsCtrl = require('../controllers/analyticsController');
const debugCtrl = require('../controllers/debugController');
const authCtrl = require('../controllers/authController');
const adminCtrl = require('../controllers/adminController');
const monitorCtrl = require('../controllers/monitoringController');
const notifyCtrl = require('../controllers/notificationController');
const commentCtrl = require('../controllers/commentController');
const reviewCtrl = require('../controllers/reviewController');
const sysCtrl = require('../controllers/systemController');

// ── Helper: Map HEAD & OPTIONS ──────────────────────────────────────────────
const mapOptionsHead = (path, methods, allowedStr) => {
  router.options(path, (req, res) => {
    res.setHeader('Allow', allowedStr);
    res.status(204).end();
  });
  router.head(path, (req, res) => {
    res.status(200).end();
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  1. CI/CD Workflow Operations (/api/v1/workflows)
// ─────────────────────────────────────────────────────────────────────────────
// Specific routes first
router.get('/v1/workflows/random', wfCtrl.getRandom);
router.get('/v1/workflows/latest', wfCtrl.getLatest);
router.get('/v1/workflows/trending', wfCtrl.getTrending);
router.get('/v1/workflows/recommended', wfCtrl.getRecommended);
router.get('/v1/workflows/popular', wfCtrl.getPopular);

// HEAD & OPTIONS for collection level
mapOptionsHead('/v1/workflows', ['GET', 'POST'], 'GET, POST, OPTIONS, HEAD');
router.get('/v1/workflows', wfCtrl.getAll);
router.post('/v1/workflows', workflowCreateRules, validate, wfCtrl.create);

// Instance routes
router.get('/v1/workflows/:id', wfCtrl.getById);
router.put('/v1/workflows/:id', wfCtrl.replace);
router.delete('/v1/workflows/:id', wfCtrl.remove);

// Special PATCH and operations
router.patch('/v1/workflows/:id/content', wfCtrl.updateContent);
router.get('/v1/workflows/history/:id', wfCtrl.getHistory);
router.patch('/v1/workflows/:id/archive', wfCtrl.archive);
router.patch('/v1/workflows/:id/restore', wfCtrl.restore);
router.get('/v1/workflows/:id/versions', wfCtrl.getVersions);
router.post('/v1/workflows/:id/clone', wfCtrl.clone);
router.get('/v1/workflows/:id/logs', wfCtrl.getLogs);
router.get('/v1/workflows/:id/metrics', wfCtrl.getMetrics);
router.post('/v1/workflows/:id/run', wfCtrl.triggerRun);
router.post('/v1/workflows/:id/cancel', wfCtrl.cancelRun);
router.post('/v1/workflows/:id/bookmark', wfCtrl.bookmark);

// HEAD & OPTIONS for instance level
mapOptionsHead('/v1/workflows/:id', ['GET', 'PUT', 'DELETE'], 'GET, PUT, DELETE, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/:id/logs', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/:id/metrics', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/latest', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/trending', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/recommended', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/workflows/popular', ['GET'], 'GET, OPTIONS, HEAD');

router.options('/v1/workflows/:id/run', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/workflows/:id/cancel', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  2. Kubernetes & Infrastructure Routes (/api/v1/infra)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/infra/k8s', infraCtrl.getK8sGuides);
router.get('/v1/infra/docker', infraCtrl.getDockerGuides);
router.get('/v1/infra/helm', infraCtrl.getHelmGuides);
router.get('/v1/infra/terraform', infraCtrl.getTerraformGuides);
router.get('/v1/infra/aws', infraCtrl.getAWSGuides);
router.get('/v1/infra/gcp', infraCtrl.getGCPGuides);
router.get('/v1/infra/azure', infraCtrl.getAzureGuides);
router.get('/v1/infra/pods', infraCtrl.getPodsGuides);
router.get('/v1/infra/services', infraCtrl.getServicesGuides);
router.get('/v1/infra/deployments', infraCtrl.getDeploymentsGuides);
router.get('/v1/infra/ingress', infraCtrl.getIngressGuides);
router.get('/v1/infra/configmaps', infraCtrl.getConfigMapsGuides);
router.get('/v1/infra/secrets', infraCtrl.getSecretsGuides);
router.get('/v1/infra/volumes', infraCtrl.getVolumesGuides);
router.get('/v1/infra/networking', infraCtrl.getNetworkingGuides);
router.get('/v1/infra/autoscaling', infraCtrl.getAutoscalingGuides);
router.get('/v1/infra/security', infraCtrl.getSecurityGuides);
router.get('/v1/infra/monitoring', infraCtrl.getMonitoringGuides);
router.get('/v1/infra/logging', infraCtrl.getLoggingGuides);
router.get('/v1/infra/templates', infraCtrl.getTemplates);

mapOptionsHead('/v1/infra/k8s', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/infra/docker', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/infra/terraform', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/infra/security', ['GET'], 'GET, OPTIONS, HEAD');

// ─────────────────────────────────────────────────────────────────────────────
//  3. Search & Discovery Routes (/api/v1/search)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/search', searchCtrl.globalSearch);
router.get('/v1/search/tags', searchCtrl.getAllTags);
router.get('/v1/search/by-tag/:tag', searchCtrl.searchByTag);
router.get('/v1/search/popular', searchCtrl.popularSearches);
router.get('/v1/search/recent', protect, searchCtrl.recentSearches);
router.get('/v1/search/autocomplete', searchCtrl.autocomplete);
router.get('/v1/search/fuzzy', searchCtrl.fuzzySearch);
router.get('/v1/search/exact', searchCtrl.exactSearch);
router.get('/v1/search/category/:name', searchCtrl.searchByCategory);
router.get('/v1/search/language/:lang', searchCtrl.searchByLanguage);
router.get('/v1/search/tool/:tool', searchCtrl.searchByTool);
router.get('/v1/search/advanced', searchCtrl.advancedSearch);
router.get('/v1/search/suggestions', searchCtrl.suggestions);
router.get('/v1/search/history', protect, searchCtrl.searchHistory);
router.get('/v1/search/trending', searchCtrl.trendingTopics);
router.get('/v1/search/recommended', searchCtrl.recommended);
router.get('/v1/search/filter', searchCtrl.combinedFilter);
router.get('/v1/search/yaml', searchCtrl.searchYaml);
router.get('/v1/search/snippets', searchCtrl.searchSnippets);
router.get('/v1/search/errors', searchCtrl.searchErrors);

mapOptionsHead('/v1/search', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/search/autocomplete', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/search/fuzzy', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/search/advanced', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });
router.options('/v1/search/filter', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  4. YAML & Configuration Routes (/api/v1/yaml)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/v1/yaml/validate', yamlCtrl.validateYaml);
router.post('/v1/yaml/lint', yamlCtrl.lintYaml);
router.post('/v1/yaml/format', yamlCtrl.formatYaml);
router.get('/v1/yaml/templates', yamlCtrl.getTemplates);
router.get('/v1/yaml/templates/k8s', yamlCtrl.getK8sTemplates);
router.get('/v1/yaml/templates/docker', yamlCtrl.getDockerTemplates);
router.get('/v1/yaml/templates/github-actions', yamlCtrl.getGithubActionsTemplates);
router.get('/v1/yaml/templates/gitlab-ci', yamlCtrl.getGitlabCITemplates);
router.get('/v1/yaml/templates/jenkins', yamlCtrl.getJenkinsTemplates);
router.post('/v1/yaml/compare', yamlCtrl.compareYaml);
router.post('/v1/yaml/merge', yamlCtrl.mergeYaml);
router.get('/v1/yaml/examples', yamlCtrl.getExamples);
router.post('/v1/yaml/convert/json', yamlCtrl.yamlToJson);
router.post('/v1/yaml/convert/yaml', yamlCtrl.jsonToYaml);
router.get('/v1/yaml/best-practices', yamlCtrl.bestPractices);

mapOptionsHead('/v1/yaml/templates/k8s', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/yaml/best-practices', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/yaml/validate', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/yaml/lint', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/yaml/compare', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/yaml/merge', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  5. Pipeline Analytics Routes (/api/v1/analytics)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/analytics/summary', analyticsCtrl.summary);
router.get('/v1/analytics/failures', analyticsCtrl.failures);
router.get('/v1/analytics/success-rate', analyticsCtrl.successRate);
router.get('/v1/analytics/deployments', analyticsCtrl.deployments);
router.get('/v1/analytics/build-times', analyticsCtrl.buildTimes);
router.get('/v1/analytics/top-tools', analyticsCtrl.topTools);
router.get('/v1/analytics/top-errors', analyticsCtrl.topErrors);
router.get('/v1/analytics/usage', analyticsCtrl.usage);
router.get('/v1/analytics/trending', analyticsCtrl.trending);
router.get('/v1/analytics/latest', analyticsCtrl.latest);
router.get('/v1/analytics/growth', analyticsCtrl.growth);
router.get('/v1/analytics/performance', analyticsCtrl.performance);
router.get('/v1/analytics/security', analyticsCtrl.security);
router.get('/v1/analytics/costs', analyticsCtrl.costs);
router.get('/v1/analytics/cloud-usage', analyticsCtrl.cloudUsage);

mapOptionsHead('/v1/analytics/summary', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/analytics/security', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/analytics/performance', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  6. Troubleshooting & Debugging Routes (/api/v1/debug)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/debug/common-issues', debugCtrl.commonIssues);
router.get('/v1/debug/logs', debugCtrl.debugLogs);
router.get('/v1/debug/connectivity', debugCtrl.connectivity);
router.get('/v1/debug/errors', debugCtrl.commonErrors);
router.get('/v1/debug/k8s', debugCtrl.k8sDebug);
router.get('/v1/debug/docker', debugCtrl.dockerDebug);
router.get('/v1/debug/jenkins', debugCtrl.jenkinsDebug);
router.get('/v1/debug/github-actions', debugCtrl.githubActionsDebug);
router.get('/v1/debug/gitlab-ci', debugCtrl.gitlabCIDebug);
router.get('/v1/debug/terraform', debugCtrl.terraformDebug);
router.get('/v1/debug/aws', debugCtrl.awsDebug);
router.get('/v1/debug/gcp', debugCtrl.gcpDebug);
router.get('/v1/debug/azure', debugCtrl.azureDebug);
router.get('/v1/debug/network', debugCtrl.networkDebug);
router.get('/v1/debug/security', debugCtrl.securityDebug);

mapOptionsHead('/v1/debug/k8s', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/debug/docker', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/debug/k8s', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });
router.options('/v1/debug/github-actions', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  7. Authentication & Authorization Routes (/api/v1/auth)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/v1/auth/register', registerRules, validate, authCtrl.register);
router.post('/v1/auth/login', loginRules, validate, authCtrl.login);
router.post('/v1/auth/logout', protect, authCtrl.logout);
router.post('/v1/auth/refresh-token', authCtrl.refreshToken);
router.get('/v1/auth/profile', protect, authCtrl.getProfile);
router.patch('/v1/auth/profile', protect, authCtrl.updateProfile);
router.delete('/v1/auth/profile', protect, authCtrl.deleteAccount);
router.post('/v1/auth/change-password', protect, authCtrl.changePassword);
router.post('/v1/auth/forgot-password', authCtrl.forgotPassword);
router.post('/v1/auth/reset-password', authCtrl.resetPassword);
router.post('/v1/auth/verify-email', protect, authCtrl.verifyEmail);
router.get('/v1/auth/sessions', protect, authCtrl.getSessions);
router.delete('/v1/auth/sessions/:id', protect, authCtrl.removeSession);
router.post('/v1/auth/2fa/enable', protect, authCtrl.enable2FA);
router.post('/v1/auth/2fa/disable', protect, authCtrl.disable2FA);

mapOptionsHead('/v1/auth/profile', ['GET', 'PATCH', 'DELETE'], 'GET, PATCH, DELETE, OPTIONS, HEAD');
router.options('/v1/auth/login', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/auth/register', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/auth/2fa/enable', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  8. Admin & Management Routes (/api/v1/admin)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/admin/users', protect, authorize('admin'), adminCtrl.getUsers);
router.get('/v1/admin/users/:id', protect, authorize('admin'), adminCtrl.getUserById);
router.patch('/v1/admin/users/:id/role', protect, authorize('admin'), adminCtrl.updateRole);
router.patch('/v1/admin/users/:id/block', protect, authorize('admin'), adminCtrl.blockUser);
router.patch('/v1/admin/users/:id/unblock', protect, authorize('admin'), adminCtrl.unblockUser);
router.get('/v1/admin/reports', protect, authorize('admin'), adminCtrl.getReports);
router.get('/v1/admin/logs', protect, authorize('admin'), adminCtrl.getLogs);
router.get('/v1/admin/system/health', protect, authorize('admin'), adminCtrl.systemHealth);
router.post('/v1/admin/system/restart', protect, authorize('admin'), adminCtrl.restartServices);
router.delete('/v1/admin/cache/clear', protect, authorize('admin'), adminCtrl.clearCache);
router.get('/v1/admin/security/events', protect, authorize('admin'), adminCtrl.securityEvents);
router.post('/v1/admin/security/block-ip', protect, authorize('admin'), adminCtrl.blockIP);
router.get('/v1/admin/backups', protect, authorize('admin'), adminCtrl.getBackups);
router.post('/v1/admin/backups/create', protect, authorize('admin'), adminCtrl.createBackup);
router.delete('/v1/admin/backups/:id', protect, authorize('admin'), adminCtrl.deleteBackup);

mapOptionsHead('/v1/admin/system/health', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/admin/users', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });
router.options('/v1/admin/system/restart', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/admin/cache/clear', (req, res) => { res.setHeader('Allow', 'DELETE, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  9. Monitoring & Alerting Routes (/api/v1/monitoring)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/monitoring/prometheus', monitorCtrl.prometheus);
router.get('/v1/monitoring/grafana', protect, authorize('admin'), monitorCtrl.grafana);
router.get('/v1/monitoring/alerts', protect, monitorCtrl.getAlerts);
router.get('/v1/monitoring/uptime', monitorCtrl.uptime);
router.get('/v1/monitoring/cpu', monitorCtrl.cpu);
router.get('/v1/monitoring/memory', monitorCtrl.memory);
router.get('/v1/monitoring/network', monitorCtrl.network);
router.get('/v1/monitoring/storage', monitorCtrl.storage);
router.post('/v1/monitoring/alerts/create', protect, authorize('admin'), monitorCtrl.createAlert);
router.delete('/v1/monitoring/alerts/:id', protect, authorize('admin'), monitorCtrl.deleteAlert);

mapOptionsHead('/v1/monitoring/prometheus', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/monitoring/alerts/create', (req, res) => { res.setHeader('Allow', 'POST, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  10. Notifications & Collaboration Routes (/api/v1/notifications, /api/v1/comments, reviews)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/notifications', optionalAuth, notifyCtrl.getAll);
router.patch('/v1/notifications/:id/read', optionalAuth, notifyCtrl.markRead);
router.delete('/v1/notifications/:id', optionalAuth, notifyCtrl.remove);

router.post('/v1/comments/:workflowId', optionalAuth, commentCtrl.addComment);
router.get('/v1/comments/:workflowId', commentCtrl.getComments);
router.patch('/v1/comments/:commentId', optionalAuth, commentCtrl.updateComment);
router.delete('/v1/comments/:commentId', optionalAuth, commentCtrl.deleteComment);

router.post('/v1/reviews/:workflowId', optionalAuth, reviewCtrl.submitReview);
router.get('/v1/reviews/:workflowId', reviewCtrl.getReviews);

mapOptionsHead('/v1/notifications', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/notifications', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });
router.options('/v1/comments/:workflowId', (req, res) => { res.setHeader('Allow', 'GET, POST, OPTIONS'); res.status(204).end(); });
router.options('/v1/reviews/:workflowId', (req, res) => { res.setHeader('Allow', 'GET, POST, OPTIONS'); res.status(204).end(); });

// ─────────────────────────────────────────────────────────────────────────────
//  11. System & Utility Routes (/api/v1/health, /api/v1/system)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/v1/health', sysCtrl.health);
router.get('/v1/system/info', sysCtrl.info);
router.get('/v1/system/version', sysCtrl.version);
router.get('/v1/system/uptime', sysCtrl.uptime);
router.get('/v1/system/config', sysCtrl.config);
router.get('/v1/system/status', sysCtrl.status);
router.get('/v1/system/memory', sysCtrl.memory);
router.get('/v1/system/storage', sysCtrl.storage);
router.get('/v1/system/connections', sysCtrl.connections);
router.get('/v1/system/environment', sysCtrl.environment);

mapOptionsHead('/v1/system/status', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/system/storage', ['GET'], 'GET, OPTIONS, HEAD');
mapOptionsHead('/v1/system/environment', ['GET'], 'GET, OPTIONS, HEAD');
router.options('/v1/system/status', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });
router.options('/v1/system/environment', (req, res) => { res.setHeader('Allow', 'GET, OPTIONS'); res.status(204).end(); });

module.exports = router;
