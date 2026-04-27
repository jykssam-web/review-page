# 교사용 프로그램 리뷰 페이지

범용 리뷰 페이지로, 모든 교사용 프로그램의 사용 후기를 받습니다.

## 기능

- ✅ URL 파라미터(`?program=campusnotice`)로 프로그램 구분
- ✅ 다크모드 디자인 (#111111 배경)
- ✅ 모바일 완전 반응형
- ✅ Firebase Firestore 자동 저장
- ✅ 학교명(선택), 선생님 이름(필수), 평가점수(1-10), 리뷰 내용(필수)

## 사용 예시

```
https://review-page-production.vercel.app/?program=campusnotice
https://review-page-production.vercel.app/?program=mealplan
https://review-page-production.vercel.app/?program=attendance
```

## 저장되는 데이터 (Firebase Firestore)

```
컬렉션: reviews
{
  program: "campusnotice",
  schoolName: "OO고등학교" 또는 "미입력",
  maskedTeacherName: "김선생님",
  rating: 8,
  content: "리뷰 내용...",
  timestamp: 2024-04-27T12:34:56Z,
  isPublic: false,
  isHighlight: false
}
```

## 로컬 개발

```bash
npm install
npm start
```

## 배포 (Vercel)

### 방법 1: GitHub 연동 (권장)

1. GitHub에 리포지토리 생성
2. 로컬 코드를 GitHub에 push
3. [Vercel](https://vercel.com)에서 GitHub 계정 연결
4. "Import Project" → GitHub 리포지토리 선택
5. 배포 완료 (자동으로 URL 생성)

### 방법 2: Vercel CLI

```bash
npm i -g vercel
vercel
# 프롬프트에 따라 입력
```

## 프로그램 추가

`src/config.js`의 `PROGRAM_CONFIG`에 새 프로그램 추가:

```javascript
export const PROGRAM_CONFIG = {
  campusnotice: {
    name: '학사공지',
    description: '학사공지 프로그램',
    color: '#007AFF'
  },
  newprogram: {  // 새 프로그램
    name: '새 프로그램',
    description: '설명',
    color: '#FF9500'
  }
};
```

그 후:
```
https://review-page-production.vercel.app/?program=newprogram
```

## 환경변수

Firebase 설정은 `src/firebase.js`에 하드코딩되어 있습니다.
(공개 프로젝트이므로 안전)

## 스타일 커스터마이징

`src/ReviewPage.css`에서 수정:
- 배경색: `background-color: #111111`
- 버튼 색: `background-color: #007AFF`
- 폰트 크기/색상 조정 가능

## 문제 해결

### Firebase 저장 안 됨
1. Firestore 규칙 확인 (쓰기 허가)
2. 네트워크 연결 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 배포 실패
1. `npm run build` 로컬에서 성공하는지 확인
2. Node 버전 확인 (18+ 권장)
3. Vercel 대시보드에서 배포 로그 확인

## 라이센스

프라이빗 프로젝트
