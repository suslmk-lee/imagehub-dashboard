# ImageHub Dashboard - kps-hub 네임스페이스 배포

이 디렉토리는 ImageHub Dashboard를 기존 `kps-hub` 네임스페이스에 배포하기 위한 Kubernetes 매니페스트 파일들을 포함합니다.

## 배포 구조

### 기존 구조
- **네임스페이스**: `kps-hub`
- **기존 서비스**: `kps-public-image-hub-service:8095` (루트 경로 `/`)
- **도메인**: `hub.27.96.159.239.nip.io`
- **TLS**: `kps-hub-tls` 시크릿 사용

### 추가 구조
- **새 서비스**: `imagehub-dashboard-service:80`
- **새 경로**: `/dashboard`
- **접속 URL**: `https://hub.27.96.159.239.nip.io/dashboard`

## 파일 구조

```
k8s/update/
├── configmap.yaml        # ConfigMap 및 Secret
├── deployment.yaml       # Deployment 설정
├── service.yaml          # Service 설정
├── hpa.yaml             # HPA 및 PDB 설정
├── ingress-patch.yaml   # 기존 Ingress에 패스 추가용 패치
├── ingress-complete.yaml # 완전한 Ingress 설정 (대체용)
├── deploy.sh           # 자동 배포 스크립트
└── README.md           # 이 파일
```

## 배포 방법

### 방법 1: 자동 배포 스크립트 사용 (권장)

```bash
# 실행 권한 부여 (이미 완료됨)
chmod +x k8s/update/deploy.sh

# 배포 실행
./k8s/update/deploy.sh
```

### 방법 2: 수동 배포

```bash
# 1. ConfigMap 및 Secret 배포
kubectl apply -f k8s/update/configmap.yaml

# 2. Deployment 배포
kubectl apply -f k8s/update/deployment.yaml

# 3. Service 배포
kubectl apply -f k8s/update/service.yaml

# 4. HPA 및 PDB 배포
kubectl apply -f k8s/update/hpa.yaml

# 5. Ingress 업데이트 (둘 중 하나 선택)
# 옵션 A: 기존 Ingress에 패스만 추가
kubectl patch ingress kps-public-image-hub-ingress -n kps-hub --patch-file k8s/update/ingress-patch.yaml

# 옵션 B: 완전한 Ingress로 대체
kubectl apply -f k8s/update/ingress-complete.yaml
```

## Ingress 업데이트 옵션

### 옵션 1: Patch 방식 (권장)
기존 Ingress를 유지하면서 새로운 패스만 추가합니다.

```bash
kubectl patch ingress kps-public-image-hub-ingress -n kps-hub --patch-file k8s/update/ingress-patch.yaml
```

### 옵션 2: 완전 대체 방식
기존 Ingress를 완전히 새로운 설정으로 대체합니다.

```bash
kubectl apply -f k8s/update/ingress-complete.yaml
```

## 주요 설정 변경사항

### ConfigMap (`configmap.yaml`)
- **네임스페이스**: `kps-hub`로 변경
- **ALLOWED_ORIGINS**: kps-hub 도메인 추가

### Deployment (`deployment.yaml`)
- **네임스페이스**: `kps-hub`로 변경
- **이미지**: `harbor.27.96.159.239.nip.io/kpaas/imagehub-dashboard:latest`
- **리소스**: CPU 100m-500m, Memory 128Mi-512Mi
- **레플리카**: 2개
- **헬스체크**: `/api/health` 엔드포인트 사용

### Service (`service.yaml`)
- **네임스페이스**: `kps-hub`로 변경
- **포트**: 80 (HTTP), 443 (HTTPS) → 3000 (컨테이너)
- **헤드리스 서비스**: 직접 Pod 접근용

### Ingress 설정
- **기존 경로**: `/` → `kps-public-image-hub-service:8095`
- **새 경로**: `/dashboard` → `imagehub-dashboard-service:80`
- **우선순위**: `/dashboard`가 `/`보다 먼저 매칭되도록 설정

## 배포 후 확인

```bash
# Pod 상태 확인
kubectl get pods -n kps-hub -l app=imagehub-dashboard

# 서비스 확인
kubectl get svc -n kps-hub -l app=imagehub-dashboard

# Ingress 확인
kubectl get ingress -n kps-hub

# 로그 확인
kubectl logs -n kps-hub -l app=imagehub-dashboard --tail=100
```

## 접속 정보

- **URL**: `https://hub.27.96.159.239.nip.io/dashboard`
- **헬스체크**: `https://hub.27.96.159.239.nip.io/dashboard/api/health`

## 문제 해결

### Pod가 시작되지 않는 경우
```bash
# Pod 상세 정보 확인
kubectl describe pod -n kps-hub -l app=imagehub-dashboard

# 로그 확인
kubectl logs -n kps-hub -l app=imagehub-dashboard
```

### Ingress가 작동하지 않는 경우
```bash
# Ingress 상세 정보 확인
kubectl describe ingress kps-public-image-hub-ingress -n kps-hub

# Nginx Ingress Controller 로그 확인
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### 서비스 연결 문제
```bash
# 서비스 엔드포인트 확인
kubectl get endpoints -n kps-hub -l app=imagehub-dashboard

# 포트 포워딩으로 직접 접근 테스트
kubectl port-forward -n kps-hub svc/imagehub-dashboard-service 8080:80
```

## 롤백

배포를 취소하려면:

```bash
# 리소스 삭제
kubectl delete -f k8s/update/deployment.yaml
kubectl delete -f k8s/update/service.yaml
kubectl delete -f k8s/update/hpa.yaml
kubectl delete -f k8s/update/configmap.yaml

# Ingress에서 패스 제거 (수동으로 편집 필요)
kubectl edit ingress kps-public-image-hub-ingress -n kps-hub
```