import { getLatestBriefing } from '@/lib/data';

export default function HomePage() {
  const briefing = getLatestBriefing();

  if (!briefing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold text-slate-200 mb-3">
          첫 브리핑을 기다리는 중입니다
        </h1>
        <p className="text-slate-400 text-base max-w-sm leading-relaxed">
          매일 오전 5시에 AI가 자동으로 코인 시장 브리핑을 생성합니다.
          <br />
          조금만 기다려 주세요!
        </p>
        <div
          className="mt-8 px-6 py-3 rounded-full text-sm font-medium text-sky-300 border border-sky-800"
          style={{ backgroundColor: 'rgba(3, 105, 161, 0.15)' }}
        >
          🤖 AI Trader가 곧 분석 리포트를 올려드립니다
        </div>
      </div>
    );
  }

  const formattedDate = new Date(briefing.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div>
      {/* Date badge */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 bg-sky-900/40 px-3 py-1 rounded-full border border-sky-800">
          최신 브리핑
        </span>
        <span className="text-slate-400 text-sm">{formattedDate}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
        {briefing.title}
      </h1>

      {/* Briefing content card */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
        <div
          className="briefing-content bg-white p-6 sm:p-8"
          dangerouslySetInnerHTML={{ __html: briefing.html }}
        />
      </div>

      {/* Generated at */}
      <p className="mt-4 text-right text-xs text-slate-600">
        생성 시각:{' '}
        {new Date(briefing.generated_at).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
