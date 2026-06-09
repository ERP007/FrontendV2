# Fallguys 프론트엔드 작업 가이드 (AGENTS.md)

> ERP 시스템 프론트엔드. **Claude Code / Codex 등 AI 에이전트와 팀원 4명**이 함께 따르는 규칙입니다.
> 코드를 만들기 전에 이 문서를 먼저 확인하세요. 대부분의 코드는 AI로 작성하므로, 이 문서는 "참고 사항"이 아니라 **반드시 지켜야 하는 규칙**입니다.

---

## 0. 코드 짜기 전 매번 확인할 3가지 (가장 중요)

AI는 이미 있는 걸 안 찾아보고 새로 만드는 경향이 있습니다. 그래서 항상:

1. **공용 컴포넌트가 이미 있는지 먼저 확인.** `shared/ui`에 `Fg*` 컴포넌트(`FgButton`, `FgInput` 등)가 있으면 **무조건 재사용**합니다. 비슷한 걸 새로 만들지 않습니다.
2. **디자인 토큰이 이미 있는지 먼저 확인.** 색·폰트는 `tailwind.config`에 정의된 토큰 클래스(`bg-primary`, `text-body`)만 씁니다. `#3B82F6`, `text-[14px]` 같은 **하드코딩 금지**.
3. **데이터와 화면을 한 파일에 섞지 않기.** 데이터 가져오기/가공은 `api`·`model`에, 화면은 `ui`에. (자세한 건 2번 섹션)

---

## 1. 기술 스택 (= 승인된 라이브러리 목록)

아래 목록에 **없는 라이브러리는 함부로 설치하지 마세요.** 새 라이브러리가 필요하면 먼저 팀에 제안합니다.

| 용도                      | 사용                                            |
| ------------------------- | ----------------------------------------------- |
| Framework                 | React + TypeScript (strict)                     |
| Build / Dev               | Vite                                            |
| 서버 데이터 (API)         | **TanStack Query**                              |
| 전역 상태 (진짜 전역만)   | **Zustand**                                     |
| 라우팅                    | **TanStack Router**                             |
| HTTP 클라이언트           | **axios** (`shared/api` 단일 인스턴스)          |
| 스타일                    | **Tailwind CSS** (handoff 토큰 기반)            |
| 공용 컴포넌트 동작/접근성 | **Radix UI** (스타일 없는 프리미티브)           |
| 폼                        | **react-hook-form + zod + @hookform/resolvers** |
| 알림(toast)               | **sonner**                                      |
| 표                        | **TanStack Table**                              |
| 날짜 처리                 | **dayjs**                                       |
| 날짜 선택                 | **react-day-picker**                            |
| 차트                      | **Recharts**                                    |
| 아이콘                    | **lucide-react**                                |

> 테스트, 다국어(i18n), 테이블 가상화, 엑셀 내보내기(프론트)는 **지금 도입하지 않습니다.** 엑셀 내보내기는 백엔드에서 파일을 생성해 내려줍니다.

---

## 2. 핵심 원칙: Data 영역과 Presentation 영역 분리

이 프로젝트에서 가장 중요한 규칙입니다. **데이터(가져오기·가공·상태)와 화면(렌더링)을 한 파일에 섞지 않습니다.**

| 영역             | 책임                            | 위치             |
| ---------------- | ------------------------------- | ---------------- |
| **Data**         | API 호출, 캐시, 타입, 가공 로직 | `api/`, `model/` |
| **Presentation** | 화면 그리기, 레이아웃, 스타일   | `ui/`            |

규칙을 한 문장으로: **`ui/` 컴포넌트는 "어떻게 보일지"만 알고, 데이터는 `model/`의 훅을 통해 받기만 한다.**

- `ui/` 컴포넌트 안에서 `axios`나 `useQuery`를 **직접 호출하지 않습니다.** 대신 `api`/`model`의 훅을 호출합니다.
- 데이터 계산·가공 로직은 컴포넌트 안에 두지 말고 `model/`로 뺍니다.

```tsx
// ❌ 나쁜 예: 화면 안에서 데이터를 직접 가져옴
function OrderList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { axios.get('/api/orders').then(r => setOrders(r.data)); }, []);
  return <ul>{orders.map(...)}</ul>;
}

// ✅ 좋은 예: 데이터는 훅(model)에서, 화면은 받기만
function OrderList() {
  const { data, isLoading } = useOrdersQuery();   // data 영역
  if (isLoading) return <FgSpinner />;
  return <ul>{data?.map(...)}</ul>;                // presentation
}
```

---

## 3. 폴더 구조

레이어는 4개뿐입니다. 각 기능 폴더 안에서 `api / model / ui`로 나눕니다.

```
src/
├── app/                  # 앱 시작점: provider, 라우터 설정, 권한 가드, 전역 스타일
│
├── pages/                # 라우트별 화면. 역할군으로 나눔
│   ├── admin/            # ADMIN 전용 화면
│   ├── hq/               # 본사(HQ_MANAGER, HQ_STAFF) 화면
│   └── branch/           # 지점(BRANCH_MANAGER, BRANCH_STAFF) 화면
│
├── features/             # 도메인 기능 단위 (예: order, member, inventory)
│   └── order/
│       ├── api/          # [data] axios 호출 + useQuery / useMutation
│       ├── model/        # [data] 타입, 가공 훅
│       ├── ui/           # [presentation] 컴포넌트 (.tsx)
│       └── index.ts      # 외부로 내보낼 것만 모음 (public API)
│
└── shared/               # 어디서나 쓰는 공통
    ├── ui/               # Fg 공용 컴포넌트 (FgButton, FgInput ...)
    ├── api/              # axios 인스턴스, 인터셉터, 공통 에러 타입
    ├── lib/              # 순수 유틸 (날짜 포맷 등), 권한 헬퍼
    ├── config/           # 환경변수 읽기, 상수
    └── types/            # 공용 타입
```

**import 규칙 (간단 버전):**

- `pages` → `features` → `shared` 방향으로만 import 합니다. (위에서 아래로)
- `features`끼리 서로 import 하지 않습니다. 공통이 필요하면 `shared`로 뺍니다.
- 기능 폴더 바깥에서 가져다 쓸 땐 `index.ts`를 통합니다. (`features/order/ui/Form.tsx`처럼 내부 파일 직접 import 금지)

---

## 4. Data 영역 (`api/`, `model/`)

- 서버 데이터는 **전부 TanStack Query**로 다룹니다. `useState` + `useEffect` 수동 패칭 금지.
- 조회는 `useXxxQuery`, 변경은 `useXxxMutation`으로 이름 짓습니다.
- 원시 HTTP 호출은 **`shared/api`의 axios 인스턴스만** 사용합니다. 컴포넌트에서 `axios`를 직접 부르지 않습니다.
- 타입은 사용하는 기능 폴더의 `model/`에 두고, 여러 곳에서 공용일 때만 `shared/types`로 옮깁니다.

```ts
// features/order/api/use-orders-query.ts
import { api } from "@/shared/api";

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get<Order[]>("/orders");
      return res.data;
    },
  });
}
```

---

## 5. Presentation 영역 (`ui/`) & 공용 컴포넌트

### `ui/` 규칙

- 컴포넌트는 **props와 model 훅의 반환값**만으로 그립니다.
- 데이터 패칭과 화면을 같이 해야 하면, **데이터를 가져오는 부분 + 그리는 순수 컴포넌트**로 나눕니다.
- 스타일은 컴포넌트 옆에 둡니다. (Tailwind 클래스로 직접 작성)

### 공용 컴포넌트는 `Fg` 접두사

- 팀에서 반복해서 쓰는 버튼/입력/모달 등은 `shared/ui`에 **`Fg` 접두사**로 만듭니다: `FgButton`, `FgInput`, `FgModal`, `FgSelect`, `FgDatePicker`.
- **동작·접근성은 Radix UI 프리미티브로, 디자인은 handoff 토큰(Tailwind)으로** 입힙니다. 모달·드롭다운·셀렉트를 맨손으로 만들지 마세요(키보드·포커스 버그가 납니다).
- shadcn/ui 레시피를 복사해 와서 이름을 `Fg*`로 바꾸고, 색·폰트만 우리 토큰으로 맞추는 방식이 가장 안전합니다.
- **MUI·Ant Design 같은 "스타일까지 입힌 통짜 UI 라이브러리는 쓰지 않습니다.** handoff 디자인과 충돌합니다.

### Tailwind 사용 규칙 (쉽게 가기)

- 색·간격·폰트는 `tailwind.config`의 **토큰 클래스만** 사용: `bg-primary`, `text-danger`, `text-body`, `rounded-card` 등.
- `#3B82F6`, `text-[13px]`, `mt-[7px]` 같은 **임의 값 하드코딩 금지.** 필요한 토큰이 없으면 먼저 `tailwind.config`에 추가하고 씁니다.
- handoff 파일에 있는 color/font는 `tailwind.config`의 `theme.extend`에 등록해 두고 모두 그걸 씁니다.

---

## 6. 인증 (세션 / 쿠키 기반)

- 세션은 서버가 **HttpOnly 쿠키**로 관리합니다. **토큰·인증정보를 `localStorage` 등 클라이언트에 저장하지 않습니다.** (XSS 방어)
- axios 인스턴스에 **`withCredentials: true`** 를 설정해 쿠키가 자동 전송되게 합니다.
- **로그인 여부의 단일 출처는 서버**입니다. `useMeQuery()`(`/me` 같은 엔드포인트) 결과로 판단하고, 이 값을 Zustand에 중복 저장하지 않습니다.
- 백엔드가 CSRF 토큰을 쓰면 요청 인터셉터에서 자동으로 붙입니다.

```ts
// shared/api/index.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 예: '/api'
  withCredentials: true,
});
```

---

## 7. 역할 / 권한 (RBAC)

역할은 5가지: `ADMIN`, `HQ_MANAGER`, `HQ_STAFF`, `BRANCH_MANAGER`, `BRANCH_STAFF`.

화면은 **역할군별로 통째로 다릅니다.** 두 단계로 처리합니다.

1. **라우트 가드 (역할군 단위 접근 차단)** — `app`에서 라우트를 보호합니다. 권한 없는 역할이 `pages/admin`에 들어오면 차단/리다이렉트.
2. **화면 안의 세부 차이 (예: HQ 화면에서 MANAGER만 보이는 버튼)** — 가장 단순하게 역할 비교로 처리합니다.

```tsx
const { role } = useAuth(); // useMeQuery 기반
{
  role === "HQ_MANAGER" && <FgButton>승인</FgButton>;
}
```

> 처음부터 `<Can permission="...">` 같은 복잡한 추상화를 만들지 않습니다. 위 방식으로 시작하고, 중복이 많이 쌓이면 그때 `shared/lib`에 헬퍼로 묶습니다.
>
> **중요:** 프론트의 권한 체크는 **화면을 깔끔하게 보여주기 위한 것(UX)**일 뿐입니다. **진짜 접근 차단은 백엔드가 합니다.** 프론트에서 버튼을 숨겼다고 보안이 되는 게 아닙니다.

---

## 8. 예외 처리 (전역 + 지역)

백엔드(Spring Boot)는 에러를 다음 형태로 내려줍니다:

```ts
// shared/api/error.ts
export interface ApiError {
  status: number; // 400, 401, 403 ...
  code: string; // 예: "SO-03-01"
  message: string; // 사용자에게 보여줄 메시지
}
```

처리는 **전역**과 **지역**으로 나눕니다.

### 전역 (axios 인터셉터에서 일괄 처리)

- **401** → 쿼리 캐시 비우고 로그인 페이지로 리다이렉트.
- **403** → 권한 없음 안내 (toast 또는 안내 페이지).
- 그 외 처리되지 않은 에러 → sonner toast로 `message` 표시.

```ts
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      /* 캐시 clear 후 로그인 이동 */
    }
    if (status === 403) {
      /* 권한 없음 안내 */
    }
    // ApiError 형태로 통일해서 다시 던짐 → 화면에서 받을 수 있게
    return Promise.reject(error.response?.data as ApiError);
  },
);
```

### 지역 (화면에서 처리 — 주로 입력 폼의 400)

- **400 같은 입력 검증 에러**는 인터셉터가 가로채지 않고 그대로 던져집니다. 호출한 화면(폼)에서 받아 처리합니다.
- 백엔드 응답에 **"어느 필드에서 난 에러인지"는 없습니다.** 그래서 필드별로 붙이지 않고, **`message`를 폼 상단에 통째로 보여줍니다.**

```tsx
const [formError, setFormError] = useState<string | null>(null);

const onSubmit = handleSubmit(async (values) => {
  setFormError(null);
  try {
    await createOrder(values);
    toast.success("저장되었습니다");
  } catch (e) {
    setFormError((e as ApiError).message); // 폼 상단에 표시
  }
});
```

---

## 9. 폼

- 입력이 여러 개거나 검증이 필요한 화면은 **react-hook-form + zod**를 씁니다. (`@hookform/resolvers/zod`)
- 입력이 1~2개로 아주 단순하면 `useState`로 처리해도 됩니다. 무조건 폼 라이브러리를 쓸 필요는 없습니다.
- 검증 규칙(zod 스키마)은 해당 기능의 `model/`에 둡니다.

---

## 10. 알림 (sonner)

- 사용자 알림은 **sonner** 하나로 통일합니다. 다른 toast 라이브러리를 추가하지 않습니다.
- 성공: `toast.success('저장되었습니다')`, 실패: `toast.error(message)`.
- 에러 toast는 8번의 전역 처리와 연결됩니다. 화면마다 따로 에러 toast를 띄우기보다 일관된 방식을 따릅니다.

---

## 11. 환경변수 & 보안

- 프론트엔드 빌드 결과는 브라우저로 그대로 내려갑니다. **`.env`는 비밀 보관소가 아닙니다.** 여기 넣은 값은 사용자가 다 볼 수 있습니다.
- 그래서 **API 키 같은 진짜 비밀은 프론트에 두지 않고 백엔드에 둡니다.**
- Vite에서는 **`VITE_` 접두사**가 붙은 변수만 코드에서 읽힙니다: `import.meta.env.VITE_API_BASE_URL`.
- `.gitignore`에 **`.env` 추가**, 대신 키 이름만 적힌 **`.env.example`을 커밋**해 팀원이 무엇을 채워야 하는지 알게 합니다.

```bash
# .env.example
VITE_API_BASE_URL=
```

---

## 12. 배포 (Vercel) & 로컬 개발

- 프론트와 API가 **같은 도메인**(nginx + gateway로 `/api` 호출)이라 세션 쿠키 문제가 없습니다.
- **Vercel (SPA)**: 새로고침 시 라우트가 깨지지 않도록 `vercel.json`에 rewrite를 둡니다. 환경변수는 Vercel 대시보드에 등록합니다.

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **로컬 개발**: 프론트(`localhost:5173`)와 API 도메인이 달라 쿠키·CORS에서 막히기 쉽습니다. `vite.config`의 **dev proxy**로 `/api`를 백엔드로 넘겨 "같은 출처"처럼 만듭니다.

```ts
// vite.config.ts (server 옵션)
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
  },
}
```

---

## 13. 네이밍 & TypeScript

- **폴더·일반 파일**: `kebab-case` (`use-orders-query.ts`)
- **컴포넌트 파일**: `PascalCase.tsx` (`OrderList.tsx`), 공용 컴포넌트는 `Fg` 접두사
- **훅**: `useXxx` / **타입**: `PascalCase` / **상수**: `UPPER_SNAKE_CASE`
- import는 절대경로(`@/features/...`)를 씁니다. `../../../` 지양.
- `strict: true`, **`any` 금지** (모르면 `unknown` 후 좁히기). 컴포넌트 props와 API 응답 타입은 명시합니다.

---

## 14. 협업 (4명)

- 작업은 **기능(feature) 단위로** 나눠 충돌을 줄입니다. 한 기능은 한 사람이 맡는 걸 기본으로 합니다.
- `shared/`(특히 `shared/ui`, `shared/api`) 변경은 전원에게 영향을 주므로, 수정 시 영향 범위를 공유합니다.
- (브랜치·커밋 규칙은 팀 내 별도 규약을 따릅니다.)

---

## 15. AI에게 작업 시킬 때 (vibe coding 팁)

일관된 결과를 얻으려면 지시할 때 위치와 재사용을 명시하세요. 예시:

- "주문 목록 화면 만들어줘. `features/order`에 `api`/`model`/`ui`로 나누고, 표는 TanStack Table, 버튼·입력은 `shared/ui`의 `Fg` 컴포넌트 재사용해줘."
- "이 입력 폼 react-hook-form + zod로 만들고, 에러는 폼 상단에 message로 보여줘."
- "이 색이랑 폰트, `tailwind.config` 토큰에 없으면 먼저 추가하고 토큰 클래스로 써줘. 하드코딩하지 마."

AI가 새 컴포넌트나 라이브러리를 만들려 하면, **이미 있는 `Fg` 컴포넌트나 승인된 라이브러리(1번 표)로 대체 가능한지 먼저 확인**하라고 지시하세요.
