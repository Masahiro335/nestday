# Supabase Keep-Alive (ハートビート)

## 目的

Supabase 無料プランは **7日間 DB アクセスがないとプロジェクトを自動一時停止** する。
これを防ぐため、NestJS バックエンド（apps/api）に定期 ping を組み込んでいる。

## 仕組み

| 項目 | 内容 |
|------|------|
| ファイル | `apps/api/src/keep-alive/supabase-keep-alive.service.ts` |
| モジュール | `apps/api/src/keep-alive/keep-alive.module.ts` |
| スケジュール | 毎週月・木 09:00 UTC（cron: `0 9 * * 1,4`） |
| 処理内容 | `users` テーブルから `id` 1件を SELECT（Prisma 経由） |
| ログ | 成功: `[KeepAlive] Supabase ping succeeded` / 失敗: `[KeepAlive] Supabase ping failed` |

`@nestjs/schedule` の `ScheduleModule.forRoot()` が `AppModule` に登録済みのため、
デプロイ後はサーバー起動だけで自動実行される。

## Render のスリープ対策

Render 無料プランは **15分間リクエストがないとインスタンスをスリープ** させる。
スリープ中は NestJS Cron も動かないため、Keep-Alive が実行されない恐れがある。

### 推奨対策: 外部からの定期 ping

以下のいずれかで Render 自体を起こし続ける:

| 方法 | コスト | 設定 |
|------|--------|------|
| **UptimeRobot**（無料） | 無料 | https://uptimerobot.com → `GET https://<render-api>.onrender.com/api/v1/health` を5分間隔で監視 |
| **cron-job.org**（無料） | 無料 | `GET` を10分間隔で実行 |
| Render paid plan へ移行 | 有料 | スリープなし |

`GET /api/v1/health` など軽量なヘルスチェックエンドポイントをターゲットにすること。

## 手動テスト方法

### 1. Cron メソッドを直接呼び出す（ローカル）

```bash
# API サーバーを起動
cd apps/api && npm run dev

# 別ターミナルで NestJS の REPL モードを使う（参考用）
# 実際には以下の curl で health 確認後、ログを観察するのが最速
curl http://localhost:3001/api/v1/health
```

### 2. Cron 間隔を一時的に短縮してログ確認

`supabase-keep-alive.service.ts` の cron 式を `* * * * *`（毎分）に変えてサーバー起動すると、
1分以内に `[KeepAlive] Supabase ping succeeded` がコンソールに出力される。

確認後は必ず `0 9 * * 1,4` に戻すこと。

### 3. 本番確認

Render のデプロイログ（Dashboard → Logs）で以下を検索:

```
[KeepAlive] Supabase ping
```

## 関連ファイル

- `apps/api/src/app.module.ts` — `ScheduleModule.forRoot()` と `KeepAliveModule` の登録
- `apps/api/src/keep-alive/` — Service と Module の実装
- `docs/requirements.md` — デプロイ構成（Render + Vercel）
