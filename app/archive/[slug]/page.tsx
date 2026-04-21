import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBriefingBySlug, getArchive } from '@/lib/data';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const archive = getArchive();
  return archive.map((e) => ({ slug: e.slug || e.date }));
}

export async function generateMetadata({ params }: Props) {
  const briefing = getBriefingBySlug(params.slug);
  return {
    title: briefing?.title ?? `${params.slug} 브리핑 | AI Coin 브리핑`,
  };
}

export default function ArchiveSlugPage({ params }: Props) {
  const briefing = getBriefingBySlug(params.slug);
  if (!briefing) notFound();

  const formattedDate = new Date(briefing.date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <div>
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm mb-6 transition-colors"
      >
        <span>←</span>
        <span>아카이브로 돌아가기</span>
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          아카이브
        </span>
        <span className="text-slate-400 text-sm">{formattedDate}</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
        {briefing.title}
      </h1>

      <div className="rounded-2xl shadow-2xl border border-slate-700/50">
        <div
          className="briefing-content bg-white rounded-2xl p-6 sm:p-8"
          dangerouslySetInnerHTML={{ __html: briefing.html }}
        />
      </div>

      <p className="mt-4 text-right text-xs text-slate-600">
        생성 시각:{' '}
        {new Date(briefing.generated_at).toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>
    </div>
  );
}
