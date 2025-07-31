#!/bin/bash

# ImageHub Dashboard Kubernetes Deployment Script
# 이 스크립트는 Kubernetes 클러스터에 애플리케이션을 배포합니다.

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
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

# 기본 변수 설정
NAMESPACE="imagehub-dashboard"
K8S_DIR="./k8s"
IMAGE_TAG=${IMAGE_TAG:-"latest"}
REGISTRY_URL=${REGISTRY_URL:-"harbor.27.96.159.239.nip.io"}
PROJECT_NAME="kpaas/imagehub-dashboard"
DRY_RUN=${DRY_RUN:-false}
SKIP_BUILD=${SKIP_BUILD:-false}

# 사용법 출력
usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy      Deploy the application (default)"
    echo "  delete      Delete the application"
    echo "  status      Check deployment status"
    echo "  logs        Show application logs"
    echo "  restart     Restart the deployment"
    echo ""
    echo "Options:"
    echo "  -n, --namespace NAME    Kubernetes namespace (default: imagehub-dashboard)"
    echo "  -t, --tag TAG          Image tag (default: latest)"
    echo "  -r, --registry URL     Docker registry URL (default: registry.k-paas.org)"
    echo "  --dry-run              Show what would be deployed without applying"
    echo "  --skip-build           Skip Docker image build"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  NAMESPACE      Kubernetes namespace"
    echo "  IMAGE_TAG      Docker image tag"
    echo "  REGISTRY_URL   Docker registry URL"
    echo "  DRY_RUN        Set to 'true' for dry run"
    echo "  SKIP_BUILD     Set to 'true' to skip build"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy with defaults"
    echo "  $0 -t v1.2.3                        # Deploy specific version"
    echo "  $0 --dry-run deploy                  # Show what would be deployed"
    echo "  $0 delete                            # Delete application"
    echo "  $0 status                            # Check status"
}

# kubectl 존재 확인
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl first."
        exit 1
    fi
}

# 클러스터 연결 확인
check_cluster_connection() {
    log_info "Checking cluster connection..."
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    log_success "Connected to Kubernetes cluster"
}

# 네임스페이스 생성/확인
ensure_namespace() {
    log_info "Ensuring namespace '${NAMESPACE}' exists..."
    
    if kubectl get namespace "${NAMESPACE}" &> /dev/null; then
        log_success "Namespace '${NAMESPACE}' already exists"
    else
        log_info "Creating namespace '${NAMESPACE}'..."
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY RUN] Would create namespace: ${NAMESPACE}"
        else
            kubectl apply -f "${K8S_DIR}/namespace.yaml"
            log_success "Namespace '${NAMESPACE}' created"
        fi
    fi
}

# Docker 이미지 빌드
build_image() {
    if [[ "${SKIP_BUILD}" == "true" ]]; then
        log_info "Skipping Docker image build"
        return
    fi
    
    log_info "Building Docker image..."
    local image_name="${REGISTRY_URL}/${PROJECT_NAME}:${IMAGE_TAG}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would build image: ${image_name}"
    else
        if [[ -f "./scripts/build-docker.sh" ]]; then
            ./scripts/build-docker.sh -v "${IMAGE_TAG}" -r "${REGISTRY_URL}" -p "${PROJECT_NAME}"
        else
            log_warning "build-docker.sh not found, building manually..."
            docker build -t "${image_name}" .
            docker push "${image_name}"
        fi
        log_success "Docker image built and pushed: ${image_name}"
    fi
}

# 매니페스트 파일 업데이트
update_manifests() {
    log_info "Updating manifest files with image tag: ${IMAGE_TAG}"
    
    local temp_dir=$(mktemp -d)
    cp -r "${K8S_DIR}" "${temp_dir}/"
    
    # deployment.yaml에서 이미지 태그 업데이트
    if [[ -f "${temp_dir}/k8s/deployment.yaml" ]]; then
        sed -i.bak "s|${REGISTRY_URL}/${PROJECT_NAME}:latest|${REGISTRY_URL}/${PROJECT_NAME}:${IMAGE_TAG}|g" "${temp_dir}/k8s/deployment.yaml"
        rm "${temp_dir}/k8s/deployment.yaml.bak" 2>/dev/null || true
    fi
    
    echo "${temp_dir}/k8s"
}

# 애플리케이션 배포
deploy_app() {
    log_info "Deploying ImageHub Dashboard..."
    
    local manifest_dir=$(update_manifests)
    
    # 배포 순서
    local files=(
        "namespace.yaml"
        "configmap.yaml"
        "deployment.yaml"
        "service.yaml"
        "ingress.yaml"
        "hpa.yaml"
    )
    
    for file in "${files[@]}"; do
        local file_path="${manifest_dir}/${file}"
        if [[ -f "${file_path}" ]]; then
            log_info "Applying ${file}..."
            if [[ "${DRY_RUN}" == "true" ]]; then
                log_info "[DRY RUN] Would apply: ${file}"
                kubectl apply -f "${file_path}" --dry-run=client -o yaml
            else
                kubectl apply -f "${file_path}"
                log_success "Applied ${file}"
            fi
        else
            log_warning "File not found: ${file_path}"
        fi
    done
    
    # 임시 디렉토리 정리
    rm -rf "${manifest_dir}"
    
    if [[ "${DRY_RUN}" != "true" ]]; then
        log_success "Deployment completed!"
        show_status
    fi
}

# 애플리케이션 삭제
delete_app() {
    log_warning "Deleting ImageHub Dashboard..."
    
    read -p "Are you sure you want to delete the application? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deletion cancelled"
        return
    fi
    
    # 삭제 순서 (배포의 역순)
    local files=(
        "hpa.yaml"
        "ingress.yaml"
        "service.yaml"
        "deployment.yaml"
        "configmap.yaml"
    )
    
    for file in "${files[@]}"; do
        local file_path="${K8S_DIR}/${file}"
        if [[ -f "${file_path}" ]]; then
            log_info "Deleting resources from ${file}..."
            kubectl delete -f "${file_path}" --ignore-not-found=true
        fi
    done
    
    # 네임스페이스는 별도 확인 후 삭제
    read -p "Do you also want to delete the namespace '${NAMESPACE}'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete namespace "${NAMESPACE}" --ignore-not-found=true
        log_success "Namespace '${NAMESPACE}' deleted"
    fi
    
    log_success "Application deleted!"
}

# 배포 상태 확인
show_status() {
    log_info "Checking deployment status..."
    
    echo ""
    echo "=== Namespace ==="
    kubectl get namespace "${NAMESPACE}" 2>/dev/null || echo "Namespace not found"
    
    echo ""
    echo "=== Deployments ==="
    kubectl get deployments -n "${NAMESPACE}" 2>/dev/null || echo "No deployments found"
    
    echo ""
    echo "=== Pods ==="
    kubectl get pods -n "${NAMESPACE}" 2>/dev/null || echo "No pods found"
    
    echo ""
    echo "=== Services ==="
    kubectl get services -n "${NAMESPACE}" 2>/dev/null || echo "No services found"
    
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n "${NAMESPACE}" 2>/dev/null || echo "No ingress found"
    
    echo ""
    echo "=== HPA ==="
    kubectl get hpa -n "${NAMESPACE}" 2>/dev/null || echo "No HPA found"
    
    echo ""
    log_info "Status check completed"
}

# 애플리케이션 로그 보기
show_logs() {
    log_info "Showing application logs..."
    kubectl logs -n "${NAMESPACE}" -l app=imagehub-dashboard --tail=100 -f
}

# 배포 재시작
restart_app() {
    log_info "Restarting deployment..."
    kubectl rollout restart deployment/imagehub-dashboard -n "${NAMESPACE}"
    kubectl rollout status deployment/imagehub-dashboard -n "${NAMESPACE}"
    log_success "Deployment restarted!"
}

# 명령행 인수 파싱
COMMAND="deploy"
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY_URL="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        deploy|delete|status|logs|restart)
            COMMAND="$1"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# 메인 실행
main() {
    log_info "=== ImageHub Dashboard Kubernetes Deployment ==="
    log_info "Command: ${COMMAND}"
    log_info "Namespace: ${NAMESPACE}"
    log_info "Image Tag: ${IMAGE_TAG}"
    log_info "Registry: ${REGISTRY_URL}"
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "Mode: DRY RUN"
    fi
    log_info "=============================================="
    
    check_kubectl
    check_cluster_connection
    
    case "${COMMAND}" in
        deploy)
            ensure_namespace
            build_image
            deploy_app
            ;;
        delete)
            delete_app
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        restart)
            restart_app
            ;;
        *)
            log_error "Unknown command: ${COMMAND}"
            usage
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"