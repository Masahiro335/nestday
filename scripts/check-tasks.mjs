#!/usr/bin/env node
/**
 * タスク完了条件チェッカー
 *
 * 使い方:
 *   node scripts/check-tasks.mjs         # 全タスクチェック
 *   node scripts/check-tasks.mjs T01     # 特定タスクのみ
 *   node scripts/check-tasks.mjs T01 T02 # 複数タスク指定
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TASKS_FILE = resolve(ROOT, 'docs/tasks.md');

const { taskChecks } = await import('./task-checks.mjs');

// ─── ANSI カラー ────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// ─── CLI 引数 ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2).map((a) => a.toUpperCase());
const targetIds = args.length > 0 ? args : Object.keys(taskChecks);

// ─── サーバー起動確認 ────────────────────────────────────────────────────────
function isServerRunning(port) {
  try {
    execSync(`curl -s -o /dev/null --connect-timeout 2 http://localhost:${port}`, {
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

const apiRunning = isServerRunning(3001);
const webRunning = isServerRunning(3000);

// ─── コマンド実行 ────────────────────────────────────────────────────────────
function runCommand(command) {
  try {
    execSync(command, { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── tasks.md パーサー ───────────────────────────────────────────────────────
function parseTasksFile(content) {
  const lines = content.split('\n');
  // 各行のインデックスと内容を保持する
  return lines.map((text, index) => ({ index, text }));
}

// チェックボックス行を match 文字列で特定して [x] に更新
function updateCheckbox(content, match, checked) {
  const marker = checked ? '[x]' : '[ ]';
  const targetMarker = checked ? '[ ]' : '[x]';

  const lines = content.split('\n');
  let updated = false;

  const newLines = lines.map((line) => {
    // `- [ ] ...match...` または `- [x] ...match...` の行を探す
    if (
      (line.includes('- [ ]') || line.includes('- [x]')) &&
      line.includes(match)
    ) {
      const newLine = line.replace(`- ${targetMarker}`, `- ${marker}`);
      if (newLine !== line) {
        updated = true;
        return newLine;
      }
      // すでに目的の状態なら変更なし
      if (line.includes(`- ${marker}`)) {
        updated = true; // すでに正しい状態
      }
    }
    return line;
  });

  return { content: newLines.join('\n'), updated };
}

// ─── メイン処理 ─────────────────────────────────────────────────────────────
let tasksContent = readFileSync(TASKS_FILE, 'utf-8');

console.log(`\n${C.bold}=== タスク完了条件チェッカー ===${C.reset}`);

if (!apiRunning) {
  console.log(`${C.yellow}⚠ API サーバー (localhost:3001) が起動していません。HTTP チェックをスキップします。${C.reset}`);
}
if (!webRunning) {
  console.log(`${C.yellow}⚠ Web サーバー (localhost:3000) が起動していません。HTTP チェックをスキップします。${C.reset}`);
}
console.log('');

let totalChecks = 0;
let passedChecks = 0;
let skippedChecks = 0;

for (const taskId of targetIds) {
  const checks = taskChecks[taskId];
  if (!checks) {
    console.log(`${C.yellow}⚠ ${taskId}: チェック定義が見つかりません${C.reset}`);
    continue;
  }

  console.log(`${C.bold}${C.cyan}─── ${taskId} ───${C.reset}`);

  for (const check of checks) {
    totalChecks++;

    // HTTP チェックのスキップ判定
    if (check.type === 'http') {
      const port = check.command.includes(':3000') ? 3000 : 3001;
      const serverRunning = port === 3000 ? webRunning : apiRunning;
      if (!serverRunning) {
        skippedChecks++;
        console.log(`  ${C.gray}○ [SKIP] ${check.match}${C.reset}`);
        continue;
      }
    }

    const result = runCommand(check.command);

    if (result.ok) {
      passedChecks++;
      console.log(`  ${C.green}✓${C.reset} ${check.match}`);
      // tasks.md のチェックボックスを [x] に更新
      const { content: newContent } = updateCheckbox(tasksContent, check.match, true);
      tasksContent = newContent;
    } else {
      console.log(`  ${C.red}✗${C.reset} ${check.match}`);
    }
  }

  console.log('');
}

// ─── tasks.md の保存 ────────────────────────────────────────────────────────
writeFileSync(TASKS_FILE, tasksContent, 'utf-8');

// ─── サマリー ────────────────────────────────────────────────────────────────
const skippedNote = skippedChecks > 0 ? ` (${skippedChecks} スキップ)` : '';
console.log(
  `${C.bold}結果: ${passedChecks}/${totalChecks - skippedChecks} チェック通過${skippedNote}${C.reset}`
);
console.log(`${C.green}docs/tasks.md を更新しました${C.reset}\n`);
