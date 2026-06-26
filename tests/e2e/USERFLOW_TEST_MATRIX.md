# 권한별 Userflow E2E 테스트 매트릭스

이 문서는 프론트 코드의 라우트, 사이드바 권한, 주요 mutation API, 현재 Playwright E2E를 기준으로 작성한 테스트 체크리스트다.

상태 표기:

- `[DONE]`: 현재 Playwright E2E에서 자동 검증 중
- `[GATED]`: 테스트는 있으나 운영 데이터 보호 플래그가 켜져야 실행
- `[TODO]`: 코드상 가능한 흐름이지만 아직 자동화하지 않음
- `[MANUAL]`: 자동화 전 수동 확인 또는 테스트 데이터 정책 결정 필요
- `[N/A]`: 해당 권한에서 허용되지 않는 흐름

## 실행 단위

현재 기본 계정은 3개 role bucket으로 운영한다.

| Bucket | 허용 role | storage state | 현재 테스트 파일 |
| --- | --- | --- | --- |
| Admin | `ADMIN` | `playwright/.auth/admin.json` | `admin-userflow.spec.ts`, `role-access.spec.ts`, `permission-negative.spec.ts` |
| HQ | `ADMIN`, `HQ_MANAGER`, `HQ_STAFF` | `playwright/.auth/hq.json` | `hq-userflow.spec.ts`, `form-validation.spec.ts`, `draft-lifecycle.spec.ts`, `cross-role-*.spec.ts`, `permission-negative.spec.ts` |
| Branch | `BRANCH_MANAGER`, `BRANCH_STAFF` | `playwright/.auth/branch.json` | `branch-userflow.spec.ts`, `form-validation.spec.ts`, `draft-lifecycle.spec.ts`, `cross-role-sales-flow.spec.ts`, `permission-negative.spec.ts` |

세부 권한 분리를 완전히 검증하려면 추후 계정을 추가한다.

| 세부 계정 | 필요한 env |
| --- | --- |
| HQ Manager | `E2E_HQ_MANAGER_USERNAME`, `E2E_HQ_MANAGER_PASSWORD` |
| HQ Staff | `E2E_HQ_STAFF_USERNAME`, `E2E_HQ_STAFF_PASSWORD` |
| Branch Manager | `E2E_BRANCH_MANAGER_USERNAME`, `E2E_BRANCH_MANAGER_PASSWORD` |
| Branch Staff | `E2E_BRANCH_STAFF_USERNAME`, `E2E_BRANCH_STAFF_PASSWORD` |

## 플래그 정책

| Flag | 기본값 | 의미 |
| --- | --- | --- |
| `E2E_ENABLE_MUTATION` | `false` | 판매/구매처럼 운영 데이터에 쓰는 E2E 실행 |
| `E2E_ENABLE_ADMIN_MUTATION` | `false` | 사용자/부품/창고/재고처럼 관리자 변경 E2E 실행 |

관리자 변경 테스트는 두 플래그가 모두 `true`일 때만 실행한다.

## 라우트 접근 매트릭스

| Route | Admin | HQ | Branch | 현재 자동화 |
| --- | --- | --- | --- | --- |
| `/login` | 허용 | 허용 | 허용 | `[DONE]` 비로그인 보호 라우트 접근 시 로그인 흐름 확인 |
| `/` | 홈 redirect | 홈 redirect | 홈 redirect | `[DONE]` role별 초기 홈 redirect 명시 검증 |
| `/users` | 허용 | 차단 | 차단 | `[DONE]` role-access + branch/admin userflow |
| `/dashboard` | 허용 | 허용 | 차단 | `[DONE]` role-access + HQ 대시보드 |
| `/items` | 관리 가능 | 관리 가능 | 읽기 전용 | `[DONE]` Admin/HQ/Branch 목록, Branch 읽기 전용 |
| `/stocks` | 관리 가능 | Manager 관리 가능, Staff 조회 | 조회 | `[DONE]` Admin/HQ/Branch 조회와 버튼 노출 |
| `/stock-movements` | 허용 | 허용 | 허용 | `[DONE]` HQ/Branch 조회 |
| `/warehouses` | 관리 가능 | Manager 관리 가능, Staff 조회 | 조회 가능 라우트, 관리 버튼 비활성 | `[DONE]` Admin/HQ API/버튼, Branch 직접 조회/관리 액션 비활성 |
| `/purchase-orders` | 허용 | 허용 | 차단 | `[DONE]` HQ 목록/상세, Branch 차단 |
| `/purchase-orders/new` | 허용 | 허용 | 차단 | `[DONE]` validation, `[GATED]` 구매 생성은 API 준비 + UI 확정/입고 |
| `/purchase-orders/$poNo` | 허용 | 허용 | 차단 | `[DONE]` 상세 조회, `[GATED]` 확정/입고 |
| `/purchase-orders/$poNo/edit` | 허용 | 허용 | 차단 | `[GATED]` 임시 구매 주문 수정 후 확정 |
| `/sales-orders` | 허용 | 허용 | 차단 | `[DONE]` HQ 목록/상세, Branch 차단 |
| `/sales-orders/$soNo` | 허용 | 허용 | 차단 | `[DONE]` 상세 조회, `[GATED]` 출고 |
| `/sales-orders/$soNo/ship` | 허용 | 허용 | 차단 | `[GATED]` HQ 출고 확정 |
| `/branch/sales-orders` | 차단 | 차단 | 허용 | `[DONE]` Branch 목록/필터, Admin/HQ 차단은 `[TODO]` |
| `/branch/sales-orders/new` | 차단 | 차단 | 허용 | `[DONE]` validation, `[GATED]` API 생성 흐름 있음 |
| `/branch/sales-orders/$soNo` | 차단 | 차단 | 허용 | `[DONE]` 상세 조회, `[GATED]` 취소/입고 |
| `/branch/sales-orders/$soNo/edit` | 차단 | 차단 | 허용 | `[GATED]` 임시저장 수정 후 제출 |
| `/branch/sales-orders/$soNo/arrival` | 차단 | 차단 | 허용 | `[GATED]` Branch 입고 확정 |
| `/my-page` | 허용 | 허용 | 허용 | `[DONE]` 마이페이지 조회 |
| `/mypage` | `/my-page` redirect | `/my-page` redirect | `/my-page` redirect | `[DONE]` legacy redirect |

## 인증/세션

| 시나리오 | Admin | HQ | Branch | 상태 | 파일 |
| --- | --- | --- | --- | --- | --- |
| Keycloak 실제 로그인 | O | O | O | `[DONE]` | `auth.setup.ts` |
| `GATEWAY_SESSION` 쿠키 확인 | O | O | O | `[DONE]` | `auth.spec.ts` |
| `/api/users/session` role 확인 | O | O | O | `[DONE]` | `auth.spec.ts` |
| 비로그인 보호 라우트 접근 | O | O | O | `[DONE]` | `auth.spec.ts` |
| 로그아웃 후 보호 라우트 재접근 | O | O | O | `[DONE]` 세션 쿠키 제거로 검증 | `auth-negative.spec.ts` |
| 세션 만료/401 후 재로그인 | O | O | O | `[DONE]` 빈 storage/API 401 확인 | `auth-negative.spec.ts` |

## Admin Userflow

| 영역 | 시나리오 | 상태 | 현재/추천 파일 |
| --- | --- | --- | --- |
| 사용자 | 목록 조회 | `[DONE]` | `admin-userflow.spec.ts` |
| 사용자 | 검색/필터 입력 | `[DONE]` | `admin-userflow.spec.ts` |
| 사용자 | 상세 모달 열기 | `[DONE]` | `read-userflow-extra.spec.ts` |
| 사용자 | 사용자 생성 | `[GATED]` | `admin-userflow.spec.ts`, `admin-mutation.spec.ts` |
| 사용자 | 사용자 정보 수정 | `[GATED]` | `admin-mutation.spec.ts` |
| 사용자 | 비밀번호 초기화 | `[GATED]` | `admin-userflow.spec.ts`, `admin-mutation.spec.ts` |
| 사용자 | 정지/해제 | `[GATED]` | `admin-userflow.spec.ts`, `admin-mutation.spec.ts` |
| 사용자 | 자기 자신 정지 방지 | `[TODO]` | validation/권한 테스트 |
| 사용자 | 중복 사번/이메일 409 | `[GATED]` | `admin-mutation.spec.ts` |
| 부품 | 목록/필터 조회 | `[DONE]` | `admin-userflow.spec.ts` |
| 부품 | 상세 모달 열기 | `[DONE]` | `read-userflow-extra.spec.ts` |
| 부품 | 부품 추가 | `[GATED]` | `admin-mutation.spec.ts` |
| 부품 | SKU 중복 확인 | `[DONE]` API check, `[GATED]` duplicate create | `form-validation.spec.ts`, `admin-mutation.spec.ts` |
| 부품 | 부품 정보 수정 | `[GATED]` | `admin-mutation.spec.ts` |
| 부품 | 활성/비활성 전환 | `[GATED]` | `admin-mutation.spec.ts` |
| 창고/지점 | 창고 목록/필터 조회 | `[DONE]` | `admin-userflow.spec.ts` |
| 창고/지점 | 지점 추가 | `[GATED]` | `admin-mutation.spec.ts` |
| 창고/지점 | 창고 추가 | `[GATED]` | `admin-mutation.spec.ts` |
| 창고/지점 | 창고 코드 중복 확인 | `[DONE]` API check, `[GATED]` duplicate create | `form-validation.spec.ts`, `admin-mutation.spec.ts` |
| 창고/지점 | 창고 수정 | `[GATED]` | `admin-mutation.spec.ts` |
| 창고/지점 | 창고 활성/비활성 전환 | `[GATED]` | `admin-mutation.spec.ts` |
| 재고 | 전체 재고 조회 | `[DONE]` | `admin-userflow.spec.ts` |
| 재고 | 재고 행 선택/상세 패널 | `[DONE]` 행이 있을 때 | `admin-userflow.spec.ts` |
| 재고 | 재고 추가 | `[GATED]` | `admin-mutation.spec.ts` |
| 재고 | 재고 조정 | `[GATED]` | `admin-mutation.spec.ts` |
| 재고 | 안전재고 조정 | `[GATED]` | `admin-mutation.spec.ts` |
| HQ 업무 | 대시보드/구매/발주 접근 | `[DONE]` | `role-access.spec.ts`, `admin-userflow.spec.ts` |

## HQ Userflow

| 영역 | 시나리오 | HQ_MANAGER | HQ_STAFF | 상태 | 현재/추천 파일 |
| --- | --- | --- | --- | --- | --- |
| 대시보드 | KPI/최근 활동/할 일 조회 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 대시보드 | 바로가기 이동 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 구매 | 목록 조회 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 구매 | 필터/검색/정렬 | O | O | `[DONE]` | `read-userflow-extra.spec.ts` |
| 구매 | 상세 조회/이력 | O | O | `[DONE]` 행이 있을 때 | `hq-userflow.spec.ts` |
| 구매 | 신규 등록 | O | O | `[GATED]` API 준비 | `cross-role-purchase-flow.spec.ts` |
| 구매 | 임시저장 | O | O | `[GATED]` | `draft-lifecycle.spec.ts` |
| 구매 | 임시저장 수정 | O | O | `[GATED]` | `draft-lifecycle.spec.ts` |
| 구매 | 확정 | O | O | `[GATED]` | `cross-role-purchase-flow.spec.ts` |
| 구매 | 입고 처리 | O | O | `[GATED]` | `cross-role-purchase-flow.spec.ts` |
| 구매 | 취소 | O | O | `[GATED]` | `business-negative.spec.ts` |
| 구매 | 필수값/수량/단가 validation | O | O | `[DONE]` | `form-validation.spec.ts` |
| 본사 발주 | 목록 조회 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 본사 발주 | 필터/상태/창고 검색 | O | O | `[DONE]` | `read-userflow-extra.spec.ts` |
| 본사 발주 | 상세 검토 | O | O | `[DONE]` 행이 있을 때 | `hq-userflow.spec.ts` |
| 본사 발주 | 거절 | O | O | `[GATED]` | `business-negative.spec.ts` |
| 본사 발주 | 출고 확정 | O | O | `[GATED]` | `cross-role-sales-flow.spec.ts`, validation은 `business-negative.spec.ts` |
| 재고 | 재고 조회/검색 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 재고 | 재고 이력 조회 | O | O | `[DONE]` | `hq-userflow.spec.ts` |
| 재고 | 재고 조정 | O | X | `[DONE]` 버튼 노출 구분, `[GATED]` 실제 조정 | `granular-role-access.spec.ts`, `admin-mutation.spec.ts` |
| 재고 | 안전재고 조정 | O | X | `[DONE]` 버튼 노출 구분, `[GATED]` 실제 조정 | `granular-role-access.spec.ts`, `admin-mutation.spec.ts` |
| 재고 | 재고 추가 | X | X | `[DONE]` 미노출 확인 | `hq-userflow.spec.ts` |
| 창고/지점 | 목록 조회 | O | O | `[DONE]` API | `hq-userflow.spec.ts` |
| 창고/지점 | 지점/창고 추가 | O | X | `[DONE]` UI 권한, `[GATED]` 실제 생성 | `granular-role-access.spec.ts`, `admin-mutation.spec.ts` |
| 창고/지점 | 창고 수정/활성 전환 | O | X | `[DONE]` UI 권한, `[GATED]` 실제 변경 | `granular-role-access.spec.ts`, `admin-mutation.spec.ts` |
| 권한 차단 | `/users` 접근 차단 | X | X | `[DONE]` | `role-access.spec.ts` |

## Branch Userflow

| 영역 | 시나리오 | BRANCH_MANAGER | BRANCH_STAFF | 상태 | 현재/추천 파일 |
| --- | --- | --- | --- | --- | --- |
| 지점 발주 | 목록 조회 | O | O | `[DONE]` | `branch-userflow.spec.ts` |
| 지점 발주 | 탭/검색 필터 | O | O | `[DONE]` | `branch-userflow.spec.ts` |
| 지점 발주 | 상세 조회/이력 | O | O | `[DONE]` 행이 있을 때 | `branch-userflow.spec.ts` |
| 지점 발주 | 신규 요청 생성 | O | O | `[DONE]` validation, `[GATED]` API 준비 | `form-validation.spec.ts`, `cross-role-sales-flow.spec.ts` |
| 지점 발주 | 임시저장 | O | O | `[GATED]` | `draft-lifecycle.spec.ts` |
| 지점 발주 | 임시저장 수정 | O | O | `[GATED]` | `draft-lifecycle.spec.ts` |
| 지점 발주 | 임시저장 제출 | O | O | `[GATED]` | `draft-lifecycle.spec.ts` |
| 지점 발주 | 요청 취소 | O | O | `[GATED]` | `business-negative.spec.ts` |
| 지점 발주 | HQ 출고 후 입고 확정 | O | O | `[GATED]` | `cross-role-sales-flow.spec.ts` |
| 지점 발주 | 필수값/수량 validation | O | O | `[DONE]` | `form-validation.spec.ts` |
| 지점 발주 | 중복 품목 validation | O | O | `[TODO]` 배포 번들 selector 반영 후 재시도 | `form-validation.spec.ts` 확장 |
| 부품 | 목록/필터 조회 | O | O | `[DONE]` | `branch-userflow.spec.ts` |
| 부품 | 상세 읽기 전용 | O | O | `[DONE]` 행이 있을 때 | `branch-userflow.spec.ts` |
| 부품 | 추가/수정/활성 전환 미노출 | X | X | `[DONE]` 일부 | `branch-userflow.spec.ts` |
| 재고 | 본인 지점 재고 조회 | O | O | `[DONE]` | `branch-userflow.spec.ts` |
| 재고 | 재고 이력 조회 | O | O | `[DONE]` | `branch-userflow.spec.ts` |
| 재고 | 창고 selector가 본인 지점으로 제한 | O | O | `[DONE]` | `read-userflow-extra.spec.ts` |
| 재고 | 재고 추가/조정/안전재고 미노출 | X | X | `[DONE]` | `branch-userflow.spec.ts` |
| 권한 차단 | `/users`, `/dashboard`, `/purchase-orders`, `/sales-orders` 차단 | X | X | `[DONE]` | `branch-userflow.spec.ts`, `role-access.spec.ts` |

## Cross-role 업무 흐름

| 흐름 | 단계 | 상태 | 파일 |
| --- | --- | --- | --- |
| 판매 발주 | Branch 요청 생성 | `[GATED]` API | `cross-role-sales-flow.spec.ts` |
| 판매 발주 | HQ 출고 화면 이동 | `[GATED]` UI | `cross-role-sales-flow.spec.ts` |
| 판매 발주 | HQ 운송 정보 입력/출고 확정 | `[GATED]` UI | `cross-role-sales-flow.spec.ts` |
| 판매 발주 | Branch 도착 입고 확정 | `[GATED]` UI | `cross-role-sales-flow.spec.ts` |
| 판매 발주 | 상태/이력 `REQUESTED -> APPROVED -> DELIVERED` | `[GATED]` API | `cross-role-sales-flow.spec.ts` |
| 구매 입고 | HQ 구매 주문 생성 | `[GATED]` API | `cross-role-purchase-flow.spec.ts` |
| 구매 입고 | HQ 구매 주문 확정 | `[GATED]` UI | `cross-role-purchase-flow.spec.ts` |
| 구매 입고 | HQ 입고 처리 | `[GATED]` UI | `cross-role-purchase-flow.spec.ts` |
| 구매 입고 | 상태/이력 `DRAFT -> APPROVED -> RECEIVED` | `[GATED]` API | `cross-role-purchase-flow.spec.ts` |
| 구매 입고 | 입고 후 재고 상세 조회 | `[GATED]` API | `cross-role-purchase-flow.spec.ts` |

## Negative / Validation 테스트 후보

| 영역 | 케이스 | 우선순위 | 상태 |
| --- | --- | --- | --- |
| 인증 | 만료된 storage state로 API 호출 시 401/로그인 이동 | P1 | `[DONE]` |
| 권한 | HQ가 Branch route 직접 접근 | P1 | `[DONE]` |
| 권한 | Admin/HQ가 Branch API 직접 호출 시 403 | P1 | `[DONE]` |
| 권한 | Branch가 HQ/Admin API 직접 호출 시 403 | P1 | `[DONE]` |
| 판매 발주 | 품목 0개 제출 | P1 | `[DONE]` |
| 판매 발주 | 수량 0 제출 | P1 | `[DONE]` |
| 판매 발주 | 중복 품목 추가 | P2 | `[TODO]` 배포 번들 selector 반영 후 재시도 |
| 판매 발주 | 운송 수단 없이 출고 확정 | P1 | `[GATED]` |
| 판매 발주 | 거절 사유 없이 거절 | P1 | `[GATED]` |
| 구매 주문 | 공급사 미선택 제출 | P1 | `[DONE]` |
| 구매 주문 | 납품 창고 미선택 제출 | P1 | `[DONE]` |
| 구매 주문 | 품목 0개 제출 | P1 | `[DONE]` |
| 구매 주문 | 수량/단가 0 제출 | P1 | `[DONE]` 단가 0은 로컬 validation 수정, 배포 반영 전에는 E2E route로 POST 차단 |
| 사용자 | 중복 사번/이메일 생성 | P1 | `[GATED]` |
| 사용자 | 잘못된 이메일 형식 | P2 | `[TODO]` |
| 사용자 | 직접 비밀번호 정책 위반 | P2 | `[TODO]` |
| 부품 | 중복 SKU 생성 | P1 | `[DONE]` code-check, `[GATED]` duplicate create |
| 창고 | 중복 창고 코드 생성 | P1 | `[DONE]` code-check, `[GATED]` duplicate create |
| 재고 | 음수/0 조정 수량 | P1 | `[GATED]` |
| 재고 | 낙관적 락 version 충돌 | P2 | `[MANUAL]` |

## 다음 구현 순서

1. 전용 테스트 환경에서 gated mutation 실제 실행
   - `E2E_ENABLE_MUTATION=true`
   - `E2E_TARGET_PROFILE=test E2E_ENABLE_MUTATION=true E2E_ENABLE_ADMIN_MUTATION=true`
2. 세부 role 계정 환경변수 추가 후 manager/staff 권한 분리 실행
   - `HQ_MANAGER` vs `HQ_STAFF`
   - `BRANCH_MANAGER` vs `BRANCH_STAFF`
3. 자기 자신 정지 방지, 이메일 형식, 비밀번호 정책 같은 세부 validation 추가
4. 낙관적 락 version 충돌은 병렬 요청이 필요하므로 별도 test profile에서 수동/전용 자동화

## 현재 자동화 결과 기준

마지막 확인 기준:

- 총 수집 테스트: 40개에서 증가 예정
- 마지막 기본 실행 결과: 35 passed, 5 skipped
- 신규 기본 실행 추가: 인증 Negative, 권한 세부 검증, 중복 validation
- 신규 gated 실행 추가: 업무 Negative, Admin Mutation, 세부 role 계정 권한
- skipped 5개:
  - 관리자 변경 flow: `E2E_ENABLE_MUTATION=true` + `E2E_ENABLE_ADMIN_MUTATION=true`
  - 판매 cross-role flow: `E2E_ENABLE_MUTATION=true`
  - 구매 cross-role flow: `E2E_ENABLE_MUTATION=true`
  - Branch Draft lifecycle: `E2E_ENABLE_MUTATION=true`
  - HQ Draft lifecycle: `E2E_ENABLE_MUTATION=true`
