'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('ok');
        setMessage(data.message || '구독이 완료되었습니다!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || '오류가 발생했습니다.');
      }
    } catch {
      setStatus('error');
      setMessage('네트워크 오류가 발생했습니다.');
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-sky-800/50 bg-sky-950/30 p-6">
      <p className="text-sm font-semibold text-sky-300 mb-1">📬 매일 브리핑 받기</p>
      <p className="text-xs text-slate-400 mb-4">
        이메일을 등록하면 매일 오전 5시·오후 12시·오후 6시·자정 브리핑을 자동으로 받아보실 수 있습니다.
      </p>

      {status === 'ok' ? (
        <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
          <span>✅</span>
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5
                       text-sm text-slate-100 placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50
                       text-sm font-semibold text-white transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? '등록 중…' : '구독하기'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-2 text-xs text-red-400">{message}</p>
      )}
    </div>
  );
}
