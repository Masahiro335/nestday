# 環境構築手順書

## 前提条件

| ツール | バージョン | 確認コマンド |
|--------|-----------|-------------|
| Node.js | >= 18.17.0 | `node -v` |
| npm | >= 9.0.0 | `npm -v` |
| Git | 任意 | `git -v` |

> **Dev Container 利用の場合**: VS Code + Docker があれば上記は不要。[Dev Container で起動する](#dev-container-で起動する（推奨）) を参照。

---

## 1. リポジトリのクローン

```bash
git clone https://github.com/Masahiro335/nestday.git
cd nestday
```

---

## 2. Supabase プロジェクトのセットアップ

認証・DBは Supabase を使用する。以下の手順でプロジェクトを作成し、接続情報を取得する。

### 2-1. プロジェクト作成

1. [Supabase](https://supabase.com) にアクセスしてアカウント作成 / ログイン
2. **New project** をクリック
3. 以下を入力してプロジェクトを作成

| 項目 | 値 |
|------|---|
| Project name | `calendar-share`（任意） |
| Database Password | 任意（安全なパスワードを設定・メモしておく） |
| Region | 最寄りのリージョン（例: Northeast Asia (Tokyo)） |

4. プロジェクトの初期化が完了するまで待つ（1〜2分）

### 2-2. 接続情報の取得

Supabase ダッシュボード > **Project Settings** > **API** から以下を取得する。

| キー | 場所 |
|------|------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` `public` キー |
| `SUPABASE_SERVICE_KEY` | `service_role` キー（バックエンド専用・外部非公開） |

### 2-3. DBテーブルの作成

Supabase ダッシュボード > **SQL Editor** を開き、以下の SQL を実行する。

```sql
-- users テーブル
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on users (email);

-- groups テーブル
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_token text unique not null,
  owner_id uuid not null references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on groups (invite_token);
create index on groups (owner_id);

-- group_members テーブル
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id),
  user_id uuid not null references users(id),
  joined_at timestamptz default now(),
  unique (user_id)   -- 1ユーザー = 1グループ制約
);
create index on group_members (group_id);
create index on group_members (user_id);

-- calendars テーブル
create table calendars (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id),
  name text not null,
  color text not null,
  created_by uuid not null references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on calendars (group_id);
create index on calendars (created_by);

-- events テーブル
create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id),
  calendar_id uuid not null references calendars(id),
  created_by uuid not null references users(id),
  title text not null,
  memo text,
  color text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_all_day boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on events (group_id);
create index on events (calendar_id);
create index on events (created_by);
create index on events (start_at, end_at);
```

### 2-4. Supabase Auth の設定

Supabase ダッシュボード > **Authentication** > **Providers** で **Email** が有効になっていることを確認する（デフォルトで有効）。

> **メール確認の無効化（開発時推奨）**: Authentication > Email Templates > **Confirm signup** のメール確認を無効にすると開発がスムーズになる。
> ダッシュボード > Authentication > **Settings** > **Email Auth** > "Confirm email" をオフに設定。

---

## 3. 依存パッケージのインストール

```bash
npm install
```

ルートで実行すると `apps/web`・`apps/api`・`packages/types` の全パッケージが一括インストールされる。

---

## 4. 環境変数の設定

### フロントエンド（`apps/web`）

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

`apps/web/.env.local` を編集する。

```env
# Supabase（2-2 で取得した値を設定）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# API エンドポイント（開発時はデフォルトのままでOK）
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# アプリ情報（開発時はデフォルトのままでOK）
NEXT_PUBLIC_APP_NAME=Calendar Share
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### バックエンド（`apps/api`）

```bash
cp apps/api/.env.example apps/api/.env
```

`apps/api/.env` を編集する。

```env
# Supabase（2-2 で取得した値を設定）
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...  # service_role キー

# JWT（Supabase の JWT Secret と同じ値を設定）
# 取得場所: Project Settings > API > JWT Settings > JWT Secret
JWT_SECRET=your-supabase-jwt-secret

# サーバー設定（開発時はデフォルトのままでOK）
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
```

> **JWT_SECRET について**: Supabase が発行する JWT を NestJS 側で検証するため、Supabase プロジェクトの JWT Secret と同じ値を設定する必要がある。
> **Project Settings** > **API** > **JWT Settings** > **JWT Secret** から取得する。

---

## 5. 開発サーバーの起動

```bash
npm run dev
```

| サービス | URL |
|---------|-----|
| フロントエンド (Next.js) | http://localhost:3000 |
| バックエンド API (NestJS) | http://localhost:3001 |
| Swagger UI (API ドキュメント) | http://localhost:3001/api/docs |

両サーバーが同時に起動する。初回はビルドに数秒かかる。

---

## 6. 動作確認

### フロントエンド

ブラウザで http://localhost:3000 にアクセスし、ページが表示されることを確認する。

### バックエンド API

```bash
curl http://localhost:3001/api/v1
```

または Swagger UI (http://localhost:3001/api/docs) でエンドポイントを確認する。

---

## Dev Container で起動する（推奨）

Node.js のバージョン管理不要で、チーム全員が同一環境で開発できる。

### 前提

- [VS Code](https://code.visualstudio.com/) インストール済み
- [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) インストール済み
- Docker Desktop 起動済み

### 手順

1. VS Code でリポジトリを開く
2. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）> **Dev Containers: Reopen in Container**
3. コンテナのビルドが完了するまで待つ（初回は5〜10分）
4. コンテナ内で自動的に `npm install` が実行される
5. [4. 環境変数の設定](#4-環境変数の設定) から作業を開始する

### コンテナ仕様

| 項目 | 内容 |
|------|------|
| ベースイメージ | `mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm` |
| Node.js | 20.x |
| プリインストール | GitHub CLI、Supabase CLI、NestJS CLI |
| 推奨メモリ | 8GB 以上（Next.js + NestJS 同時起動に必要） |
| ポートフォワード | 3000, 3001, 54321, 54322, 54323 |

---

## よく使うコマンド

```bash
# 開発サーバー起動（全アプリ）
npm run dev

# ビルド（全アプリ）
npm run build

# Lint（全アプリ）
npm run lint

# 型チェック（全アプリ）
npm run type-check

# コードフォーマット
npm run format

# キャッシュ・ビルド成果物の削除
npm run clean
```

---

## トラブルシューティング

### `npm install` が失敗する

```bash
npm run clean
npm install
```

### ポートが使用中

```bash
# 使用中のプロセスを確認
lsof -i :3000
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

### 型エラーが出る

```bash
npm run type-check
```

エラー内容を確認し、`packages/types/src/index.ts` の型定義と一致しているか確認する。

### Supabase への接続エラー

- 環境変数（`SUPABASE_URL` / `SUPABASE_ANON_KEY`）が正しく設定されているか確認する
- Supabase ダッシュボードでプロジェクトが起動しているか確認する

### JWT 検証エラー

- `apps/api/.env` の `JWT_SECRET` が Supabase の JWT Secret と一致しているか確認する
- **Project Settings** > **API** > **JWT Settings** > **JWT Secret** の値と照合する

---

## 関連ドキュメント

- [要件書](./requirements.md)
- [技術スタック仕様書](./tech-stack.md)
- [DB スキーマ](./schema.dbml)
- [OpenAPI 仕様](./openapi.yaml)

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-06-15 | 初版作成 |
