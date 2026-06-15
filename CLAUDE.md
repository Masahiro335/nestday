# CLAUDE.md - AI Assistant Guide

このファイルは Claude AI と協作するためのエントリーポイントです。

## プロジェクト構造

```
calendar-share/
├── apps/
│   ├── web/       # Next.js フロントエンド
│   └── api/       # NestJS バックエンド
├── packages/
│   └── types/     # 共通型定義
├── docs/
│   ├── requirements.md  # 要件書
│   ├── schema.dbml     # DBスキーマ
│   └── openapi.yaml    # API仕様
└── CLAUDE.md       # このファイル
```

## 開発環境セットアップ

### 1. 初期インストール

```bash
npm install
```

### 2. 環境変数の設定

- `.env.local` ファイルを作成（後述の template を参照）
- Supabase プロジェクトの認証情報を設定

### 3. 開発サーバー起動

```bash
npm run dev
# web: http://localhost:3000
# api: http://localhost:3001
```

## スタック構成

| レイヤー | 技術 |
|---------|------|
| **フロントエンド** | Next.js 14 + App Router + TypeScript |
| **UIコンポーネント** | React + FullCalendar v6 |
| **バックエンド** | NestJS + TypeScript |
| **DB/Auth** | Supabase (PostgreSQL + Auth) |
| **デプロイ** | Vercel (Web) + Render (API) |
| **パッケージ管理** | npm (workspaces) + Turborepo |

## 主要な仕様

### 認証
- メールアドレス + パスワード（Supabase Auth）

### グループ・ユーザー
- 1ユーザー = 1グループ（固定）
- 招待リンク（`/join/:token`）で参加可能

### カレンダー・イベント
- グループ内で複数カレンダーを作成可能
- イベント：タイトル・日時・メモ・色
- 編集・削除は作成者のみ

### 詳細は以下を参照：
- [要件書](./docs/requirements.md)
- [DB スキーマ](./docs/schema.dbml)
- [OpenAPI 仕様](./docs/openapi.yaml)

## ワークスペースコマンド

```bash
# 全体の開発
npm run dev

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npm run type-check

# フォーマット
npm run format

# クリーンアップ
npm run clean
```

## 個別アプリのコマンド

### フロントエンド (apps/web)

```bash
cd apps/web
npm run dev       # localhost:3000
npm run build
npm run lint
npm run type-check
```

### バックエンド (apps/api)

```bash
cd apps/api
npm run dev       # localhost:3001
npm run build
npm run lint
npm run type-check
```

## 重要な制約

- リアルタイム同期：**不要**（画面更新で十分）
- 通知機能：**なし**
- プラットフォーム：**Web のみ**
- セキュリティ：招待リンク は **制限なし**（誰でも参加可）

## 今後の拡張候補

- [ ] TodoList 統合
- [ ] Note 機能
- [ ] 繰り返しイベント対応 (rrule)
- [ ] iCal エクスポート (ical-generator)
- [ ] 権限管理の精細化
- [ ] モバイル対応

## Supabase セットアップ

### テーブルマイグレーション

```sql
-- schema.dbml を参考に、以下のテーブルを作成
-- users, groups, group_members, calendars, events

-- RLS (Row Level Security) ポリシーは後ほど実装予定
```

## トラブルシューティング

### ポート競合エラー
```bash
# 別のプロセスが使用していないか確認
lsof -i :3000
lsof -i :3001

# killする場合
kill -9 <PID>
```

### TypeScript エラー
```bash
npm run type-check  # 全ワークスペースで型チェック
```

### 依存関係の問題
```bash
npm run clean
npm install
```

## リソースリンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [NestJS ドキュメント](https://docs.nestjs.com)
- [Supabase ドキュメント](https://supabase.com/docs)
- [FullCalendar React](https://fullcalendar.io/docs/react)

## 最新更新

- **2026-06-12**: プロジェクト初期化、複数カレンダー対応

---

質問や提案がある場合は、このファイルを参照した上で相談してください。
