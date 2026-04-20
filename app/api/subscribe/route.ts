import { NextRequest, NextResponse } from 'next/server';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_OWNER!;
const GH_REPO  = process.env.GITHUB_REPO || 'coin-briefing';
const FILE_PATH = 'data/subscribers.json';
const ENC_KEY   = process.env.SUBSCRIBER_ENCRYPTION_KEY
  ? Buffer.from(process.env.SUBSCRIBER_ENCRYPTION_KEY, 'base64')
  : null;

const GH_HEADERS = {
  Authorization: `Bearer ${GH_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

// AES-256-GCM 암호화: "nonce(12B):ciphertext:tag(16B)" → base64
function encrypt(plain: string): string {
  if (!ENC_KEY) return plain;
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', ENC_KEY, nonce);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ct, tag]).toString('base64');
}

// AES-256-GCM 복호화 (실패 시 원본 반환 — 기존 평문 이메일 호환)
function decrypt(enc: string): string {
  if (!ENC_KEY) return enc;
  try {
    const buf = Buffer.from(enc, 'base64');
    const nonce = buf.subarray(0, 12);
    const tag   = buf.subarray(buf.length - 16);
    const ct    = buf.subarray(12, buf.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', ENC_KEY, nonce);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  } catch {
    return enc; // 기존 평문 이메일도 그대로 처리
  }
}

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
  // 복호화해서 중복 체크
  const plainEmails = emails.map(decrypt);
  if (plainEmails.includes(email)) {
    return NextResponse.json({ message: '이미 구독 중인 이메일입니다.' });
  }
  await saveSubscribers([...emails, encrypt(email)], sha);
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
  const filtered = emails.filter((e) => decrypt(e) !== email);
  if (filtered.length === emails.length) {
    return NextResponse.json({ message: '구독 정보를 찾을 수 없습니다.' });
  }
  await saveSubscribers(filtered, sha);
  return NextResponse.json({ message: '구독이 해지되었습니다.' });
}
