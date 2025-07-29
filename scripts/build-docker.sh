#!/bin/bash

# ImageHub Dashboard Docker Build Script
# 이 스크립트는 Docker 이미지를 빌드하고 레지스트리에 푸시합니다.

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
REGISTRY_URL=${REGISTRY_URL:-"hub.27.96.159.239.nip.io"}
PROJECT_NAME=${PROJECT_NAME:-"kpaas/imagehub-dashboard"}
IMAGE_NAME="${REGISTRY_URL}/${PROJECT_NAME}"
VERSION=${VERSION:-$(date +%Y%m%d-%H%M%S)}
DOCKERFILE=${DOCKERFILE:-"Dockerfile"}

# 사용법 출력
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -r, --registry URL     Docker registry URL (default: registry-dev.k-paas.org)"
    echo "  -p, --project NAME     Project name (default: kpaas/imagehub-dashboard)"
    echo "  -v, --version VERSION  Image version tag (default: timestamp)"
    echo "  -f, --file DOCKERFILE  Dockerfile path (default: Dockerfile)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  REGISTRY_URL    Docker registry URL"
    echo "  PROJECT_NAME    Project name"
    echo "  VERSION         Image version"
    echo "  DOCKERFILE      Dockerfile path"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use default values"
    echo "  $0 -v 1.0.0                         # Specify version"
    echo "  $0 -r my-registry.com -p my-app     # Custom registry and project"
}

# 명령행 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY_URL="$2"
            IMAGE_NAME="${REGISTRY_URL}/${PROJECT_NAME}"
            shift 2
            ;;
        -p|--project)
            PROJECT_NAME="$2"
            IMAGE_NAME="${REGISTRY_URL}/${PROJECT_NAME}"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -f|--file)
            DOCKERFILE="$2"
            shift 2
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

# 변수 출력
log_info "=== Docker Build Configuration ==="
log_info "Registry URL: ${REGISTRY_URL}"
log_info "Project Name: ${PROJECT_NAME}"
log_info "Image Name: ${IMAGE_NAME}"
log_info "Version: ${VERSION}"
log_info "Dockerfile: ${DOCKERFILE}"
log_info "=================================="

# Dockerfile 존재 확인
if [[ ! -f "${DOCKERFILE}" ]]; then
    log_error "Dockerfile not found: ${DOCKERFILE}"
    exit 1
fi

# Docker 데몬 확인
if ! docker info >/dev/null 2>&1; then
    log_error "Docker daemon is not running or not accessible"
    exit 1
fi

# 빌드 시작
log_info "Starting Docker build..."

# Docker 이미지 빌드
log_info "Building Docker image: ${IMAGE_NAME}:${VERSION}"
if docker build \
    -f "${DOCKERFILE}" \
    -t "${IMAGE_NAME}:${VERSION}" \
    -t "${IMAGE_NAME}:latest" \
    .; then
    log_success "Docker image built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# 이미지 크기 확인
IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${VERSION}" --format "table {{.Size}}" | tail -n 1)
log_info "Image size: ${IMAGE_SIZE}"

# 레지스트리 로그인 확인 (선택적)
read -p "Do you want to push the image to registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Pushing image to registry..."
    
    # latest 태그 푸시
    if docker push "${IMAGE_NAME}:latest"; then
        log_success "Successfully pushed ${IMAGE_NAME}:latest"
    else
        log_error "Failed to push ${IMAGE_NAME}:latest"
        exit 1
    fi
    
    # 버전 태그 푸시
    if docker push "${IMAGE_NAME}:${VERSION}"; then
        log_success "Successfully pushed ${IMAGE_NAME}:${VERSION}"
    else
        log_error "Failed to push ${IMAGE_NAME}:${VERSION}"
        exit 1
    fi
    
    log_success "All images pushed successfully!"
    
    # 푸시된 이미지 정보 출력
    log_info "=== Pushed Images ==="
    log_info "${IMAGE_NAME}:latest"
    log_info "${IMAGE_NAME}:${VERSION}"
    log_info "===================="
else
    log_info "Skipping push to registry"
fi

# 로컬 이미지 정리 (선택적)
read -p "Do you want to clean up local images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Cleaning up dangling images..."
    docker image prune -f
    log_success "Cleanup completed"
fi

log_success "Docker build process completed!"
log_info "Image: ${IMAGE_NAME}:${VERSION}"