// ─────────────────────────────────────────────────────────────────────────────
//  seed.js – Seeds workflows and infrastructure guides into MongoDB
//  Command: npm run seed
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const Workflow = require('./models/Workflow');
const InfraGuide = require('./models/InfraGuide');
const connectDB = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const sampleWorkflows = [
  {
    name: 'Node.js CI Pipeline',
    description: 'Comprehensive Continuous Integration workflow for Node.js projects, with linting, testing, and security scans.',
    category: 'ci',
    platform: 'github-actions',
    language: 'yaml',
    difficulty: 'Beginner',
    topic: 'github-actions',
    tags: ['nodejs', 'ci', 'testing', 'eslint', 'sonar', 'security'],
    views: 154,
    likes: 38,
    bookmarks: 14,
    clones: 22,
    runCount: 8,
    successRate: 88,
    avgBuildTime: 45,
    status: 'active',
    isPublic: true,
    content: `name: Node.js CI

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint code
      run: npm run lint --if-present
      
    - name: Run unit tests
      run: npm test`,
    steps: [
      { name: 'Checkout Repo', command: 'actions/checkout@v4', order: 1 },
      { name: 'Setup Node.js', command: 'actions/setup-node@v4', order: 2 },
      { name: 'Install Dependencies', command: 'npm ci', order: 3 },
      { name: 'Run Unit Tests', command: 'npm test', order: 4 }
    ],
    runs: [
      { runId: uuidv4(), status: 'success', duration: 42, triggeredBy: 'git-push', logs: ['Cloning repo', 'Setting up node', 'Running npm ci', 'All tests passed!'] },
      { runId: uuidv4(), status: 'success', duration: 48, triggeredBy: 'git-push', logs: ['Cloning repo', 'Setting up node', 'Running npm ci', 'All tests passed!'] }
    ],
    versions: [
      { versionNumber: 1, content: 'Initial template', message: 'First version' }
    ]
  },
  {
    name: 'DevSecOps Compliance Scan',
    description: 'Enforces security policies, runs container vulnerability checks, and audits open-source dependency licenses.',
    category: 'security',
    platform: 'github-actions',
    language: 'yaml',
    difficulty: 'Intermediate',
    topic: 'security',
    tags: ['security', 'devsecops', 'trivy', 'snyk', 'owasp'],
    views: 124,
    likes: 42,
    bookmarks: 18,
    clones: 15,
    runCount: 6,
    successRate: 100,
    avgBuildTime: 95,
    status: 'active',
    isPublic: true,
    content: `name: Security Compliance Scan
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run Snyk Open Source Scan
      run: npx snyk test --severity-threshold=medium
    - name: Run Trivy Vulnerability Scanner
      run: trivy fs .`,
    steps: [
      { name: 'Checkout Code', command: 'actions/checkout@v4', order: 1 },
      { name: 'Snyk Audit', command: 'npx snyk test', order: 2 },
      { name: 'Trivy Scan', command: 'trivy fs .', order: 3 }
    ],
    runs: [
      { runId: uuidv4(), status: 'success', duration: 92, triggeredBy: 'schedule-trigger', logs: ['Scanned dependencies', 'Trivy: 0 critical vulnerabilities found', 'Scan passed'] }
    ],
    versions: [
      { versionNumber: 1, content: 'Initial setup', message: 'Daily cron' }
    ]
  },
  {
    name: 'Kubernetes Production Deployment',
    description: 'Advanced CD pipeline that builds Docker image, uploads to AWS ECR, and deploys to Kubernetes using Helm.',
    category: 'deployment',
    platform: 'github-actions',
    language: 'yaml',
    difficulty: 'Advanced',
    topic: 'kubernetes',
    tags: ['kubernetes', 'docker', 'helm', 'aws', 'ecr', 'eks'],
    views: 312,
    likes: 92,
    bookmarks: 45,
    clones: 51,
    runCount: 14,
    successRate: 93,
    avgBuildTime: 180,
    status: 'active',
    isPublic: true,
    content: `name: Deploy to K8s

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
      
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: my-k8s-app
        IMAGE_TAG: \${{ github.ref_name }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        
    - name: Setup Helm
      uses: azure/setup-helm@v4
      with:
        version: 'v3.14.0'
        
    - name: Deploy Chart to EKS Cluster
      run: |
        aws eks update-kubeconfig --name production-cluster --region us-east-1
        helm upgrade --install my-app ./charts/my-app \\
          --namespace production \\
          --set image.repository=$ECR_REGISTRY/$ECR_REPOSITORY \\
          --set image.tag=\${{ github.ref_name }}`,
    steps: [
      { name: 'Checkout Code', command: 'actions/checkout@v4', order: 1 },
      { name: 'AWS Auth', command: 'aws-actions/configure-aws-credentials@v4', order: 2 },
      { name: 'Build & Push Docker', command: 'docker build & docker push', order: 3 },
      { name: 'Helm Deploy', command: 'helm upgrade --install', order: 4 }
    ],
    runs: [
      { runId: uuidv4(), status: 'success', duration: 172, triggeredBy: 'tag-creation', logs: ['Authorized with AWS', 'Image pushed to ECR', 'Helm release updated successfully'] }
    ]
  },
  {
    name: 'GitLab Pages Auto-Deployment',
    description: 'Deploys static site to GitLab Pages automatically upon new commits in the master branch.',
    category: 'deployment',
    platform: 'gitlab-ci',
    language: 'yaml',
    difficulty: 'Beginner',
    topic: 'gitlab-ci',
    tags: ['gitlab', 'pages', 'static-site', 'hugo', 'jekyll'],
    views: 89,
    likes: 19,
    bookmarks: 8,
    clones: 12,
    runCount: 5,
    successRate: 100,
    avgBuildTime: 30,
    status: 'active',
    isPublic: true,
    content: `image: node:20-alpine

pages:
  stage: deploy
  script:
    - npm install
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - master`,
    steps: [
      { name: 'Install dependencies', command: 'npm install', order: 1 },
      { name: 'Build project', command: 'npm run build', order: 2 },
      { name: 'Move directory', command: 'mv dist public', order: 3 }
    ],
    runs: [
      { runId: uuidv4(), status: 'success', duration: 28, triggeredBy: 'merge-request', logs: ['NPM packages installed', 'Build successful', 'Public artifact uploaded'] }
    ]
  }
];

const sampleGuides = [
  // ── Kubernetes Guides (k8s) ───────────────────────────────────────────────
  {
    title: 'Kubernetes Cluster Administration and Operations Guide',
    type: 'k8s',
    description: 'A complete handbook on managing nodes, workloads, and runtime systems in a K8s production environment.',
    content: 'Kubernetes cluster administration requires deep knowledge of apiserver, etcd, controller manager, and scheduler operations. Standard practices dictate using role-based access control (RBAC) to enforce security privileges, deploying network policies to secure pod communications, and configuring horizontal pod autoscaling to respond to traffic fluctuation dynamically.',
    difficulty: 'Advanced',
    tags: ['k8s', 'kubernetes', 'administration', 'ops']
  },
  {
    title: 'Kubernetes Multi-Tenancy Design and Namespaces',
    type: 'k8s',
    description: 'Structure multi-tenant environments using network isolation and RBAC controls.',
    content: 'Enforcing multi-tenancy in Kubernetes centers around namespaces. Enable resource quotas to cap CPU and Memory consumption per group, implement LimitRanges for default container values, and setup RBAC ClusterRoles to securely delegate cluster access.',
    difficulty: 'Intermediate',
    tags: ['k8s', 'multi-tenancy', 'rbac', 'namespaces']
  },
  {
    title: 'Kubernetes Node Upgrades and Maintenance Workflows',
    type: 'k8s',
    description: 'Safely drain nodes, perform host maintenance, and apply software upgrades.',
    content: 'Upgrading cluster nodes requires careful eviction of workloads. Use "kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data" to safely move pods. Mark the node cordoned, execute OS updates, restart the kubelet, and restore schedulability with "kubectl uncordon".',
    difficulty: 'Advanced',
    tags: ['k8s', 'nodes', 'upgrade', 'maintenance']
  },

  // ── Docker Guides (docker) ─────────────────────────────────────────────────
  {
    title: 'Dockerizing Applications Best Practices',
    type: 'docker',
    description: 'Comprehensive guide to building lightweight, secure, and multi-stage Docker images.',
    content: 'Docker containerization requires multi-stage builds to separate build dependencies from execution binaries. Always run container processes as non-root users, use minimal base images like alpine or distroless, pin specific image digests, and exclude logs and build caches using .dockerignore.',
    difficulty: 'Intermediate',
    tags: ['docker', 'container', 'dockerfile', 'security']
  },
  {
    title: 'Optimizing Docker Build Cache Speed',
    type: 'docker',
    description: 'Speed up pipelines by ordering docker commands and caching layers.',
    content: 'To maximize Docker cache efficiency, place statements that change least frequently at the top of your Dockerfile. Copy dependency lists (like package.json) and run install scripts before copying the rest of your source code.',
    difficulty: 'Beginner',
    tags: ['docker', 'cache', 'build-speed', 'optimization']
  },
  {
    title: 'Docker Daemon Hardening and Container Isolation',
    type: 'docker',
    description: 'Configure namespaces, cgroups, and daemon settings for robust container security.',
    content: 'Hardening the Docker daemon prevents container escape vulnerabilities. Restrict the docker socket API, enable user namespaces to map root within a container to non-root on the host, restrict CPU and memory per container, and run dockerd in rootless mode.',
    difficulty: 'Advanced',
    tags: ['docker', 'hardening', 'daemon', 'security']
  },

  // ── Helm Guides (helm) ─────────────────────────────────────────────────────
  {
    title: 'Managing Helm Charts and Releases',
    type: 'helm',
    description: 'Learn Helm package management, charts, and release updates.',
    content: 'Helm simplifies deploying applications on Kubernetes by defining parameterizable charts. Use values.yaml to govern config variables. Always validate chart templates using helm lint, check generated templates using helm template, and rollback failed releases using helm rollback.',
    difficulty: 'Beginner',
    tags: ['helm', 'k8s', 'deployment', 'package']
  },
  {
    title: 'Building Custom Helm Charts and Helmlines',
    type: 'helm',
    description: 'Create configurable templates, helper variables, and chart dependencies.',
    content: 'Building charts starts with "helm create". Use templates/helpers.tpl for reusable template snippets. Define dependencies inside Chart.yaml and run "helm dependency update" to import them.',
    difficulty: 'Intermediate',
    tags: ['helm', 'templates', 'chart-development']
  },

  // ── Terraform Guides (terraform) ──────────────────────────────────────────
  {
    title: 'Infrastructure as Code using Terraform',
    type: 'terraform',
    description: 'Configure and provision cloud resources declarative with Terraform HCL.',
    content: 'Terraform uses HashiCorp Configuration Language (HCL) to maintain state. Set up remote backends like AWS S3 or Terraform Cloud with state locking via DynamoDB to prevent concurrent executions. Protect secrets, run terraform plan, and enforce policy audits via Sentinel.',
    difficulty: 'Advanced',
    tags: ['terraform', 'iac', 'aws', 'hcl']
  },
  {
    title: 'Terraform State Management and Workspaces',
    type: 'terraform',
    description: 'Best practices for organizing states, locking, isolation, and workspaces.',
    content: 'Never edit state files manually. Use "terraform state mv" or "terraform state rm" to refactor resources safely. Implement multiple workspaces to isolate environments like Dev, QA, and Prod within the same configuration.',
    difficulty: 'Advanced',
    tags: ['terraform', 'state', 'workspaces', 'isolation']
  },

  // ── AWS Guides (aws) ───────────────────────────────────────────────────────
  {
    title: 'AWS Elastic Container Service (ECS) Setup Guide',
    type: 'aws',
    description: 'Deploying containerized microservices in AWS using Fargate.',
    content: 'AWS ECS Fargate allows serverless container execution. Configure Task Definitions defining CPU/Memory, map security groups strictly allowing traffic from alb, write task execution roles to stream CloudWatch logs, and govern auto-scaling parameters.',
    difficulty: 'Intermediate',
    tags: ['aws', 'ecs', 'fargate', 'cloud']
  },
  {
    title: 'AWS Elastic Kubernetes Service (EKS) Networking with VPC CNI',
    type: 'aws',
    description: 'Optimize subnet sizes, security groups, and pod network allocations.',
    content: 'Configure EKS using AWS VPC CNI to allocate native VPC IPs to pods. Allocate secondary CIDR blocks to satisfy ip address needs, assign security groups directly to pods, and use AWS Load Balancer Controller to automatically sync ALBs.',
    difficulty: 'Advanced',
    tags: ['aws', 'eks', 'vpc-cni', 'networking']
  },

  // ── GCP Guides (gcp) ───────────────────────────────────────────────────────
  {
    title: 'GCP Google Kubernetes Engine (GKE) Setup Guide',
    type: 'gcp',
    description: 'Bootstrap a managed production-ready Kubernetes cluster on Google Cloud.',
    content: 'GKE provides auto-pilot mode for fully managed nodes. Set up regional clusters for high availability, bind IAM service accounts to K8s service accounts using Workload Identity, configure VPC-native routing, and enable Cloud Logging/Monitoring integration.',
    difficulty: 'Advanced',
    tags: ['gcp', 'gke', 'k8s', 'cloud']
  },
  {
    title: 'Scaling GKE Nodes Dynamically with Karpenter',
    type: 'gcp',
    description: 'Accelerate cluster autoscaling using Karpenter on GKE structures.',
    content: 'Karpenter bypasses the traditional node group setup by calling GCP compute APIs directly. Define NodePool specs to configure machine families, and set constraints based on labels, pricing, and disk volumes.',
    difficulty: 'Advanced',
    tags: ['gcp', 'gke', 'karpenter', 'autoscaling']
  },

  // ── Azure Guides (azure) ───────────────────────────────────────────────────
  {
    title: 'Azure Container Apps (ACA) Deployment Guide',
    type: 'azure',
    description: 'Provision serverless containers on Microsoft Azure.',
    content: 'Azure Container Apps allow deploying applications without managing clusters. Configure container environments, set up scale rules based on concurrent HTTP requests or CPU usage, configure custom domains with automatic SSL, and integrate with Azure Key Vault.',
    difficulty: 'Intermediate',
    tags: ['azure', 'containers', 'serverless', 'cloud']
  },
  {
    title: 'Azure Kubernetes Service (AKS) Security Hardening',
    type: 'azure',
    description: 'Enforce private API server, Entra ID integration, and Azure Policies.',
    content: 'Implement Microsoft Entra ID integration for secure Kubernetes RBAC. Create private AKS clusters to restrict api access, enforce container policies using Azure Policy Add-on, and use Azure Key Vault Provider for Secrets Store CSI.',
    difficulty: 'Advanced',
    tags: ['azure', 'aks', 'security', 'keyvault']
  },

  // ── Pod Guides (pods) ──────────────────────────────────────────────────────
  {
    title: 'Kubernetes Pod Manifest Configuration Guide',
    type: 'pods',
    description: 'In-depth guide on configuring pod templates, resource constraints, and health probes.',
    content: 'Pods are the smallest execution units in K8s. Always configure resource requests and limits to assist the scheduler. Set up livenessProbes to reboot dead apps, readinessProbes to stop routing traffic during startup, and startupProbes for slow-starting apps.',
    difficulty: 'Beginner',
    tags: ['pods', 'k8s', 'resources', 'probes']
  },
  {
    title: 'Pod Topology Spread Constraints and Affinity Rules',
    type: 'pods',
    description: 'Ensure high-availability of workloads by distributing pods across regions and zones.',
    content: 'Topology spread constraints prevent single point of failures. Use "topologySpreadConstraints" in pod manifest to direct the scheduler to spread pods evenly across topology keys (like kubernetes.io/hostname or topology.kubernetes.io/zone). Configure nodeAffinity and podAntiAffinity.',
    difficulty: 'Advanced',
    tags: ['pods', 'affinity', 'high-availability', 'k8s']
  },
  {
    title: 'InitContainers and Pod Lifecycle Hooks',
    type: 'pods',
    description: 'Perform setup tasks, db migrations, and shutdown cleanup hooks.',
    content: 'Use initContainers to run database migrations before the main container starts. Configure postStart hooks to run commands immediately after container creation, and preStop lifecycle hooks to gracefully close socket connections before container termination.',
    difficulty: 'Intermediate',
    tags: ['pods', 'init-containers', 'lifecycle', 'hooks']
  },

  // ── Service Guides (services) ──────────────────────────────────────────────
  {
    title: 'Kubernetes Services Guide (ClusterIP vs NodePort vs LoadBalancer)',
    type: 'services',
    description: 'Understand how K8s networking exposes workloads internally and externally.',
    content: '1) ClusterIP (default) exposes services internally on a cluster-internal IP. 2) NodePort exposes services on each node port, allowing external traffic. 3) LoadBalancer provisions an external cloud load balancer to forward traffic.',
    difficulty: 'Intermediate',
    tags: ['services', 'k8s', 'networking', 'loadbalancer']
  },
  {
    title: 'Headless Services and Pod DNS Resolution',
    type: 'services',
    description: 'Configure headless services for stateful databases and service discovery.',
    content: 'To define a headless service, set "clusterIP: None" in the service spec. This allows DNS queries for the service name to return the direct IPs of all backing pods rather than a single cluster IP. This is essential for stateful clusters like Cassandra, Kafka, or MongoDB.',
    difficulty: 'Advanced',
    tags: ['services', 'dns', 'stateful', 'headless']
  },

  // ── Deployment Guides (deployments) ────────────────────────────────────────
  {
    title: 'Kubernetes Deployments Guide',
    type: 'deployments',
    description: 'Learn how to configure rolling updates, replicas, and replicas strategies.',
    content: 'Deployments provide declarative updates for Pods. Configure replica count, define strategy types like RollingUpdate with maxSurge and maxUnavailable, or Recreate for non-concurrent stateful microservices.',
    difficulty: 'Beginner',
    tags: ['deployments', 'k8s', 'replicas', 'rollingupdate']
  },
  {
    title: 'Blue-Green and Canary Deployment Strategies',
    type: 'deployments',
    description: 'Minimize release risk using advanced application rollout techniques.',
    content: 'Blue-Green deployments maintain two identical environments, switching traffic globally. Canary releases route a small percentage of user traffic to a new version to verify stability. Use Argo Rollouts or Istio VirtualServices for dynamic traffic splitting.',
    difficulty: 'Advanced',
    tags: ['deployments', 'canary', 'blue-green', 'rollout']
  },

  // ── Ingress Guides (ingress) ───────────────────────────────────────────────
  {
    title: 'Ingress Controller Configuration',
    type: 'ingress',
    description: 'Route external HTTP/S traffic to internal K8s services using Ingress resources.',
    content: 'Ingress acts as an entry gate. Deploy Ingress-Nginx, configure host-based and path-based routing rules, secure endpoints with TLS certificates managed automatically by cert-manager, and configure rewrite annotations.',
    difficulty: 'Advanced',
    tags: ['ingress', 'k8s', 'nginx', 'tls']
  },
  {
    title: 'Path rewriting and SSL Passthrough in Nginx Ingress',
    type: 'ingress',
    description: 'Configure advanced annotations for backend path routing and secure connections.',
    content: 'Use the annotation "nginx.ingress.kubernetes.io/rewrite-target" to strip prefixes from paths before forwarding requests. Enable SSL passthrough when the backend container must handle TLS termination directly.',
    difficulty: 'Advanced',
    tags: ['ingress', 'nginx', 'rewrite', 'ssl']
  },

  // ── ConfigMaps Guides (configmaps) ─────────────────────────────────────────
  {
    title: 'Configuring ConfigMaps in Workloads',
    type: 'configmaps',
    description: 'Separate environment configurations from application container images.',
    content: 'ConfigMaps store non-confidential configuration. Mount ConfigMaps as environment variables or file directories inside container specs. Changes to file mounts are dynamically updated without container restart.',
    difficulty: 'Beginner',
    tags: ['configmaps', 'k8s', 'config', 'workloads']
  },
  {
    title: 'Hot-Reloading Application ConfigMaps',
    type: 'configmaps',
    description: 'Leverage file-mounted ConfigMaps to trigger runtime config updates.',
    content: 'When ConfigMaps are mounted as volumes, Kubernetes automatically updates the files in the container when the ConfigMap changes. Integrate file watchers in your application to automatically reload configurations without restarts.',
    difficulty: 'Intermediate',
    tags: ['configmaps', 'hot-reload', 'volumes']
  },

  // ── Secrets Guides (secrets) ───────────────────────────────────────────────
  {
    title: 'Managing Secrets in Workloads securely',
    type: 'secrets',
    description: 'Storing token keys, passwords, and sensitive keys securely in K8s.',
    content: 'Kubernetes Secrets store base64-encoded confidential keys. Mount secrets as environment variables or secure volumes. Enable encryption at rest in etcd, and restrict secret access using strict RBAC rules.',
    difficulty: 'Intermediate',
    tags: ['secrets', 'k8s', 'security', 'etcd']
  },
  {
    title: 'Integrating HashiCorp Vault with Kubernetes Secrets Store',
    type: 'secrets',
    description: 'Retrieve dynamic and short-lived secrets from Vault using the CSI driver.',
    content: 'Instead of storing secrets natively in etcd, configure the Secrets Store CSI Driver to mount secrets directly from HashiCorp Vault into your pod volumes. Secrets exist only in-memory and are never written to disk.',
    difficulty: 'Advanced',
    tags: ['secrets', 'vault', 'csi', 'security']
  },

  // ── Volumes Guides (volumes) ───────────────────────────────────────────────
  {
    title: 'Persistent Storage and Volumes Guide',
    type: 'volumes',
    description: 'Understand K8s storage: emptyDir, hostPath, PersistentVolumes, and claims.',
    content: 'Separate storage lifetime from Pod lifespan. Configure PersistentVolume (PV) as cluster storage provision, PersistentVolumeClaim (PVC) to request storage, and attach PVCs dynamically using StorageClasses.',
    difficulty: 'Advanced',
    tags: ['volumes', 'k8s', 'storage', 'pvc']
  },
  {
    title: 'Dynamic Storage Provisioning with CSI and AWS EBS',
    type: 'volumes',
    description: 'Setup StorageClasses to dynamically provision and attach AWS EBS storage disks.',
    content: 'Define a StorageClass specifying the EBS CSI driver ("ebs.csi.aws.com"). Configure parameters like volume type (gp3) and reclaim policy. When a PVC requests this storage class, Kubernetes automatically creates and attaches the EBS volume.',
    difficulty: 'Advanced',
    tags: ['volumes', 'aws', 'ebs', 'csi']
  },

  // ── Networking Guides (networking) ─────────────────────────────────────────
  {
    title: 'Advanced Kubernetes Networking',
    type: 'networking',
    description: 'Deep dive into CNI plugins, CoreDNS, and Pod-to-Pod communication.',
    content: 'CNIs govern networking. Use Calico or Cilium to enforce secure network policies, configure CoreDNS for custom domain routing, and use service mesh (Istio) for secure mutual TLS and telemetry.',
    difficulty: 'Advanced',
    tags: ['networking', 'k8s', 'dns', 'cni']
  },
  {
    title: 'Enforcing Pod Network Isolation Policies',
    type: 'networking',
    description: 'Configure ingress and egress rules to lock down multi-pod services.',
    content: 'By default, all pods in Kubernetes can talk to each other. Deploy a Calico or Cilium CNI, and configure NetworkPolicies defining strict ingress/egress CIDR blocks, port constraints, and namespace selectors.',
    difficulty: 'Intermediate',
    tags: ['networking', 'security', 'network-policies']
  },

  // ── Autoscaling Guides (autoscaling) ───────────────────────────────────────
  {
    title: 'Autoscaling Workloads (HPA & VPA)',
    type: 'autoscaling',
    description: 'Scale resources dynamically to optimize cloud spending and application reliability.',
    content: 'HPA scales replica counts based on CPU/Memory, while VPA scales container resource constraints. Use Cluster Autoscaler (CA) or Karpenter to dynamically provision nodes when pods are unschedulable.',
    difficulty: 'Advanced',
    tags: ['autoscaling', 'k8s', 'hpa', 'vpa']
  },
  {
    title: 'Configuring custom Prometheus metrics for HPA autoscaling',
    type: 'autoscaling',
    description: 'Scale pods based on actual API requests per second rather than pure CPU usage.',
    content: 'Deploy the Prometheus Adapter to register custom metrics inside the Kubernetes Custom Metrics API. Update the HPA manifest to use type "Object" or "External", pointing to your target request-rate metric.',
    difficulty: 'Advanced',
    tags: ['autoscaling', 'hpa', 'prometheus', 'metrics']
  },

  // ── Security Guides (security) ─────────────────────────────────────────────
  {
    title: 'Infrastructure Security best practices',
    type: 'security',
    description: 'Audit and harden container security and network profiles.',
    content: 'Audit security using Trivy or Kube-bench. Enforce strict Policy agents using OPA Gatekeeper, secure kernel calls with gVisor, disable root access inside Docker containers, and implement secure IAM lease systems.',
    difficulty: 'Advanced',
    tags: ['security', 'hardening', 'audit', 'opa']
  },
  {
    title: 'Container Image Security Scans in CI pipelines',
    type: 'security',
    description: 'Integrate security gates into Jenkins and GitHub Actions pipelines using Trivy.',
    content: 'Build and tag your Docker images, then execute security scans before uploading them to the registry. Fail pipelines if high or critical vulnerabilities are discovered using "trivy image --exit-code 1".',
    difficulty: 'Intermediate',
    tags: ['security', 'ci', 'trivy', 'vulnerabilities']
  },

  // ── Monitoring Guides (monitoring) ─────────────────────────────────────────
  {
    title: 'Monitoring Setup using Prometheus & Grafana',
    type: 'monitoring',
    description: 'Visualize cluster health, HTTP latencies, and container metrics.',
    content: 'Install Prometheus-Operator via Helm. Expose Prometheus metrics, configure Grafana dashboards querying cluster state, set up Alertmanager to trigger PagerDuty alerts during high CPU load or node failures.',
    difficulty: 'Intermediate',
    tags: ['monitoring', 'prometheus', 'grafana', 'alerts']
  },
  {
    title: 'Configuring Alertmanager for Custom Slack Notifications',
    type: 'monitoring',
    description: 'Stream critical infrastructure warnings directly to DevOps Slack channels.',
    content: 'Configure Alertmanager config YAML. Define routes, set grouping parameters to avoid alert fatigue, and configure the slack_configs section, pasting your incoming webhook URL and custom rich formatting blocks.',
    difficulty: 'Intermediate',
    tags: ['monitoring', 'alertmanager', 'slack', 'notifications']
  },

  // ── Logging Guides (logging) ───────────────────────────────────────────────
  {
    title: 'Centralized Logging Pipeline',
    type: 'logging',
    description: 'Implement elastic EFK or PLG stack to aggregate container log outputs.',
    content: 'Deploy Promtail or Fluent Bit as a DaemonSet to stream stdout logs, index them in Loki or Elasticsearch, and visualize query outputs directly in Grafana or Kibana. Enable log rotation on host nodes.',
    difficulty: 'Intermediate',
    tags: ['logging', 'efk', 'loki', 'fluentbit']
  },
  {
    title: 'Configuring Fluent Bit with Log Parsers',
    type: 'logging',
    description: 'Parse JSON, Nginx, and custom logs inside container outputs before streaming them.',
    content: 'Fluent Bit uses parsers to structure raw string logs into searchable key-value objects. Enable the JSON parser for application containers, and add system metadata tags (node name, namespace, pod name).',
    difficulty: 'Intermediate',
    tags: ['logging', 'fluentbit', 'parsers', 'json']
  },

  // ── Reusable Templates (templates) ─────────────────────────────────────────
  {
    title: 'Reusable CI/CD Pipeline Templates',
    type: 'templates',
    description: 'Standardize enterprise deployment pipelines using reusable workflows.',
    content: 'Avoid template repetition. Write reusable GitHub Actions workflows using workflow_call inputs and secrets, or Jenkins shared libraries, creating consistent build-test-scan-deploy steps across repositories.',
    difficulty: 'Intermediate',
    tags: ['templates', 'reusable', 'github-actions', 'jenkins']
  },
  {
    title: 'Enterprise Jenkins Shared Libraries',
    type: 'templates',
    description: 'Build centralized Groovy utilities to govern steps across global Jenkinsfiles.',
    content: 'Create a shared library repository structure (src, vars, resources). Code standard pipeline scripts inside the "vars" folder (e.g. standardNodePipeline.groovy) so pipelines can load them via single declaration calls.',
    difficulty: 'Advanced',
    tags: ['templates', 'jenkins', 'groovy', 'shared-library']
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing
    await Workflow.deleteMany();
    console.log('🗑️  Cleared existing workflows');

    await InfraGuide.deleteMany();
    console.log('🗑️  Cleared existing infrastructure guides');

    // Insert new
    const insertedWorkflows = await Workflow.insertMany(sampleWorkflows);
    console.log(`✅ Successfully seeded ${insertedWorkflows.length} workflows`);

    const insertedGuides = await InfraGuide.insertMany(sampleGuides);
    console.log(`✅ Successfully seeded ${insertedGuides.length} infrastructure guides`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
