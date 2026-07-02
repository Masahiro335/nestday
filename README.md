# Nestday

家族・グループ向けのカレンダー共有アプリ。複数カレンダーをグループ内で共有し、シフト管理・TODOリストなども一元管理できます。

## 機能

- **カレンダー共有** — グループ内でプライベート・仕事用の複数カレンダーを共有
- **シフト管理** — シフトパターンの作成・日付への割り当て・グループ全員のシフト閲覧
- **TODOリスト** — グループ内で複数リストを作成・担当者・期限日の設定
- **シークレット予定** — 自分のみに表示されるプライベートイベント
- **カラーラベル** — イベント用のカスタムカラー管理
- **ローディングゲーム** — API応答が5秒超過時に恐竜ランゲームを表示

## スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| バックエンド | NestJS + TypeScript |
| DB / Auth | Supabase (PostgreSQL + Auth) |
| デプロイ | Vercel (Web) + Render (API) |
| モノレポ | npm workspaces + Turborepo |

## セットアップ

### 前提条件

- Node.js 18.17.0 以上
- Supabase プロジェクト

### インストール

```bash
npm install
```

### 環境変数

`apps/web/.env.local` と `apps/api/.env` を作成し、Supabase の認証情報を設定してください。

**apps/web/.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/api/.env**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

### 開発サーバー起動

```bash
npm run dev
# web: http://localhost:3000
# api: http://localhost:3001
```

## コマンド

```bash
npm run dev         # 全アプリの開発サーバー起動
npm run build       # 全アプリのビルド
npm run lint        # リント
npm run type-check  # 型チェック
npm run format      # コードフォーマット
npm run clean       # キャッシュ・node_modules削除
```

## プロジェクト構造

```
nestday/
├── apps/
│   ├── web/        # Next.js フロントエンド (port 3000)
│   └── api/        # NestJS バックエンド (port 3001)
├── packages/
│   └── types/      # 共通型定義
└── docs/
    ├── requirements.md  # 要件書
    ├── schema.dbml      # DBスキーマ
    └── openapi.yaml     # API仕様
```

## ブランチ戦略

| ブランチ | 用途 |
|---------|------|
| `main` | 初期ブランチ |
| `develop` | 開発用（PRマージ先） |
| `release` | リリース用 |

## ドキュメント

- [要件書](./docs/requirements.md)
- [DBスキーマ](./docs/schema.dbml)
- [OpenAPI仕様](./docs/openapi.yaml)
- [開発ガイド](./CLAUDE.md)
