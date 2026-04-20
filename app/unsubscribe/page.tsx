'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const params = useSearchParams();
  const token  = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 링크입니다.');
      return;
    }
    fetch(`/api/subscribe?token=${encodeURIComponent(token)}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then((data) => {
        setStatus('ok');
        setMessage(data.message || '구독이 해지되었습니다.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('오류가 발생했습니다. 다시 시도해 주세요.');
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      {status === 'loading' && (
        <p className="text-slate-400 text-base">처리 중입니다…</p>
      )}
      {status === 'ok' && (
        <>
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-xl font-bold text-slate-200 mb-2">구독 해지 완료</h1>
          <p className="text-slate-400 text-sm">{message}</p>
          <a href="/" className="mt-6 text-sky-400 hover:text-sky-300 text-sm underline">
            메인으로 돌아가기
          </a>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-slate-200 mb-2">오류</h1>
          <p className="text-slate-400 text-sm">{message}</p>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
