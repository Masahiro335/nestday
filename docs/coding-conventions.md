# コーディング規約

## 基本方針

- **TypeScript strict モード**を全パッケージで適用する（`any` は原則禁止）
- **ESLint + Prettier** の自動修正に従う（保存時に自動適用）
- **フロントエンドとバックエンドで命名・構造のルールを統一**する

---

## フォーマット（Prettier）

ルートの `.prettierrc` が全パッケージに適用される。

| 設定             | 値                                       |
| ---------------- | ---------------------------------------- |
| セミコロン       | あり（`semi: true`）                     |
| クォート         | シングルクォート（`singleQuote: true`）  |
| 末尾カンマ       | ES5 互換の箇所（`trailingComma: "es5"`） |
| 1行の最大文字数  | 100文字（`printWidth: 100`）             |
| インデント       | スペース2つ（`tabWidth: 2`）             |
| アロー関数の引数 | 常に括弧あり（`arrowParens: "always"`）  |

フォーマットはコミット前に必ず実行する。

```bash
npm run format
```

---

## 命名規則

### 共通

| 対象                 | 形式                 | 例                                  |
| -------------------- | -------------------- | ----------------------------------- |
| 変数・関数           | camelCase            | `groupId`, `fetchEvents()`          |
| 定数（変更不可）     | SCREAMING_SNAKE_CASE | `EVENT_COLORS`, `MAX_RETRY`         |
| 型・インターフェース | PascalCase           | `User`, `CreateEventRequest`        |
| ファイル名（TS/TSX） | kebab-case           | `event-card.tsx`, `auth.service.ts` |
| ディレクトリ名       | kebab-case           | `group-members/`, `use-cases/`      |

### フロントエンド固有

| 対象                         | 形式                             | 例                          |
| ---------------------------- | -------------------------------- | --------------------------- |
| React コンポーネント         | PascalCase                       | `EventCard`, `CalendarView` |
| カスタムフック               | `use` プレフィックス + camelCase | `useEvents`, `useAuth`      |
| Next.js ページ（App Router） | `page.tsx` / `layout.tsx`        | `app/events/page.tsx`       |

### バックエンド固有

| 対象                                      | 形式                            | 例                                    |
| ----------------------------------------- | ------------------------------- | ------------------------------------- |
| NestJS モジュール・サービス・コントローラ | PascalCase                      | `EventsService`, `GroupsController`   |
| DTO クラス                                | PascalCase + `Dto` サフィックス | `CreateEventDto`, `UpdateCalendarDto` |
| デコレータ引数                            | kebab-case（ルートパス）        | `@Controller('group-members')`        |

---

## TypeScript

### `any` の禁止

`any` は使用しない。型が不明な場合は `unknown` を使い、型ガードで絞り込む。

```typescript
// Bad
function parse(data: any) { ... }

// Good
function parse(data: unknown) {
  if (typeof data === 'string') { ... }
}
```

### 型アサーションの制限

`as` による型アサーションは、型推論が不可能な場合のみ使用する。

```typescript
// Bad（型推論で解決できる場合）
const id = response.id as string;

// Good
const id: string = response.id;
```

### 非nullアサーション（`!`）の禁止

`!` による非nullアサーションは使用しない。オプショナルチェーン（`?.`）やガード節を使う。

```typescript
// Bad
const name = user!.name;

// Good
const name = user?.name ?? '';
```

### インターフェース vs 型エイリアス

- オブジェクト形状の定義は **`interface`** を使用する
- ユニオン型・交差型・プリミティブ型のエイリアスは **`type`** を使用する

```typescript
// オブジェクト形状 → interface
interface CreateEventRequest {
  title: string;
  start_at: string;
}

// ユニオン型 → type
type EventColor = '#FF6B6B' | '#4ECDC4' | '#45B7D1';
```

### 共通型の参照

フロントエンド・バックエンド共通の型は `packages/types` から import する（同等の型を各パッケージで再定義しない）。

```typescript
import type { Event, CreateEventRequest } from '@calendar-share/types';
```

---

## フロントエンド（Next.js / React）

### ディレクトリ構成

```
apps/web/
├── app/                  # Next.js App Router（ページ・レイアウト）
│   ├── (auth)/           # 認証不要ページグループ
│   ├── (main)/           # 認証必要ページグループ
│   └── layout.tsx
├── components/           # 共通コンポーネント
│   ├── ui/               # 汎用UIパーツ（Button, Input等）
│   └── features/         # 機能単位のコンポーネント
│       ├── calendar/
│       └── events/
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ・設定
│   ├── api.ts            # Axios インスタンス
│   └── supabase.ts       # Supabase クライアント
└── types/                # フロントエンド固有の型（packages/types を補完）
```

### コンポーネント

- 1ファイル = 1コンポーネントを基本とする
- `export default` でコンポーネントを export する
- Props は `interface` で定義し、コンポーネントと同ファイルに置く

```typescript
interface EventCardProps {
  event: Event;
  onEdit: (id: string) => void;
}

export default function EventCard({ event, onEdit }: EventCardProps) {
  return <div>...</div>;
}
```

### データフェッチ

- SWR を使ってサーバーデータをフェッチ・キャッシュする
- フェッチロジックはカスタムフックに切り出す

```typescript
// hooks/use-events.ts
export function useEvents(groupId: string) {
  const { data, error, isLoading } = useSWR(`/groups/${groupId}/events`, fetcher);
  return { events: data, error, isLoading };
}
```

### Server Components / Client Components

- デフォルトは **Server Component**（`'use client'` なし）
- インタラクション（onClick・useState・useEffect）が必要な場合のみ `'use client'` を付与する

---

## バックエンド（NestJS）

### ディレクトリ構成

```
apps/api/src/
├── main.ts               # エントリポイント
├── app.module.ts         # ルートモジュール
├── auth/                 # 認証モジュール
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
├── groups/               # グループモジュール
│   ├── groups.module.ts
│   ├── groups.controller.ts
│   ├── groups.service.ts
│   └── dto/
│       ├── create-group.dto.ts
│       └── update-group.dto.ts
├── calendars/
├── events/
└── common/               # 共通処理（guard, filter, decorator等）
    ├── guards/
    └── filters/
```

機能単位でモジュールを分割し、`common/` に横断的な処理をまとめる。

### DTO

- リクエストボディは必ず DTO クラスで定義する
- `@nestjs/swagger` のデコレータ（`@ApiProperty`）を付与してドキュメントを自動生成する

```typescript
export class CreateEventDto {
  @ApiProperty({ example: 'チームMTG' })
  title: string;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  start_at: string;

  @ApiProperty({ example: '2026-06-15T11:00:00Z' })
  end_at: string;
}
```

### レスポンス形式

- 成功レスポンスはリソースオブジェクト（または配列）をそのまま返す
- エラーレスポンスは `ErrorResponse` 型に統一する（`packages/types` で定義）

```typescript
// 成功: リソースをそのまま返す
return event;

// エラー: NestJS の例外クラスを使用
throw new NotFoundException('Event not found');
```

### 認証ガード

保護するエンドポイントには `@UseGuards(JwtAuthGuard)` を付与する。コントローラ単位またはメソッド単位で適用できる。

```typescript
@Controller('events')
@UseGuards(JwtAuthGuard)  // コントローラ全体に適用
export class EventsController { ... }
```

---

## Git・ブランチ

### ブランチ命名

| 種別             | 形式              | 例                       |
| ---------------- | ----------------- | ------------------------ |
| 機能追加         | `feature/<内容>`  | `feature/event-create`   |
| バグ修正         | `fix/<内容>`      | `fix/calendar-color-bug` |
| ドキュメント     | `docs/<内容>`     | `docs/api-spec`          |
| リファクタリング | `refactor/<内容>` | `refactor/auth-module`   |
| CI/CD            | `ci/<内容>`       | `ci/add-test-workflow`   |

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に準拠する。

```
<type>: <概要（日本語可）>
```

| type       | 用途                               |
| ---------- | ---------------------------------- |
| `feat`     | 機能追加                           |
| `fix`      | バグ修正                           |
| `docs`     | ドキュメントのみの変更             |
| `refactor` | 機能変更を伴わないリファクタリング |
| `ci`       | CI/CD 設定の変更                   |
| `chore`    | ビルドプロセス・補助ツールの変更   |

```bash
# 例
feat: イベント作成APIを実装
fix: カレンダー削除時のDB外部キーエラーを修正
docs: OpenAPI仕様にイベント更新エンドポイントを追加
```

### PR ルール

- マージ先は常に `develop` ブランチ

---

## 関連ドキュメント

- [技術スタック仕様書](./tech-stack.md)
- [環境構築手順書](./setup.md)
- [要件書](./requirements.md)

## 更新履歴

| 日付       | 内容     |
| ---------- | -------- |
| 2026-06-15 | 初版作成 |
