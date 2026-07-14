import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>ページが見つかりません</p>
      <Link href="/" style={{ marginTop: '1rem', color: '#0070f3', textDecoration: 'underline' }}>
        トップページへ戻る
      </Link>
    </div>
  );
}
