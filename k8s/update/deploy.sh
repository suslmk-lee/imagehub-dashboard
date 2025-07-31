#!/bin/bash

# ImageHub Dashboard deployment script for kps-hub namespace
# This script deploys imagehub-dashboard to the existing kps-hub namespace

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
NAMESPACE="kps-hub"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "=== ImageHub Dashboard Deployment to kps-hub ==="
log_info "Namespace: ${NAMESPACE}"
log_info "Script Directory: ${SCRIPT_DIR}"
log_info "=================================================="

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
fi

# Check cluster connection
log_info "Checking cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi
log_success "Connected to Kubernetes cluster"

# Check if namespace exists
log_info "Checking if namespace '${NAMESPACE}' exists..."
if ! kubectl get namespace "${NAMESPACE}" &> /dev/null; then
    log_error "Namespace '${NAMESPACE}' does not exist. Please create it first."
    exit 1
fi
log_success "Namespace '${NAMESPACE}' exists"

# Deploy resources
log_info "Deploying ImageHub Dashboard resources..."

# Apply ConfigMap and Secret
log_info "Applying ConfigMap and Secret..."
kubectl apply -f "${SCRIPT_DIR}/configmap.yaml"
log_success "ConfigMap and Secret applied"

# Apply Deployment
log_info "Applying Deployment..."
kubectl apply -f "${SCRIPT_DIR}/deployment.yaml"
log_success "Deployment applied"

# Apply Service
log_info "Applying Service..."
kubectl apply -f "${SCRIPT_DIR}/service.yaml"
log_success "Service applied"

# Apply HPA and PDB
log_info "Applying HPA and PDB..."
kubectl apply -f "${SCRIPT_DIR}/hpa.yaml"
log_success "HPA and PDB applied"

# Wait for deployment to be ready
log_info "Waiting for deployment to be ready..."
kubectl rollout status deployment/imagehub-dashboard -n "${NAMESPACE}" --timeout=300s
log_success "Deployment is ready"

# Show status
log_info "Current status:"
kubectl get pods,svc,hpa -n "${NAMESPACE}" -l app=imagehub-dashboard

log_success "ImageHub Dashboard deployed successfully!"
log_info ""
log_warning "IMPORTANT: To complete the setup, you need to update the ingress:"
log_info "1. Option 1 - Apply complete ingress (replaces existing):"
log_info "   kubectl apply -f ${SCRIPT_DIR}/ingress-complete.yaml"
log_info ""
log_info "2. Option 2 - Patch existing ingress (adds path only):"
log_info "   kubectl patch ingress kps-public-image-hub-ingress -n ${NAMESPACE} --patch-file ${SCRIPT_DIR}/ingress-patch.yaml"
log_info ""
log_info "After updating ingress, the dashboard will be accessible at:"
log_info "https://hub.27.96.159.239.nip.io/dashboard"