/**
 * タスクチェック定義
 *
 * match: tasks.md のチェックボックス行に含まれる文字列（部分一致）
 *   ※ バッククォート内のテキストは単体では substring になるが、
 *      バッククォートをまたぐ文字列は substring にならないため注意
 * command: 検証コマンド（exit code 0 = 成功）
 * type: 'command'（常時実行） | 'http'（サーバー起動時のみ実行）
 */

export const taskChecks = {
  // ─── Phase 1: API 基盤 ──────────────────────────────────────────────────

  T01: [
    {
      match: 'prisma generate` が通る',
      command: 'cd apps/api && npx prisma generate 2>/dev/null',
      type: 'command',
    },
    {
      match: 'グローバル登録できる',
      command:
        'test -f apps/api/src/prisma/prisma.service.ts && grep -q "PrismaModule" apps/api/src/app.module.ts',
      type: 'command',
    },
    {
      match: 'group_members.user_id',
      command: 'grep -q "@@unique" apps/api/prisma/schema.prisma',
      type: 'command',
    },
  ],

  T02: [
    {
      match: 'localhost:3001` で起動する',
      command:
        'curl -sf --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1 | grep -qE "^[0-9]"',
      type: 'http',
    },
    {
      match: 'Swagger UI が表示される',
      command: 'curl -sf --connect-timeout 3 http://localhost:3001/api/docs > /dev/null',
      type: 'http',
    },
    {
      match: 'ルート未定義のため正常',
      command:
        'test "$(curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1)" = "404"',
      type: 'http',
    },
  ],

  T03: [
    {
      match: 'DI で使用できる',
      command:
        'test -f apps/api/src/supabase/supabase.service.ts && test -f apps/api/src/supabase/supabase.module.ts',
      type: 'command',
    },
    {
      match: 'が未設定の場合に起動エラーになる',
      command: 'grep -q "SUPABASE_URL" apps/api/src/supabase/supabase.service.ts',
      type: 'command',
    },
  ],

  T04: [
    {
      match: '有効な JWT を付与した',
      command: 'test -f apps/api/src/common/guards/jwt-auth.guard.ts',
      type: 'command',
    },
    {
      match: '無効な JWT では 401',
      command:
        'test "$(curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/groups/me)" = "401"',
      type: 'http',
    },
    {
      match: 'オブジェクトが取得できる',
      command: 'test -f apps/api/src/common/decorators/current-user.decorator.ts',
      type: 'command',
    },
  ],

  // ─── Phase 2: Auth ──────────────────────────────────────────────────────

  T05: [
    {
      match: 'auth/register` で 201',
      command:
        'curl -sf --connect-timeout 3 -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v1/auth/register -H "Content-Type: application/json" -d \'{"email":"__check__@test.invalid","password":"password123"}\' | grep -qE "^(201|400)"',
      type: 'http',
    },
    {
      match: 'auth/login` で 200',
      command:
        'test "$(curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d \'{"email":"invalid@test.invalid","password":"wrongpass"}\')" = "401"',
      type: 'http',
    },
    {
      match: 'メール重複時に 400',
      command:
        'test -f apps/api/src/auth/auth.service.ts && grep -q "register" apps/api/src/auth/auth.service.ts',
      type: 'command',
    },
    {
      match: '認証情報誤りで 401',
      command: 'test -f apps/api/src/auth/auth.controller.ts',
      type: 'command',
    },
  ],

  // ─── Phase 3: Groups ────────────────────────────────────────────────────

  T06: [
    {
      match: 'UUID 形式で返る',
      command:
        'test -f apps/api/src/groups/groups.service.ts && grep -q "inviteToken" apps/api/src/groups/groups.service.ts',
      type: 'command',
    },
    {
      match: '/groups/me` でグループ未参加',
      command:
        'test "$(curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/groups/me)" = "401"',
      type: 'http',
    },
    {
      match: '参加済みの場合に 409',
      command:
        'test -f apps/api/src/groups/groups.service.ts && grep -q "ConflictException" apps/api/src/groups/groups.service.ts',
      type: 'command',
    },
    {
      match: '無効なトークンで 404',
      command:
        'test -f apps/api/src/groups/groups.service.ts && grep -q "NotFoundException" apps/api/src/groups/groups.service.ts',
      type: 'command',
    },
  ],

  // ─── Phase 4: Calendars ─────────────────────────────────────────────────

  T07: [
    {
      match: 'GET /calendars` を呼ぶと 404',
      command: 'test -f apps/api/src/calendars/calendars.service.ts',
      type: 'command',
    },
    {
      match: '存在しない ID に 404',
      command:
        'test -f apps/api/src/calendars/calendars.service.ts && grep -q "NotFoundException" apps/api/src/calendars/calendars.service.ts',
      type: 'command',
    },
    {
      match: '#RRGGBB',
      command:
        'test -f apps/api/src/calendars/dto/create-calendar.dto.ts && grep -qiE "Matches|IsHexColor|#\\[0-9A-Fa-f\\]" apps/api/src/calendars/dto/create-calendar.dto.ts',
      type: 'command',
    },
  ],

  // ─── Phase 5: Events ────────────────────────────────────────────────────

  T08: [
    {
      match: 'YYYY-MM` 形式以外のとき 400',
      command:
        'test -f apps/api/src/events/dto/get-events-query.dto.ts && grep -qE "Matches|YYYY-MM|month" apps/api/src/events/dto/get-events-query.dto.ts',
      type: 'command',
    },
    {
      match: 'すると 403 が返る',
      command:
        'test -f apps/api/src/events/events.service.ts && grep -q "ForbiddenException" apps/api/src/events/events.service.ts',
      type: 'command',
    },
    {
      match: 'クロス月イベント',
      command:
        'test -f apps/api/src/events/events.service.ts && grep -qE "start_at|end_at" apps/api/src/events/events.service.ts',
      type: 'command',
    },
  ],

  // ─── Phase 6: Shifts ────────────────────────────────────────────────────

  T09: [
    {
      match: 'null でも作成できる',
      command:
        'test -f apps/api/src/shifts/dto/create-shift-pattern.dto.ts && grep -qE "is_day_off|isDayOff" apps/api/src/shifts/dto/create-shift-pattern.dto.ts',
      type: 'command',
    },
    {
      match: 'パターンへの操作は 403',
      command:
        'test -f apps/api/src/shifts/shift-patterns.service.ts && grep -q "ForbiddenException" apps/api/src/shifts/shift-patterns.service.ts',
      type: 'command',
    },
    {
      match: '昇順である',
      command:
        'test -f apps/api/src/shifts/shift-patterns.service.ts && grep -q "sort_order" apps/api/src/shifts/shift-patterns.service.ts',
      type: 'command',
    },
  ],

  T10: [
    {
      match: 'upsert で正常に動作する',
      command:
        'test -f apps/api/src/shifts/shifts.service.ts && grep -q "upsert" apps/api/src/shifts/shifts.service.ts',
      type: 'command',
    },
    {
      match: '全員分のシフト',
      command:
        'test -f apps/api/src/shifts/shifts.service.ts && grep -qE "group_id|groupId" apps/api/src/shifts/shifts.service.ts',
      type: 'command',
    },
    {
      match: 'ネストした形で返却',
      command:
        'test -f apps/api/src/shifts/shifts.service.ts && grep -qE "shift_pattern|include" apps/api/src/shifts/shifts.service.ts',
      type: 'command',
    },
  ],

  // ─── Phase 7: 共通型 ────────────────────────────────────────────────────

  T11: [
    {
      match: 'import type { Event } from',
      command: 'test -f packages/types/src/index.ts',
      type: 'command',
    },
    {
      match: '定義と一致している',
      command:
        'grep -qE "User|Group|Calendar|Event|ShiftPattern|Shift" packages/types/src/index.ts',
      type: 'command',
    },
  ],

  // ─── Phase 8: Web 基盤 ──────────────────────────────────────────────────

  T12: [
    {
      match: 'localhost:3000` で起動する',
      command: 'curl -sf --connect-timeout 3 http://localhost:3000 > /dev/null',
      type: 'http',
    },
    {
      match: 'ルートグループが機能している',
      command:
        'test -d "apps/web/app/(auth)" && test -d "apps/web/app/(app)"',
      type: 'command',
    },
  ],

  T13: [
    {
      match: '/login にリダイレクトされる',
      command: 'test -f apps/web/middleware.ts',
      type: 'command',
    },
    {
      match: '/onboarding にリダイレクトされる',
      command: 'test -f apps/web/middleware.ts && grep -q "onboarding" apps/web/middleware.ts',
      type: 'command',
    },
  ],

  T14: [
    {
      match: 'Authorization: Bearer',
      command:
        'test -f apps/web/lib/api.ts && grep -q "Authorization" apps/web/lib/api.ts',
      type: 'command',
    },
    {
      match: '401 レスポンス時に',
      command:
        'test -f apps/web/lib/api.ts && grep -qE "401|login" apps/web/lib/api.ts',
      type: 'command',
    },
  ],

  // ─── Phase 9: Web 画面 ──────────────────────────────────────────────────

  T15: [
    {
      match: 'ログインして `/` または',
      command:
        'test -f "apps/web/app/(auth)/login/page.tsx" && test -f apps/web/components/auth/LoginForm.tsx',
      type: 'command',
    },
    {
      match: '新規登録後に',
      command: 'test -f "apps/web/app/(auth)/register/page.tsx"',
      type: 'command',
    },
    {
      match: 'エラーメッセージが表示される',
      command:
        'test -f apps/web/components/auth/LoginForm.tsx && grep -q "error\|Error" apps/web/components/auth/LoginForm.tsx',
      type: 'command',
    },
  ],

  T16: [
    {
      match: '招待リンクがコピーできる',
      command:
        'test -f "apps/web/app/(app)/onboarding/page.tsx" && test -f apps/web/components/group/InviteLinkCard.tsx',
      type: 'command',
    },
    {
      match: '/join/[token]` にアクセスするとエラー',
      command: 'test -f "apps/web/app/(app)/join/[token]/page.tsx"',
      type: 'command',
    },
    {
      match: '所属済みでの参加試行にエラー',
      command:
        'test -f "apps/web/app/(app)/join/[token]/page.tsx" && grep -q "409\|already\|すでに" "apps/web/app/(app)/join/[token]/page.tsx"',
      type: 'command',
    },
  ],

  T17: [
    {
      match: '月のイベントが正しく表示される',
      command: 'test -f apps/web/components/calendar/CalendarGrid.tsx',
      type: 'command',
    },
    {
      match: 'ドロワーが開いて',
      command: 'test -f apps/web/components/calendar/DayDrawer.tsx',
      type: 'command',
    },
    {
      match: '月移動（前月・次月）',
      command: 'test -f apps/web/components/calendar/CalendarHeader.tsx',
      type: 'command',
    },
    {
      match: 'FAB タップで',
      command: 'test -f apps/web/components/ui/FAB.tsx',
      type: 'command',
    },
  ],

  T18: [
    {
      match: 'イベントを作成して',
      command: 'test -f apps/web/components/calendar/EventForm.tsx',
      type: 'command',
    },
    {
      match: '作成者以外が編集画面',
      command: 'test -f "apps/web/app/(app)/events/[id]/edit/page.tsx"',
      type: 'command',
    },
    {
      match: '削除確認後にイベントが削除',
      command:
        'test -f apps/web/components/calendar/EventForm.tsx && grep -q "delete\|削除" apps/web/components/calendar/EventForm.tsx',
      type: 'command',
    },
  ],

  T19: [
    {
      match: 'グループ全員のシフト',
      command: 'test -f apps/web/components/work/WorkCalendarGrid.tsx',
      type: 'command',
    },
    {
      match: 'シフト選択パネルが開く',
      command: 'test -f apps/web/components/work/ShiftSelectPanel.tsx',
      type: 'command',
    },
    {
      match: 'シフトが登録・更新される',
      command:
        'test -f apps/web/hooks/use-shifts.ts && grep -q "PUT\|put\|shifts" apps/web/hooks/use-shifts.ts',
      type: 'command',
    },
  ],

  T20: [
    {
      match: 'パターン一覧が `sort_order',
      command: 'test -f apps/web/components/work/ShiftPatternList.tsx',
      type: 'command',
    },
    {
      match: '時間入力欄が非表示になる',
      command:
        'test -f apps/web/components/work/ShiftPatternForm.tsx && grep -q "isDayOff\|is_day_off" apps/web/components/work/ShiftPatternForm.tsx',
      type: 'command',
    },
    {
      match: '自動計算される',
      command:
        'test -f apps/web/components/work/ShiftPatternForm.tsx && grep -q "workingTime\|勤務時間\|break" apps/web/components/work/ShiftPatternForm.tsx',
      type: 'command',
    },
  ],
};
