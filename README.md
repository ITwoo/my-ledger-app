# My Ledger App

가계부 관리 웹 애플리케이션입니다. AI 기반 지출 분석과 캘린더 뷰를 통한 거래 관리 기능을 제공합니다.

## 🏗️ 프로젝트 구조

```
my-ledger-app/
├── backend/          # NestJS API 서버
│   └── src/
│       ├── ai/           # AI 분석 모듈
│       ├── transaction/  # 거래 관리 모듈
│       └── app.module.ts
└── frontend/         # Next.js 웹 클라이언트
    └── app/
        ├── ai/           # AI 분석 페이지
        ├── stats/        # 통계 페이지
        └── components/   # UI 컴포넌트
```

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL + TypeORM
- **AI**: LangChain + Google GenAI

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **HTTP**: Axios

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- MySQL (로컬 또는 Docker)

### Backend 실행

```bash
cd backend
npm install
npm run start:dev
```

서버는 `http://localhost:3001`에서 실행됩니다.

### Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

애플리케이션은 `http://localhost:3000`에서 실행됩니다.

## 📱 주요 기능

| 기능 | 설명 |
|------|------|
| **거래 관리** | 수입/지출 내역 CRUD |
| **AI 분석** | AI 기반 지출 패턴 분석 |
| **통계 대시보드** | 월별/연간 통계 시각화 |
| **캘린더 뷰** | 달력 기반 거래 현황 |

## 📂 디렉토리 구조

### Backend API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `POST` | `/transactions` | 거래 생성 |
| `GET` | `/transactions` | 거래 목록 조회 (year, month, day, category, type 쿼리 파라미터) |
| `GET` | `/transactions/statistics` | 통계 조회 (year, month 쿼리 파라미터) |
| `GET` | `/transactions/:id` | 거래 상세 조회 |
| `PUT` | `/transactions/:id` | 거래 수정 |
| `DELETE` | `/transactions/:id` | 거래 삭제 |

### AI API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `POST` | `/ai/parse` | 텍스트를 거래로 파싱 |
| `POST` | `/ai/parse-and-save` | 파싱 후 바로 저장 |
| `GET` | `/ai/analyze?year=&month=` | 지출 분석 (AI) |
| `GET` | `/ai/report?year=&month=` | 리포트 생성 (AI) |

### Frontend 페이지

- `/` — 메인 대시보드
- `/ai` — AI 분석 페이지
- `/stats` — 통계 페이지

## 📦 스크립트

### Backend
```bash
npm run build        # 프로덕션 빌드
npm run start:dev    # 개발 모드
npm run test         # 단위 테스트
```

### Frontend
```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
```

## 📄 라이선스

MIT License