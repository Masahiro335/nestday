# 技術スタック仕様書

## 概要

カレンダー共有アプリのモノレポ構成における技術選定とその理由、バージョン、役割を記載する。

---

## モノレポ構成

```
nestday/
├── apps/
│   ├── web/          # Next.js フロントエンド
│   └── api/          # NestJS バックエンド
├── packages/
│   └── types/        # フロント・バック共通の型定義
├── package.json      # ルート（npm workspaces）
└── turbo.json        # Turborepo 設定
```

### パッケージ管理

| ツール | バージョン | 用途 |
|--------|-----------|------|
| **npm workspaces** | npm 同梱 | モノレポ内の依存関係管理 |
| **Turborepo** | ^1.10.16 | タスクの並列実行・キャッシュ |

Turborepo により `lint` / `type-check` / `build` を並列で実行し、CI のビルド時間を短縮する。

---

## フロントエンド（`apps/web`）

### コアフレームワーク

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **Next.js** | ^14.0.0 | React フレームワーク（App Router） |
| **React** | ^18.2.0 | UI ライブラリ |
| **TypeScript** | ^5.3.3 | 静的型付け |

**Next.js App Router** を採用。`app/` ディレクトリによるレイアウト・ページ管理、Server Components による初期描画最適化を活用する。

### UIコンポーネント・カレンダー

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **@fullcalendar/react** | ^6.1.8 | カレンダーコアコンポーネント |
| **@fullcalendar/daygrid** | ^6.1.8 | 月表示プラグイン |
| **@fullcalendar/timegrid** | ^6.1.8 | 週・日表示プラグイン |
| **@fullcalendar/interaction** | ^6.1.8 | ドラッグ&ドロップ・クリックイベント |

FullCalendar v6 の React 統合を使用。月表示メインで、複数カレンダーのイベントを色分けして重ね表示する。

### データフェッチ・HTTP

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **SWR** | ^2.2.4 | データフェッチ・キャッシュ |
| **Axios** | ^1.6.5 | HTTP クライアント |

SWR でキャッシュと再検証を管理し、リアルタイム同期不要の要件を満たす（画面フォーカス時の自動再取得）。

### 認証・外部サービス

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **@supabase/supabase-js** | ^2.38.4 | Supabase Auth クライアント |

Supabase Auth のセッション管理・JWT トークン取得に使用。取得したトークンを Axios のリクエストヘッダに付与して API 認証を行う。

### TypeScript 設定（`apps/web/tsconfig.json`）

```json
{
  "module": "esnext",
  "moduleResolution": "bundler",
  "jsx": "preserve",
  "noEmit": true
}
```

Next.js の bundler モードに合わせた設定。

---

## バックエンド（`apps/api`）

### コアフレームワーク

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **NestJS** | ^10.2.18 | Node.js サーバーフレームワーク |
| **TypeScript** | ^5.3.3 | 静的型付け |
| **reflect-metadata** | ^0.1.13 | デコレータメタデータ（NestJS 必須） |
| **RxJS** | ^7.8.1 | NestJS 内部依存 |

NestJS の DI（依存性注入）・モジュール分割・デコレータ構文により、保守性の高いバックエンドを構築する。

### 認証

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **@nestjs/passport** | ^10.0.3 | Passport.js の NestJS 統合 |
| **@nestjs/jwt** | ^11.0.1 | JWT 検証 |
| **passport** | ^0.7.0 | 認証ミドルウェア |
| **passport-jwt** | ^4.0.1 | JWT Strategy |

Supabase が発行した JWT をバックエンドで検証する。`JwtAuthGuard` で各エンドポイントを保護する。

### API ドキュメント・ユーティリティ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **@nestjs/swagger** | ^7.1.16 | OpenAPI ドキュメント自動生成 |
| **uuid** | ^9.0.1 | UUID 生成（招待トークン等） |

### TypeScript 設定（`apps/api/tsconfig.json`）

```json
{
  "module": "commonjs",
  "moduleResolution": "node",
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

NestJS のデコレータを有効にするため `emitDecoratorMetadata: true` が必須。

---

## データベース・認証基盤（Supabase）

| サービス | 用途 |
|---------|------|
| **Supabase PostgreSQL** | アプリデータの永続化（users / groups / calendars / events） |
| **Supabase Auth** | メール＋パスワード認証、JWT 発行 |

### 認証フロー

```
ユーザー → Supabase Auth でログイン
          → JWT 取得
          → Next.js クライアントが JWT を保持
          → API リクエスト時に Authorization ヘッダに付与
          → NestJS が JWT を検証してリクエストを処理
```

### RLS（Row Level Security）

現時点では未実装。将来的にユーザー単位のデータ保護に適用予定。

---

## 共通型定義（`packages/types`）

フロントエンドとバックエンドで共有する TypeScript 型を一元管理する。

```
packages/types/src/index.ts
```

| 型グループ | 内容 |
|-----------|------|
| `User` / `Group` / `GroupMember` | ユーザー・グループ関連 |
| `Calendar` / `Event` | カレンダー・イベント |
| `*Request` / `*Response` | API リクエスト/レスポンス型 |
| `EVENT_COLORS` / `EventColor` | イベントカラープリセット |

---

## インフラ・デプロイ

| 対象 | サービス | 環境 |
|------|---------|------|
| **Web (Next.js)** | Vercel | 開発：Preview デプロイ / 本番：Production デプロイ |
| **API (NestJS)** | Render | 開発：dev サービス / 本番：prod サービス |
| **DB / Auth** | Supabase | プロジェクト単位で管理 |

### デプロイフロー

```
develop ブランチへのマージ
  → Vercel Preview デプロイ（Web）
  → Render dev デプロイ（API）

release ブランチへのマージ
  → Vercel Production デプロイ（Web）
  → Render prod デプロイ（API）
```

詳細は [CI/CD 仕様（requirements.md）](./requirements.md#cicd) を参照。

---

## 開発ツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| **ESLint** | ^8.55.0 | コード品質チェック |
| **@typescript-eslint** | ^6.14.0 | TypeScript 用 ESLint ルール |
| **Prettier** | ^3.1.0 | コードフォーマット |
| **ts-node** | ^10.9.2 | TypeScript の直接実行（API 開発時） |

### Node.js バージョン

```
>=18.17.0（package.json の engines フィールドで指定）
```

---

## 今後の拡張候補

| 技術 | 用途 |
|------|------|
| **rrule** | 繰り返しイベント対応 |
| **ical-generator** | iCal エクスポート |
| **@supabase/realtime** | リアルタイム同期（現在は不要） |

---

## 関連ドキュメント

- [要件書](./requirements.md)
- [DB スキーマ](./schema.dbml)
- [OpenAPI 仕様](./openapi.yaml)

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-06-15 | 初版作成 |
