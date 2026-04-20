import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Coin 브리핑',
  description: '매일 오전 5시 자동 생성되는 AI 코인 시장 브리핑',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f172a' }}>
        {/* Header */}
        <header
          className="sticky top-0 z-50 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🪙</span>
              <span className="text-white font-bold text-xl tracking-tight group-hover:opacity-90 transition-opacity">
                AI Coin 브리핑
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sky-100 hover:text-white font-medium transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/archive"
                className="text-sky-100 hover:text-white font-medium transition-colors text-sm"
              >
                Archive
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-5 text-center text-slate-500 text-sm">
            매일 오전 5시 자동 업데이트 | AI Trader
          </div>
        </footer>
      </body>
    </html>
  );
}
