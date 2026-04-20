import { NextRequest, NextResponse } from 'next/server';

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_OWNER!;
const GH_REPO  = process.env.GITHUB_REPO || 'coin-briefing';
const FILE_PATH = 'data/subscribers.json';

const GH_HEADERS = {
  Authorization: `Bearer ${GH_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

async function getSubscribers(): Promise<{ emails: string[]; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`,
    { headers: GH_HEADERS, cache: 'no-store' }
  );
  if (!res.ok) return { emails: [], sha: '' };
  const data = await res.json();
  const raw = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  try {
    return { emails: JSON.parse(raw), sha: data.sha };
  } catch {
    return { emails: [], sha: data.sha };
  }
}

async function saveSubscribers(emails: string[], sha: string): Promise<void> {
  const content = Buffer.from(JSON.stringify(emails, null, 2)).toString('base64');
  const body: Record<string, string> = {
    message: `subscribers: update (${emails.length}명)`,
    content,
  };
  if (sha) body.sha = sha;
  await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`,
    { method: 'PUT', headers: GH_HEADERS, body: JSON.stringify(body) }
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/subscribe  — 구독 등록
export async function POST(req: NextRequest) {
  if (!GH_TOKEN || !GH_OWNER) {
    return NextResponse.json({ error: '서버 설정 오류입니다.' }, { status: 500 });
  }
  let email: string;
  try {
    const body = await req.json();
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '유효하지 않은 이메일 형식입니다.' }, { status: 400 });
  }

  const { emails, sha } = await getSubscribers();
  if (emails.includes(email)) {
    return NextResponse.json({ message: '이미 구독 중인 이메일입니다.' });
  }
  await saveSubscribers([...emails, email], sha);
  return NextResponse.json({ message: '구독이 완료되었습니다! 매일 브리핑을 보내드립니다.' });
}

// DELETE /api/subscribe?token=<base64email>  — 구독 해지
export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  let email: string;
  try {
    email = Buffer.from(token, 'base64').toString('utf-8').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다.' }, { status: 400 });
  }

  const { emails, sha } = await getSubscribers();
  const filtered = emails.filter((e) => e !== email);
  if (filtered.length === emails.length) {
    return NextResponse.json({ message: '구독 정보를 찾을 수 없습니다.' });
  }
  await saveSubscribers(filtered, sha);
  return NextResponse.json({ message: '구독이 해지되었습니다.' });
}
