# 🚀 Vercel 배포 가이드

## 📋 사전 준비

1. **GitHub 계정** 필요
2. **Vercel 계정** (GitHub으로 무료 가입 가능)

## 단계별 배포

### Step 1: GitHub 리포지토리 생성

1. [github.com](https://github.com)에서 로그인
2. **New repository** 클릭
3. Repository name: `review-page` 입력
4. **Public** 선택 (권장) 또는 Private
5. **Create repository** 클릭

### Step 2: 로컬에서 GitHub에 Push

```bash
cd review-page

# Git 초기화
git init

# GitHub remote 추가 (YOUR_USERNAME 및 REPO_NAME 수정)
git remote add origin https://github.com/YOUR_USERNAME/review-page.git

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Review page"

# GitHub에 push
git branch -M main
git push -u origin main
```

### Step 3: Vercel에서 배포

1. [vercel.com](https://vercel.com)에서 **Sign Up** (GitHub로 가입)
2. **GitHub 계정 연결** 허용
3. **Add New** → **Project** 클릭
4. **Import Git Repository** 선택
5. 위에서 만든 `review-page` 리포지토리 선택
6. **Create React App** 프레임워크 자동 감지됨
7. **Deploy** 버튼 클릭

### Step 4: 배포 완료 ✅

Vercel이 자동으로:
- 코드 빌드
- 호스팅 시작
- URL 생성 (예: `https://review-page-abc123.vercel.app`)

## 🔗 사용 URL

배포 완료 후 다음 URL로 프로그램별 리뷰 페이지 접근:

```
https://review-page-abc123.vercel.app/?program=campusnotice
https://review-page-abc123.vercel.app/?program=mealplan
https://review-page-abc123.vercel.app/?program=attendance
```

(실제 배포 후 자신의 URL로 변경)

## 🔄 업데이트 방법

코드 수정 후:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: description"

# GitHub에 push
git push

# Vercel이 자동으로 재배포 (2-3분 소요)
```

Vercel 대시보드에서 실시간으로 배포 진행 상황 확인 가능

## 🛠️ 로컬 테스트 (배포 전)

```bash
# 프로젝트 디렉토리로 이동
cd review-page

# 의존성 설치
npm install

# 로컬 서버 시작
npm start

# http://localhost:3000/?program=campusnotice 로 접근
```

## 📝 프로그램 추가

새 프로그램 리뷰 페이지 추가하려면:

1. `src/config.js` 열기
2. `PROGRAM_CONFIG` 객체에 추가:

```javascript
export const PROGRAM_CONFIG = {
  campusnotice: {
    name: '학사공지',
    description: '학사공지 프로그램',
    color: '#007AFF'
  },
  mynewprogram: {  // 여기 추가
    name: '새 프로그램명',
    description: '설명',
    color: '#FF9500'
  }
};
```

3. GitHub에 push
4. 자동으로 재배포됨
5. 새 URL: `https://review-page-abc123.vercel.app/?program=mynewprogram`

## 🔐 보안

- Firebase API key가 공개되어 있습니다 (공개 프로젝트이므로 안전)
- Firestore 규칙에서 `reviews` 컬렉션 쓰기 허가 필요

### Firestore 규칙 설정

Firebase 콘솔 → Firestore 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;  // 누구나 리뷰 작성 가능
      allow update, delete: if request.auth != null;
    }
  }
}
```

## ❓ 트러블슈팅

### 배포 실패

**오류: "Build failed"**
```bash
# 로컬에서 빌드 테스트
npm run build

# 오류 메시지 확인 후 수정
```

**오류: "Firebase initialization failed"**
- Vercel 환경변수 설정 필요 (선택사항)
- 현재는 하드코딩되어 있어 추가 설정 불필요

### Firebase 저장 안 됨

1. **Firestore 규칙 확인**: 위의 규칙 설정 적용
2. **콘솔 오류 확인**: F12 → Console 탭에서 오류 메시지 확인
3. **네트워크 연결**: 인터넷 연결 확인

### 페이지 로딩 느림

- Vercel은 무료 플랜이 충분히 빠릅니다
- 브라우저 캐시 지우기 (Ctrl+Shift+Delete)

## 📊 리뷰 데이터 확인

Firebase 콘솔에서:
1. [firebase.google.com](https://firebase.google.com) 로그인
2. `gen-lang-client-0617105081` 프로젝트 선택
3. Firestore Database → `reviews` 컬렉션
4. 저장된 리뷰 실시간 확인

## ✨ 다음 단계

- [ ] GitHub에 리포지토리 생성
- [ ] Vercel에서 배포
- [ ] 배포 URL 확인
- [ ] 로컬에서 `?program=campusnotice` URL 테스트
- [ ] Firebase 규칙 설정
- [ ] 실제 사용 시작

질문이 있으시면 이 가이드를 참고하세요!
