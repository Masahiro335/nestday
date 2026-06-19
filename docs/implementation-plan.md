# 実装計画書

## 概要

本ドキュメントはカレンダー共有アプリの実装手順を定義する。  
技術選定: **Prisma**（DB アクセス層）+ **Supabase Auth**（認証）

---

## 実装フェーズ一覧

| フェーズ | 対象 | 内容 |
|---------|------|------|
| 1 | API 基盤 | NestJS 起動・Prisma・認証ガード・共通設定 |
| 2 | Auth モジュール | register / login |
| 3 | Groups モジュール | グループ作成・参加・招待 |
| 4 | Calendars モジュール | カレンダー CRUD |
| 5 | Events モジュール | イベント CRUD（月フィルタ） |
| 6 | Shifts モジュール | シフトパターン + シフト割り当て |
| 7 | 共通型定義 | `packages/types` の実装 |
| 8 | Web 基盤 | Next.js 認証・ルーティング・API クライアント |
| 9 | Web 画面 | 各機能画面の実装 |

---

## フェーズ 1: API 基盤構築

### 実装ファイル

```
apps/api/src/
├── main.ts                          # 起動設定
├── app.module.ts                    # ルートモジュール
├── prisma/
│   ├── schema.prisma                # Prisma スキーマ（schema.dbml 準拠）
│   └── prisma.service.ts            # PrismaClient ラッパー
├── common/
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # Supabase JWT 検証ガード
│   ├── decorators/
│   │   └── current-user.decorator.ts # @CurrentUser() デコレータ
│   └── filters/
│       └── http-exception.filter.ts  # 共通エラーレスポンス整形
└── supabase/
    ├── supabase.module.ts
    └── supabase.service.ts          # Supabase Admin クライアント
```

### 実装ポイント

**`main.ts`**
- グローバルプレフィックス `/api/v1`
- CORS 設定（フロントエンドオリジン許可）
- `ValidationPipe`（`whitelist: true`, `transform: true`）
- Swagger セットアップ（`/api/docs`）

**`prisma/schema.prisma`**
- `schema.dbml` の全テーブルを Prisma モデルへ変換
- `uuid()` をデフォルト値として使用
- `@@unique([user_id])` などの制約を `@@unique` で再現

**`jwt-auth.guard.ts`**
- `@nestjs/passport` の `AuthGuard('jwt')` を継承
- Supabase の JWT Secret（環境変数 `SUPABASE_JWT_SECRET`）で署名検証
- ペイロードから `sub`（Supabase ユーザー ID）を取得し、`users` テーブルのレコードを特定

**環境変数（`.env`）**
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

### 依存パッケージ（追加が必要なもの）

```bash
cd apps/api
npm install prisma @prisma/client
npm install @nestjs/config
```

---

## フェーズ 2: Auth モジュール

### 実装ファイル

```
apps/api/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── jwt.strategy.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts
```

### エンドポイント

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| POST | `/auth/register` | 不要 | ユーザー登録 |
| POST | `/auth/login` | 不要 | ログイン・JWT 返却 |

### 実装ポイント

**`register`**
1. `supabase.auth.admin.createUser({ email, password, user_metadata: { name } })` を呼び出す
2. Supabase が `auth.users` に作成したユーザー ID で、`public.users` テーブルにも行を挿入（Prisma）
3. 作成した `User` を返す（201）

**`login`**
1. `supabase.auth.signInWithPassword({ email, password })` を呼び出す
2. 返却された `session.access_token`（JWT）と `User` をレスポンスとして返す（200）

**`jwt.strategy.ts`**
- `passport-jwt` の `ExtractJwt.fromAuthHeaderAsBearerToken()` を使用
- Secret: `SUPABASE_JWT_SECRET`
- `validate(payload)` で `payload.sub`（Supabase UID）を使い Prisma から `User` を取得して返す

---

## フェーズ 3: Groups モジュール

### 実装ファイル

```
apps/api/src/groups/
├── groups.module.ts
├── groups.controller.ts
├── groups.service.ts
└── dto/
    └── create-group.dto.ts
```

### エンドポイント

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| POST | `/groups` | 必要 | グループ作成 |
| GET | `/groups/me` | 必要 | 自分のグループ取得（メンバー一覧含む） |
| GET | `/groups/join/:token` | 必要 | 招待トークンでグループ情報プレビュー |
| POST | `/groups/join/:token` | 必要 | グループへの参加 |

### 実装ポイント

**`POST /groups`**
1. `invite_token` を `uuid` で生成
2. Prisma で `groups` 行を作成（`owner_id` = 現在ユーザー ID）
3. `group_members` に自分（owner）を追加

**`GET /groups/me`**
- `group_members.user_id = currentUser.id` でグループを検索
- `members` を JOIN して返す（`GroupWithMembers` 型）
- グループ未参加の場合は 404

**`POST /groups/join/:token`**
1. `group_members` に `user_id` が存在する場合は 409（既参加）
2. `invite_token` でグループを検索（存在しなければ 404）
3. `group_members` に行を追加

---

## フェーズ 4: Calendars モジュール

### 実装ファイル

```
apps/api/src/calendars/
├── calendars.module.ts
├── calendars.controller.ts
├── calendars.service.ts
└── dto/
    ├── create-calendar.dto.ts
    └── update-calendar.dto.ts
```

### エンドポイント

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| GET | `/calendars` | 必要 | グループ内全カレンダー取得 |
| POST | `/calendars` | 必要 | カレンダー作成 |
| PATCH | `/calendars/:id` | 必要 | カレンダー更新（名前・色） |
| DELETE | `/calendars/:id` | 必要 | カレンダー削除 |

### 実装ポイント

**グループ取得の共通化**  
全エンドポイントで「現在ユーザーのグループID」が必要。`groups.service.ts` の `getGroupByUserId()` を共通利用する。

**`DELETE /calendars/:id`**
- カレンダー削除時、紐づく `events` も CASCADE 削除（Prisma schema で `onDelete: Cascade` を設定）

---

## フェーズ 5: Events モジュール

### 実装ファイル

```
apps/api/src/events/
├── events.module.ts
├── events.controller.ts
├── events.service.ts
└── dto/
    ├── create-event.dto.ts
    ├── update-event.dto.ts
    └── get-events-query.dto.ts
```

### エンドポイント

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| GET | `/events?month=YYYY-MM` | 必要 | 月別イベント一覧取得 |
| POST | `/events` | 必要 | イベント作成 |
| PATCH | `/events/:id` | 必要 | イベント更新（作成者のみ） |
| DELETE | `/events/:id` | 必要 | イベント削除（作成者のみ） |

### 実装ポイント

**`GET /events?month=YYYY-MM`**
- `month` パラメータから月初・月末のタイムスタンプを算出
- `start_at <= 月末 AND end_at >= 月初` でクロス月イベントも含めて取得
- `calendar_id` クエリパラメータが指定された場合はフィルタリング

**`PATCH /events/:id` / `DELETE /events/:id`**
- `created_by !== currentUser.id` の場合は 403 を返す

**`get-events-query.dto.ts`**
```typescript
export class GetEventsQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month: string;

  @IsOptional()
  @IsUUID()
  calendar_id?: string;
}
```

---

## フェーズ 6: Shifts モジュール

### 実装ファイル

```
apps/api/src/shifts/
├── shifts.module.ts
├── shifts.controller.ts
├── shifts.service.ts
├── shift-patterns.controller.ts
├── shift-patterns.service.ts
└── dto/
    ├── create-shift-pattern.dto.ts
    ├── update-shift-pattern.dto.ts
    └── assign-shift.dto.ts
```

### エンドポイント

**ShiftPatterns（ユーザー個人のパターン管理）**

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| GET | `/shift-patterns` | 必要 | 自分のパターン一覧（sort_order 順） |
| POST | `/shift-patterns` | 必要 | パターン作成 |
| GET | `/shift-patterns/:id` | 必要 | パターン詳細（所有者のみ） |
| PATCH | `/shift-patterns/:id` | 必要 | パターン更新（所有者のみ） |
| DELETE | `/shift-patterns/:id` | 必要 | パターン削除（所有者のみ） |

**Shifts（日別シフト割り当て）**

| メソッド | パス | 認証 | 概要 |
|---------|------|------|------|
| GET | `/shifts?month=YYYY-MM` | 必要 | グループ全員の月別シフト一覧 |
| PUT | `/shifts/:date` | 必要 | 自分のシフト割り当て（upsert） |
| DELETE | `/shifts/:date` | 必要 | 自分のシフト削除 |

### 実装ポイント

**`PUT /shifts/:date`**
- `Prisma.upsert` を使用（`unique(user_id, date)` キーでアップサート）

**`GET /shifts?month=YYYY-MM`**
- `group_id = currentUser.groupId AND date >= 月初 AND date <= 月末`
- `shift_pattern` を JOIN して返す（`Shift & { shift_pattern: ShiftPattern }`）

**日付フィールドのフォーマット変換**
- Prisma の `@db.Date` 型は JavaScript `Date` オブジェクトとして返るため、JSON シリアライズ時に `"2026-06-25T00:00:00.000Z"` 形式になる
- OpenAPI 仕様で `date` フィールドは `format: date`（YYYY-MM-DD）と定義しているため、サービス層で `date.toISOString().slice(0, 10)` に変換してから返却する

**`is_day_off = true` の場合**  
`start_time` / `end_time` は null を許容（DTO でバリデーション分岐）

---

## フェーズ 7: 共通型定義（packages/types）

### 実装ファイル

```
packages/types/src/
└── index.ts
```

### 定義する型

```typescript
// エンティティ型（OpenAPI components/schemas 準拠）
export interface User { ... }
export interface Group { ... }
export interface GroupWithMembers extends Group { members: User[] }
export interface GroupPreview { ... }
export interface Calendar { ... }
export interface Event { ... }
export interface ShiftPattern { ... }
export interface Shift { shift_pattern: ShiftPattern; ... }

// リクエスト型
export interface CreateEventRequest { ... }
export interface UpdateEventRequest { ... }
export interface CreateCalendarRequest { ... }
// ... 全エンドポイント分

// カラープリセット
export const EVENT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] as const;
export type EventColor = typeof EVENT_COLORS[number];

// エラーレスポンス
export interface ErrorResponse {
  statusCode: number;
  message: string;
}
```

---

## フェーズ 8: Web 基盤構築（Next.js）

### 実装ファイル

```
apps/web/
├── app/
│   ├── layout.tsx                    # ルートレイアウト
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx                # 認証チェック・リダイレクト
│   │   ├── onboarding/page.tsx       # グループ作成・参加
│   │   ├── calendar/page.tsx         # メインカレンダー画面
│   │   └── shifts/page.tsx           # シフト管理画面
│   └── join/[token]/page.tsx         # 招待リンク参加ページ
├── lib/
│   ├── api.ts                        # Axios インスタンス（JWT ヘッダ自動付与）
│   └── supabase.ts                   # Supabase ブラウザクライアント
├── hooks/
│   ├── use-auth.ts
│   ├── use-group.ts
│   ├── use-calendars.ts
│   ├── use-events.ts
│   └── use-shifts.ts
└── components/
    ├── ui/                           # 汎用パーツ（Button, Input, Modal 等）
    └── features/
        ├── calendar/
        └── shifts/
```

### 実装ポイント

**`lib/api.ts`**
```typescript
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  config.headers.Authorization = `Bearer ${data.session?.access_token}`;
  return config;
});
```

**認証ルーティング**
- `(auth)/` グループ: 未ログインユーザーのみアクセス可（ログイン済みは `/calendar` へ）
- `(main)/layout.tsx`: 未ログインは `/login` へリダイレクト
- グループ未参加は `/onboarding` へリダイレクト

**環境変数（`.env.local`）**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## フェーズ 9: Web 画面実装

### 各画面の実装順序

1. **認証画面**（login / register）
   - Supabase Auth の `signInWithPassword` / `signUp` を呼び出す
   - 成功後は `/onboarding`（新規）または `/calendar`（既存）へ遷移

2. **オンボーディング画面**（`/onboarding`）
   - グループ作成フォーム
   - 招待リンク入力フォーム（`/join/:token` へ誘導）

3. **招待参加画面**（`/join/:token`）
   - グループ情報プレビュー表示
   - 「参加する」ボタンで `POST /groups/join/:token`

4. **カレンダー画面**（`/calendar`）
   - FullCalendar v6（`@fullcalendar/daygrid`）で月表示
   - カレンダー ON/OFF 切り替え（クライアント状態のみ）
   - イベントクリックで詳細モーダル
   - 日付クリックでイベント作成モーダル

5. **シフト管理画面**（`/shifts`）
   - 月表示でグループ全員のシフトを横並び表示
   - 自分のシフトパターン管理（作成・編集・削除）
   - 日付をクリックしてシフトパターン割り当て

---

## 実装の前提条件・注意事項

### Prisma スキーマの重要な設定

`group_members` の `user_id` に unique 制約（1ユーザー = 1グループ）:
```prisma
model GroupMember {
  @@unique([userId])
}
```

`shifts` の `(user_id, date)` に unique 制約（1日 1シフト）:
```prisma
model Shift {
  @@unique([userId, date])
}
```

### 認証フロー全体像

```
ブラウザ
  → Supabase Auth（signInWithPassword）
  → JWT 取得・保持（Supabase セッション）
  → API リクエスト時 Authorization: Bearer <JWT>
  → NestJS JwtAuthGuard が JWT を SUPABASE_JWT_SECRET で検証
  → payload.sub（Supabase UID）= users.id を CurrentUser として注入
```

### フェーズ間の依存関係

```
フェーズ1（基盤）
  └── フェーズ2（Auth）
       └── フェーズ3（Groups）
            ├── フェーズ4（Calendars）
            │    └── フェーズ5（Events）
            └── フェーズ6（Shifts）

フェーズ7（共通型）→ フェーズ8（Web基盤）→ フェーズ9（Web画面）
※ フェーズ7〜9 は フェーズ1〜6 と並行して開始可能
```

---

## 関連ドキュメント

- [要件書](./requirements.md)
- [DB スキーマ](./schema.dbml)
- [OpenAPI 仕様](./openapi.yaml)
- [技術スタック仕様書](./tech-stack.md)
- [コーディング規約](./coding-conventions.md)

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-06-16 | 初版作成（Prisma + Supabase Auth 構成） |
| 2026-06-19 | Shifts サービスの日付フォーマット変換仕様を追記（`@db.Date` → YYYY-MM-DD） |
