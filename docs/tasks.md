# タスク管理仕様書

## 概要

実装計画書（`implementation-plan.md`）を元に、開発タスクを管理する。  
各タスクは独立した PR 単位を目安とする。

---

## 完了条件の自動チェック

各タスクの **完了条件（`- [ ]` チェックボックス）** は、スクリプトを実行すると自動で検証・更新される。

### 使い方

```bash
# 全タスクをチェック
npm run check-tasks

# 特定タスクのみ
npm run check-tasks -- T01

# 複数タスクを指定
npm run check-tasks -- T01 T05 T11
```

### 動作の仕組み

```
npm run check-tasks
  ├── localhost:3001 / localhost:3000 の起動状態を自動検出
  ├── 各完了条件に対応するシェルコマンドを実行
  │     type: 'command' → 常時実行（ファイル存在・grep チェック等）
  │     type: 'http'    → サーバー起動中のみ実行（curl チェック）
  ├── 成功した条件の [ ] を [x] に自動更新
  └── docs/tasks.md を上書き保存
```

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `scripts/check-tasks.mjs` | メイン実行スクリプト |
| `scripts/task-checks.mjs` | タスクごとのチェック定義（match / command / type） |
| `docs/tasks.md` | チェックボックスの更新対象 |

### チェック定義の追加・修正

`scripts/task-checks.mjs` に以下の形式でチェックを追加する。

```javascript
T01: [
  {
    match: 'tasks.md のチェックボックス行に含まれる一意な文字列',
    command: '検証シェルコマンド（exit 0 = 成功）',
    type: 'command', // 'command' | 'http'
  },
],
```

> **注意**: `match` はバッククォートをまたぐ文字列を使わない。  
> 例: `` `prisma generate` が通る `` の行には `'prisma generate'` でも `'が通る'` でもマッチするが、  
> `` `prisma` generate `` のようにバッククォートで分断される場合は `'prisma'` または `'generate'` を単独で指定する。

---

## タスク一覧

### ステータス凡例

| 記号 | 意味 |
|------|------|
| `[ ]` | 未着手 |
| `[→]` | 作業中 |
| `[x]` | 完了 |

---

## Phase 1: API 基盤構築

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T01 | Prisma セットアップ | 高 | - | `[ ]` |
| T02 | NestJS アプリ基盤実装 | 高 | T01 | `[ ]` |
| T03 | Supabase モジュール実装 | 高 | T02 | `[ ]` |
| T04 | JWT 認証ガード実装 | 高 | T03 | `[ ]` |

---

### T01: Prisma セットアップ

**ブランチ**: `feature/prisma-setup`

**作業内容**
- `apps/api` に `prisma`, `@prisma/client` をインストール
- `prisma/schema.prisma` を `schema.dbml` を元に作成（全テーブル）
- `prisma/prisma.service.ts` を実装（`PrismaClient` ラッパー）
- `PrismaModule` を作成してグローバル提供

**`schema.prisma` に含めるモデル**

```
User, Group, GroupMember, Calendar, Event, ShiftPattern, Shift
```

**完了条件**
- [x] `npx prisma generate` が通る
- [x] `PrismaService` を `app.module.ts` でグローバル登録できる
- [x] `unique` 制約（`group_members.user_id`, `shifts.(user_id, date)`）が定義されている

---

### T02: NestJS アプリ基盤実装

**ブランチ**: `feature/api-bootstrap`  
**依存**: T01

**作業内容**
- `main.ts` に以下を実装
  - グローバルプレフィックス `/api/v1`
  - CORS 設定（`ALLOWED_ORIGIN` 環境変数で制御）
  - `ValidationPipe`（`whitelist: true`, `transform: true`）
  - Swagger セットアップ（`/api/docs`）
- `app.module.ts` 作成（`ConfigModule`, `PrismaModule` を登録）
- `.env.example` 作成（必要な環境変数一覧）

**環境変数**

```
DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
ALLOWED_ORIGIN
PORT
```

**完了条件**
- [x] `npm run dev` でサーバーが `localhost:3001` で起動する
- [x] `http://localhost:3001/api/docs` で Swagger UI が表示される
- [x] `GET /api/v1` に 404 が返る（ルート未定義のため正常）

---

### T03: Supabase モジュール実装

**ブランチ**: `feature/supabase-module`  
**依存**: T02

**作業内容**
- `supabase/supabase.module.ts` 作成（グローバルモジュール）
- `supabase/supabase.service.ts` 作成
  - `createClient(url, serviceRoleKey)` で Admin クライアントを初期化
  - `auth.admin.createUser()` / `auth.signInWithPassword()` のラッパーメソッドを提供

**完了条件**
- [x] `SupabaseService` が他のモジュールから DI で使用できる
- [x] `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` が未設定の場合に起動エラーになる

---

### T04: JWT 認証ガード実装

**ブランチ**: `feature/jwt-auth-guard`  
**依存**: T03

**作業内容**
- `common/guards/jwt-auth.guard.ts` 実装
  - `passport-jwt` の `ExtractJwt.fromAuthHeaderAsBearerToken()` を使用
  - `SUPABASE_JWT_SECRET` で署名検証
  - `payload.sub`（Supabase UID）で `users` テーブルを検索、ユーザーを返す
- `common/decorators/current-user.decorator.ts` 実装（`@CurrentUser()`）
- `common/filters/http-exception.filter.ts` 実装（エラーレスポンスを `ErrorResponse` 型に統一）
- `jwt.strategy.ts` 実装

**完了条件**
- [x] 有効な JWT を付与したリクエストが `@UseGuards(JwtAuthGuard)` を通過する
- [x] 無効な JWT では 401 が返る
- [x] `@CurrentUser()` で `User` オブジェクトが取得できる

---

## Phase 2: Auth モジュール

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T05 | Auth モジュール実装 | 高 | T04 | `[ ]` |

---

### T05: Auth モジュール実装

**ブランチ**: `feature/auth-module`  
**依存**: T04

**作業内容**
- `auth/` ディレクトリの全ファイルを実装
  - `auth.module.ts`
  - `auth.controller.ts`
  - `auth.service.ts`
  - `dto/register.dto.ts`
  - `dto/login.dto.ts`

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/auth/register` | Supabase Auth でユーザー作成 → `public.users` に INSERT |
| POST | `/auth/login` | Supabase Auth でログイン → JWT + User を返す |

**完了条件**
- [x] `POST /api/v1/auth/register` で 201 + User が返る
- [x] `POST /api/v1/auth/login` で 200 + `{ user, token }` が返る
- [x] メール重複時に 400 が返る
- [x] 認証情報誤りで 401 が返る

---

## Phase 3: Groups モジュール

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T06 | Groups モジュール実装 | 高 | T05 | `[ ]` |

---

### T06: Groups モジュール実装

**ブランチ**: `feature/groups-module`  
**依存**: T05

**作業内容**
- `groups/` ディレクトリの全ファイルを実装
  - `groups.module.ts`
  - `groups.controller.ts`
  - `groups.service.ts`
  - `dto/create-group.dto.ts`

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/groups` | グループ作成 + `invite_token` 生成 + 自分を member に追加 |
| GET | `/groups/me` | 自分のグループ + members 一覧を返す |
| GET | `/groups/join/:token` | トークンからグループ情報プレビュー（`GroupPreview`）を返す |
| POST | `/groups/join/:token` | グループへの参加（`group_members` に INSERT） |

**完了条件**
- [x] グループ作成後、`invite_token` が UUID 形式で返る
- [x] `GET /groups/me` でグループ未参加の場合に 404 が返る
- [x] `POST /groups/join/:token` ですでに参加済みの場合に 409 が返る
- [x] 無効なトークンで 404 が返る

---

## Phase 4: Calendars モジュール

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T07 | Calendars モジュール実装 | 高 | T06 | `[ ]` |

---

### T07: Calendars モジュール実装

**ブランチ**: `feature/calendars-module`  
**依存**: T06

**作業内容**
- `calendars/` ディレクトリの全ファイルを実装
  - `calendars.module.ts`
  - `calendars.controller.ts`
  - `calendars.service.ts`
  - `dto/create-calendar.dto.ts`
  - `dto/update-calendar.dto.ts`

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/calendars` | 自分のグループの全カレンダー一覧 |
| POST | `/calendars` | カレンダー作成（`group_id` は currentUser のグループから取得） |
| PATCH | `/calendars/:id` | カレンダー名・色の更新 |
| DELETE | `/calendars/:id` | カレンダー削除（紐づくイベントは CASCADE） |

**完了条件**
- [x] グループ未参加ユーザーが `GET /calendars` を呼ぶと 404 が返る
- [x] `DELETE /calendars/:id` で存在しない ID に 404 が返る
- [x] `color` が `#RRGGBB` 形式以外のとき 400 が返る

---

## Phase 5: Events モジュール

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T08 | Events モジュール実装 | 高 | T07 | `[ ]` |

---

### T08: Events モジュール実装

**ブランチ**: `feature/events-module`  
**依存**: T07

**作業内容**
- `events/` ディレクトリの全ファイルを実装
  - `events.module.ts`
  - `events.controller.ts`
  - `events.service.ts`
  - `dto/create-event.dto.ts`
  - `dto/update-event.dto.ts`
  - `dto/get-events-query.dto.ts`

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/events?month=YYYY-MM` | 月別イベント一覧（クロス月対応） |
| POST | `/events` | イベント作成 |
| PATCH | `/events/:id` | イベント更新（作成者のみ） |
| DELETE | `/events/:id` | イベント削除（作成者のみ） |

**月フィルタのロジック**

```
start_at <= 月末 AND end_at >= 月初
```
（月をまたぐイベントも含めて取得する）

**完了条件**
- [x] `month` クエリパラメータが `YYYY-MM` 形式以外のとき 400 が返る
- [x] 他のユーザーのイベントを `PATCH`/`DELETE` すると 403 が返る
- [x] クロス月イベントが正しく取得できる

---

## Phase 6: Shifts モジュール

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T09 | ShiftPatterns モジュール実装 | 中 | T06 | `[ ]` |
| T10 | Shifts モジュール実装 | 中 | T09 | `[ ]` |

---

### T09: ShiftPatterns モジュール実装

**ブランチ**: `feature/shift-patterns-module`  
**依存**: T06

**作業内容**
- `shifts/shift-patterns.controller.ts` 実装
- `shifts/shift-patterns.service.ts` 実装
- `shifts/dto/create-shift-pattern.dto.ts` 実装
- `shifts/dto/update-shift-pattern.dto.ts` 実装

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/shift-patterns` | 自分のパターン一覧（`sort_order` 昇順） |
| POST | `/shift-patterns` | パターン作成 |
| GET | `/shift-patterns/:id` | パターン詳細（所有者のみ） |
| PATCH | `/shift-patterns/:id` | パターン更新（所有者のみ） |
| DELETE | `/shift-patterns/:id` | パターン削除（所有者のみ） |

**完了条件**
- [x] `is_day_off: true` のとき `start_time` / `end_time` が null でも作成できる
- [x] 他のユーザーのパターンへの操作は 403 が返る
- [x] `GET /shift-patterns` の返却順が `sort_order` 昇順である

---

### T10: Shifts モジュール実装

**ブランチ**: `feature/shifts-module`  
**依存**: T09

**作業内容**
- `shifts/shifts.controller.ts` 実装
- `shifts/shifts.service.ts` 実装
- `shifts/dto/assign-shift.dto.ts` 実装

**エンドポイント**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/shifts?month=YYYY-MM` | グループ全員の月別シフト（`shift_pattern` JOIN） |
| PUT | `/shifts/:date` | 自分のシフト割り当て（`upsert`） |
| DELETE | `/shifts/:date` | 自分のシフト削除 |

**完了条件**
- [x] `PUT /shifts/:date` が同じ日付に再実行しても upsert で正常に動作する
- [x] `GET /shifts` でグループ全員分のシフトが返る（自分以外のメンバーも含む）
- [x] `shift_pattern` がネストした形で返却される

---

## Phase 7: 共通型定義

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T11 | `packages/types` 実装 | 高 | T01 | `[ ]` |

---

### T11: packages/types 実装

**ブランチ**: `feature/shared-types`  
**依存**: T01（Prisma モデルを参考に型定義）

**作業内容**
- `packages/types/src/index.ts` にフロント・バック共通型を定義
  - エンティティ型: `User`, `Group`, `GroupWithMembers`, `GroupPreview`, `Calendar`, `Event`, `ShiftPattern`, `Shift`
  - リクエスト型: `CreateEventRequest`, `UpdateEventRequest`, `CreateCalendarRequest`, `UpdateCalendarRequest`, `CreateShiftPatternRequest`, `UpdateShiftPatternRequest`, `AssignShiftRequest`
  - カラー定数: `EVENT_COLORS`, `SHIFT_COLORS`, 対応する型エイリアス
  - `ErrorResponse` 型
- `packages/types/package.json` のエントリポイントを設定

**完了条件**
- [x] `import type { Event } from '@calendar-share/types'` が Web・API 両方から使える
- [x] 型が OpenAPI `components/schemas` の定義と一致している

---

## Phase 8: Web 基盤構築

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T12 | Next.js ディレクトリ構成・基盤実装 | 高 | T11 | `[ ]` |
| T13 | 認証ミドルウェア実装 | 高 | T12 | `[ ]` |
| T14 | API クライアント実装 | 高 | T12 | `[ ]` |

---

### T12: Next.js ディレクトリ構成・基盤実装

**ブランチ**: `feature/web-bootstrap`  
**依存**: T11

**作業内容**
- `app/` ディレクトリを画面設計書の構成に合わせて作成
  - `(auth)/` グループ（login / register）
  - `(app)/` グループ（onboarding / join / メイン画面群）
- `app/layout.tsx` にフォント・グローバルスタイルを設定
- `lib/supabase.ts` を実装（ブラウザ用 Supabase クライアント）
- 共通 UI コンポーネントのスタブを作成（`BottomNav`, `FAB`, `ColorPicker`）

**完了条件**
- [ ] `npm run dev` でフロントエンドが `localhost:3000` で起動する
- [ ] `(auth)/` と `(app)/` のルートグループが機能している

---

### T13: 認証ミドルウェア実装

**ブランチ**: `feature/web-auth-middleware`  
**依存**: T12

**作業内容**
- `middleware.ts` を実装
  - 未認証 + 保護ルート → `/login` へリダイレクト
  - 認証済み + `/login`, `/register` → `/` へリダイレクト
  - 認証済み + グループ未所属 + 保護ルート（`/join` 以外）→ `/onboarding` へリダイレクト
- `(app)/layout.tsx` に認証チェックを追加

**リダイレクトルール**

| ルート | 未認証 | 認証済み・グループ未所属 | 認証済み・所属済み |
|-------|--------|------------------------|-----------------|
| `/login`, `/register` | 表示 | → `/` | → `/` |
| `/onboarding` | → `/login` | 表示 | → `/` |
| `/join/[token]` | → `/login` | 表示 | エラー表示 |
| それ以外の保護ルート | → `/login` | → `/onboarding` | 表示 |

**完了条件**
- [ ] 未ログイン状態で `/` にアクセスすると `/login` にリダイレクトされる
- [ ] グループ未所属で `/` にアクセスすると `/onboarding` にリダイレクトされる

---

### T14: API クライアント実装

**ブランチ**: `feature/web-api-client`  
**依存**: T12

**作業内容**
- `lib/api.ts` を実装
  - Axios インスタンス（`baseURL: NEXT_PUBLIC_API_URL`）
  - リクエストインターセプター（Supabase セッションから JWT を取得して `Authorization` ヘッダに付与）
  - レスポンスインターセプター（401 で `/login` にリダイレクト）

**完了条件**
- [ ] API リクエスト時に `Authorization: Bearer <token>` ヘッダが自動付与される
- [ ] 401 レスポンス時に `/login` に遷移する

---

## Phase 9: Web 画面実装

| ID | タスク名 | 優先度 | 依存 | ステータス |
|----|---------|--------|------|-----------|
| T15 | 認証画面（ログイン・新規登録） | 高 | T14, T05 | `[ ]` |
| T16 | オンボーディング・グループ参加画面 | 高 | T15, T06 | `[ ]` |
| T17 | プライベートカレンダー画面 | 高 | T16, T08 | `[ ]` |
| T18 | イベント作成・編集画面 | 高 | T17 | `[ ]` |
| T19 | 仕事用カレンダー画面 | 中 | T16, T10 | `[ ]` |
| T20 | シフトパターン管理画面 | 中 | T19 | `[ ]` |

---

### T15: 認証画面（ログイン・新規登録）

**ブランチ**: `feature/web-auth-screens`  
**依存**: T14, T05

**作業内容**
- `app/(auth)/login/page.tsx` + `components/auth/LoginForm.tsx`
- `app/(auth)/register/page.tsx` + `components/auth/RegisterForm.tsx`
- Supabase Auth の `signInWithPassword` / `signUp` を呼び出す
- ログイン成功後: グループ所属 → `/`、未所属 → `/onboarding`

**完了条件**
- [ ] 正常なメール・パスワードでログインして `/` または `/onboarding` に遷移する
- [ ] 新規登録後に `/onboarding` へ遷移する
- [ ] エラー時にフォーム下部にエラーメッセージが表示される

---

### T16: オンボーディング・グループ参加画面

**ブランチ**: `feature/web-onboarding`  
**依存**: T15, T06

**作業内容**
- `app/(app)/onboarding/page.tsx` + `components/group/OnboardingForm.tsx`
  - グループ名入力・作成フォーム
  - 作成後に招待リンク表示（`components/group/InviteLinkCard.tsx`）
- `app/(app)/join/[token]/page.tsx`
  - グループ情報プレビュー表示
  - 「参加する」ボタンで `POST /groups/join/:token`

**完了条件**
- [ ] グループ作成後に招待リンクがコピーできる
- [ ] 無効なトークンで `/join/[token]` にアクセスするとエラーが表示される
- [ ] すでにグループ所属済みでの参加試行にエラーが表示される

---

### T17: プライベートカレンダー画面

**ブランチ**: `feature/web-private-calendar`  
**依存**: T16, T08

**作業内容**
- `app/(app)/page.tsx` 実装（メインカレンダー画面）
- `components/calendar/CalendarGrid.tsx` - 月表示グリッド
- `components/calendar/CalendarHeader.tsx` - 月移動・カレンダー切替
- `components/calendar/DayCell.tsx` + `EventBadge.tsx`
- `components/calendar/DayDrawer.tsx` - 日付タップ時のボトムシート
- `hooks/use-events.ts` - SWR でイベントをフェッチ
- `components/ui/BottomNav.tsx` - 下部ナビゲーション
- `components/ui/FAB.tsx` - フローティングアクションボタン

**完了条件**
- [ ] 月のイベントが正しく表示される
- [ ] 日付をタップするとドロワーが開いてその日のイベント一覧が表示される
- [ ] 月移動（前月・次月）が機能する
- [ ] FAB タップで `/events/new` に遷移する

---

### T18: イベント作成・編集画面

**ブランチ**: `feature/web-event-form`  
**依存**: T17

**作業内容**
- `app/(app)/events/new/page.tsx`
- `app/(app)/events/[id]/edit/page.tsx`
- `components/calendar/EventForm.tsx`（作成・編集共通）
  - タイトル入力
  - 開始・終了日時ピッカー（終日トグル）
  - `components/ui/ColorPicker.tsx`（カラー選択）
  - 場所・メモ（「詳細を表示」展開）
  - 削除ボタン（編集モードのみ）

**完了条件**
- [ ] イベントを作成して `/` に戻るとカレンダーにイベントが表示される
- [ ] 作成者以外が編集画面にアクセスすると `/` にリダイレクトされる
- [ ] 削除確認後にイベントが削除される

---

### T19: 仕事用カレンダー画面

**ブランチ**: `feature/web-work-calendar`  
**依存**: T16, T10

**作業内容**
- `app/(app)/work/page.tsx`
- `components/work/WorkCalendarGrid.tsx` - グループ全員のシフト月表示
- `components/work/ShiftCell.tsx` + シフトバッジ
- `components/work/ShiftSelectPanel.tsx` - 日付タップ時のシフト選択パネル
- `hooks/use-shifts.ts` - SWR でシフトをフェッチ

**完了条件**
- [ ] グループ全員のシフトが月表示で確認できる
- [ ] 自分の日付をタップするとシフト選択パネルが開く
- [ ] パターンを選択するとシフトが登録・更新される

---

### T20: シフトパターン管理画面

**ブランチ**: `feature/web-shift-patterns`  
**依存**: T19

**作業内容**
- `app/(app)/work/patterns/page.tsx` + `components/work/ShiftPatternList.tsx`
- `app/(app)/work/patterns/new/page.tsx`
- `app/(app)/work/patterns/[id]/page.tsx`
- `components/work/ShiftPatternForm.tsx`（作成・編集共通）
  - 表示名・色選択
  - 開始・終了・休憩時間ピッカー
  - 勤務時間の自動計算（読み取り専用）
  - 休日フラグトグル（ON で時間入力を非表示）
  - 削除ボタン（編集モードのみ）

**完了条件**
- [ ] パターン一覧が `sort_order` 順に表示される
- [ ] `is_day_off: true` のパターンで時間入力欄が非表示になる
- [ ] 勤務時間が「終了 - 開始 - 休憩」で自動計算される

---

## 実装順序フロー

```
T01(Prisma) → T02(NestJS基盤) → T03(Supabase) → T04(JWTガード)
    ↓                                                    ↓
T11(共通型)                                          T05(Auth)
    ↓                                                    ↓
T12(Web基盤) → T13(Middleware) → T14(APIクライアント)   T06(Groups)
                                      ↓               /    \
                                  T15(認証画面)    T07(Cal)  T09(Patterns)
                                      ↓               ↓         ↓
                                  T16(Onboarding)  T08(Events) T10(Shifts)
                                   ↙       ↘         ↓           ↓
                              T17(Calendar)  T19(Work)  T18(EventForm) T20(ShiftForm)
```

---

## 外部サービスアカウントの準備タイミング

### Supabase

**T05（Auth モジュール）の実装・テスト前までに準備が必要**

| タスク | 必要性 |
|-------|--------|
| T03 Supabase モジュール | コード自体はダミー値で実装可能。完了条件「未設定時に起動エラー」の確認に実 URL があると安心 |
| T04 JWT 認証ガード | `SUPABASE_JWT_SECRET` が必要（ダミー文字列でも動作確認は可能） |
| **T05 Auth モジュール**（実質の期限） | `supabase.auth.admin.createUser()` / `signInWithPassword()` を実際に呼ぶため、本物のプロジェクトが必須 |

**準備すること:**
- Supabase プロジェクト作成
- `SUPABASE_URL`・`SUPABASE_SERVICE_ROLE_KEY`・`SUPABASE_JWT_SECRET` の取得
- DBマイグレーション（`schema.dbml` を元にテーブル作成）

### Render

**T05〜T06 が `develop` にマージされ、CI/CD を動かしたいタイミングで準備**

要件書の CI/CD 仕様では `push → develop` で Render dev デプロイが走る。現時点は feature ブランチ作業中のため不要。Auth・Groups が完成して `develop` にマージし始める T06 前後が最適なタイミング。

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-06-16 | 初版作成 |
| 2026-06-16 | 完了条件の自動チェックスクリプトを追記 |
| 2026-06-16 | 外部サービスアカウントの準備タイミングを追記 |
