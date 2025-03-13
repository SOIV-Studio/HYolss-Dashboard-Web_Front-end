# Cloudflare Pages 배포 가이드

이 문서는 SOIV Studio 웹사이트를 Cloudflare Pages에 배포하는 방법을 설명합니다.

## 사전 준비

1. [Cloudflare 계정](https://dash.cloudflare.com/sign-up)이 필요합니다.
2. GitHub 또는 GitLab 계정에 이 프로젝트가 저장되어 있어야 합니다.

## 배포 단계

### 1. Cloudflare Pages 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인합니다.
2. 왼쪽 사이드바에서 "Pages"를 클릭합니다.
3. "Create a project" 버튼을 클릭합니다.
4. "Connect to Git"을 선택하고 GitHub 또는 GitLab 계정에 연결합니다.
5. 이 프로젝트의 저장소를 선택합니다.

### 2. 빌드 설정 구성

프로젝트 설정 페이지에서 다음과 같이 빌드 설정을 구성합니다:

- **프로젝트 이름**: `soiv-studio-website` (또는 원하는 이름)
- **프로덕션 브랜치**: `main` (또는 사용 중인 기본 브랜치)
- **빌드 설정**:
  - **프레임워크 프리셋**: `None`
  - **빌드 명령어**: `npm run build`
  - **빌드 출력 디렉토리**: `dist`
  - **루트 디렉토리**: (비워두기)

### 3. 환경 변수 (선택 사항)

필요한 경우 환경 변수를 추가할 수 있습니다. 현재 프로젝트에서는 필요하지 않습니다.

### 4. 배포 시작

"Save and Deploy" 버튼을 클릭하여 배포를 시작합니다. Cloudflare가 자동으로 프로젝트를 빌드하고 배포합니다.

## 커스텀 도메인 설정 (선택 사항)

배포가 완료된 후 커스텀 도메인을 설정할 수 있습니다:

1. 프로젝트 페이지에서 "Custom domains" 탭을 클릭합니다.
2. "Set up a custom domain" 버튼을 클릭합니다.
3. 사용할 도메인을 입력하고 지시에 따라 설정을 완료합니다.

## 지속적 배포

GitHub 또는 GitLab 저장소에 변경 사항을 푸시할 때마다 Cloudflare Pages는 자동으로 새 버전을 빌드하고 배포합니다.

## 로컬 테스트

배포하기 전에 로컬에서 빌드를 테스트하려면 다음 명령어를 실행합니다:

```bash
npm run build
npx wrangler pages dev dist
```

이렇게 하면 로컬 개발 서버가 시작되고 빌드된 사이트를 미리 볼 수 있습니다.

## 문제 해결

배포 중 문제가 발생하면 Cloudflare Pages 대시보드에서 빌드 로그를 확인하세요. 대부분의 오류는 빌드 명령어나 출력 디렉토리 설정과 관련이 있습니다.