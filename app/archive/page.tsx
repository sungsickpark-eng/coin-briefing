import Link from 'next/link';
import { getArchive } from '@/lib/data';

export default function ArchivePage() {
  const entries = getArchive();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          브리핑 아카이브
        </h1>
        <p className="text-slate-400 text-sm">
          {entries.length > 0
            ? `총 ${entries.length}개의 브리핑이 저장되어 있습니다.`
            : '아직 저장된 브리핑이 없습니다.'}
        </p>
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-5">📭</div>
          <p className="text-slate-500 text-sm">매일 자동으로 브리핑이 추가됩니다.</p>
          <Link href="/" className="mt-6 text-sky-400 hover:text-sky-300 text-sm underline underline-offset-2">
            홈으로 돌아가기
          </Link>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="space-y-3">
          {entries.map((entry, idx) => {
            const slug = entry.slug || entry.date;
            const dt = new Date(entry.generated_at);
            const formattedDate = dt.toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
            });
            const formattedTime = dt.toLocaleTimeString('ko-KR', {
              hour: '2-digit', minute: '2-digit',
            });
            const isLatest = idx === 0;

            return (
              <li key={slug}>
                <Link
                  href={`/archive/${slug}`}
                  className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 border transition-all group"
                  style={{
                    backgroundColor: '#1e293b',
                    borderColor: isLatest ? '#0369a1' : '#334155',
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {isLatest && (
                      <span className="mt-0.5 shrink-0 text-xs font-semibold text-sky-400 bg-sky-900/50 border border-sky-800 px-2 py-0.5 rounded-full">
                        최신
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate group-hover:text-sky-300 transition-colors">
                        {entry.title || `${entry.date} 브리핑`}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {formattedDate} {formattedTime}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-slate-500 group-hover:text-sky-400 transition-colors text-lg">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
