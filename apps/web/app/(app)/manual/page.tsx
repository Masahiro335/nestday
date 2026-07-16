'use client';

import { useRouter } from 'next/navigation';

export default function ManualPage() {
  const router = useRouter();

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 24px)', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 36, height: 36, fontSize: 18, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, flex: 1, textAlign: 'center', marginRight: 36 }}>操作マニュアル</h1>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '0 auto' }}>

        {/* アプリ概要 */}
        <section>
          <div style={heroCard}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px' }}>Nestday</h2>
            <p style={{ fontSize: 14, color: '#3b82f6', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
              グループで予定・TODO・シフトを<br />共有・管理できるカレンダーアプリです
            </p>
          </div>
        </section>

        {/* ナビゲーション */}
        <section>
          <SectionTitle emoji="🧭" title="画面の切り替え方" />
          <Card>
            <p style={descText}>画面下部のナビゲーションバーで各機能に移動できます。</p>
            <div style={navMockup}>
              <NavItem emoji="🏠" label="プライベート" color="#3b82f6" active />
              <NavItem emoji="✅" label="TODO" color="#10b981" />
              <NavItem emoji="💼" label="仕事用" color="#f59e0b" />
              <NavItem emoji="⚙️" label="設定" color="#6b7280" />
            </div>
            <InfoBox>
              <b>⚙️ 設定</b>をタップするとメニューが開き、グループ・プロフィール・アカウント・操作マニュアルへ移動できます。
            </InfoBox>
          </Card>
        </section>

        {/* プライベートカレンダー */}
        <section>
          <SectionTitle emoji="🏠" title="プライベートカレンダー" />
          <Card>
            <StepList steps={[
              { icon: '👀', text: '月カレンダーで予定を確認できます。左右にスワイプして月を切り替えられます。' },
              { icon: '📌', text: '日付をタップすると、その日の予定一覧がドロワーで表示されます。' },
              { icon: '➕', text: '右下の青い＋ボタンで新しい予定を作成します。' },
              { icon: '✏️', text: '自分が作成した予定はタップして編集・削除できます。他の人の予定は閲覧のみです。' },
            ]} />

            <Divider />
            <SubTitle>予定作成のフォーム</SubTitle>
            <FieldList fields={[
              { label: '予定名', desc: '必須。予定のタイトルを入力します。' },
              { label: '開始・終了', desc: '日付と時刻を設定。「終日」にチェックで終日イベントになります。' },
              { label: '🔒 シークレット', desc: 'ONにすると自分だけに表示される非公開の予定になります。' },
              { label: 'カラー', desc: '予定の色をカラーパレットまたはマイカラーから選べます。' },
              { label: '詳細', desc: '場所（📍）とメモ（💬）を入力できます。' },
            ]} />

            <Divider />
            <SubTitle>グループ切り替え</SubTitle>
            <p style={descText}>ヘッダーのグループ名をタップすると、表示するグループを切り替えられます。</p>
            <p style={descText}>メンバーのアイコンをタップして特定メンバーの予定だけ表示することもできます。</p>
          </Card>
        </section>

        {/* TODO */}
        <section>
          <SectionTitle emoji="✅" title="TODO" />
          <Card>
            <StepList steps={[
              { icon: '📋', text: '上部のタブでTODOリストを切り替えます。「+ リスト追加」で新しいリストを作れます。' },
              { icon: '➕', text: '「＋ 追加」からTODOアイテムを入力して追加します。担当者と期限も設定できます。' },
              { icon: '☑️', text: 'TODOをタップすると完了済みになります。もう一度タップで未完了に戻せます。' },
              { icon: '🗑️', text: 'TODOを長押しまたはスワイプで削除できます。リスト自体は作成者のみ削除できます。' },
            ]} />
          </Card>
        </section>

        {/* 仕事用カレンダー */}
        <section>
          <SectionTitle emoji="💼" title="仕事用カレンダー（シフト）" />
          <Card>
            <StepList steps={[
              { icon: '📅', text: '月カレンダーでメンバーのシフトを確認できます。' },
              { icon: '🖊️', text: '日付をタップして自分のシフトを入力・変更できます。' },
              { icon: '🔧', text: '右下の「パターン管理」からシフトのパターン（早番・遅番など）を作成・管理できます。' },
            ]} />

            <Divider />
            <SubTitle>シフトパターンの登録</SubTitle>
            <p style={descText}>「パターン管理」→「＋ パターンを追加」から名前・略称・色・時間を設定して登録します。登録したパターンを日付ごとにワンタップで選択するだけでシフト入力が完了します。</p>
          </Card>
        </section>

        {/* グループ管理 */}
        <section>
          <SectionTitle emoji="👥" title="グループ管理" />
          <Card>
            <SubTitle>グループを作成する</SubTitle>
            <StepList steps={[
              { icon: '⚙️', text: '下部ナビの「設定」をタップしてメニューを開く' },
              { icon: '👥', text: '「グループ」をタップ' },
              { icon: '➕', text: '「＋ グループを作成する」をタップしてグループ名を入力' },
            ]} />

            <Divider />
            <SubTitle>メンバーを招待する</SubTitle>
            <StepList steps={[
              { icon: '📋', text: '設定 → グループ画面の「招待リンク」セクション' },
              { icon: '📤', text: '「コピー」ボタンでリンクをコピーして相手に共有します' },
              { icon: '🔗', text: '受け取った人はリンクをタップしてグループに参加できます（アカウント登録が必要）' },
            ]} />

            <Divider />
            <SubTitle>メンバー情報を確認する</SubTitle>
            <p style={descText}>グループ設定の「メンバー」一覧から各メンバーをタップすると、メモなどの詳細情報を確認できます。</p>

            <Divider />
            <SubTitle>グループを解散する（オーナーのみ）</SubTitle>
            <div style={warnBox}>
              ⚠️ グループを解散すると、グループ内の全カレンダー・イベント・TODO・シフトが完全に削除されます。この操作は取り消せません。
            </div>
          </Card>
        </section>

        {/* プロフィール設定 */}
        <section>
          <SectionTitle emoji="👤" title="プロフィール設定" />
          <Card>
            <p style={descText}>設定 → プロフィールから変更できます。</p>
            <FieldList fields={[
              { label: '表示名', desc: 'グループメンバーに表示される名前（50文字以内）' },
              { label: 'メールアドレス', desc: 'ログインに使用するメールアドレス' },
              { label: 'パスワード', desc: '変更する場合のみ入力（8文字以上）' },
              { label: 'メモ', desc: '自己紹介など（200文字以内）。他のメンバーが確認できます' },
            ]} />
          </Card>
        </section>

        {/* アカウント設定 */}
        <section>
          <SectionTitle emoji="🔐" title="アカウント設定" />
          <Card>
            <SubTitle>ログアウト</SubTitle>
            <p style={descText}>設定 → アカウント → 「ログアウト」でログアウトします。</p>
            <Divider />
            <SubTitle>アカウント削除</SubTitle>
            <div style={warnBox}>
              ⚠️ アカウントを削除するとアカウント情報と全グループのメンバーシップが削除されます。グループのオーナーは先にグループを解散してください。
            </div>
          </Card>
        </section>

        {/* カラーラベル */}
        <section>
          <SectionTitle emoji="🎨" title="マイカラー（カラーラベル）" />
          <Card>
            <p style={descText}>予定作成画面の「カラー編集」から独自の色に名前をつけて保存できます。保存したカラーは予定作成時に「マイカラー」として素早く選択できます。</p>
          </Card>
        </section>

        {/* フッター */}
        <div style={{ textAlign: 'center', padding: '8px 0', color: '#94a3b8', fontSize: 12 }}>
          Nestday 操作マニュアル
        </div>
      </div>
    </div>
  );
}

/* ─── 部品コンポーネント ─────────────────────────── */

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e40af', margin: 0 }}>{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e0e7ff',
    }}>
      {children}
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', margin: '0 0 8px', borderLeft: '3px solid #3b82f6', paddingLeft: 8 }}>
      {children}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '14px 0' }} />;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1d4ed8', lineHeight: 1.6, marginTop: 12 }}>
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: { icon: string; text: string }[] }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((step, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
            {step.icon}
          </div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

function FieldList({ fields }: { fields: { label: string; desc: string }[] }) {
  return (
    <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <dt style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: '#f0f4ff', borderRadius: 6, padding: '2px 8px', flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap' }}>
            {f.label}
          </dt>
          <dd style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{f.desc}</dd>
        </div>
      ))}
    </dl>
  );
}

function NavItem({ emoji, label, color, active }: { emoji: string; label: string; color: string; active?: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 0' }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? color : '#9ca3af' }}>{label}</span>
      {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, marginTop: 1 }} />}
    </div>
  );
}

/* ─── スタイル定数 ───────────────────────────────── */

const heroCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
  borderRadius: 20,
  padding: '28px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #c7d2fe',
};

const navMockup: React.CSSProperties = {
  display: 'flex',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#fff',
  margin: '12px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

const descText: React.CSSProperties = {
  fontSize: 13,
  color: '#374151',
  lineHeight: 1.7,
  margin: '0 0 8px',
};

const warnBox: React.CSSProperties = {
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  color: '#9a3412',
  lineHeight: 1.6,
  marginTop: 8,
};
