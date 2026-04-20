import fs from 'fs';
import path from 'path';

export interface Briefing {
  date: string;
  slug?: string;
  title: string;
  html: string;
  generated_at: string;
}

export interface ArchiveEntry {
  date: string;
  slug?: string;
  title: string;
  generated_at: string;
}

const dataDir = path.join(process.cwd(), 'data');

export function getLatestBriefing(): Briefing | null {
  try {
    const filePath = path.join(dataDir, 'latest.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: Briefing = JSON.parse(raw);
    if (!parsed.date || !parsed.html) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getArchive(): ArchiveEntry[] {
  try {
    const filePath = path.join(dataDir, 'archive.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: ArchiveEntry[] = JSON.parse(raw);
    return parsed.sort(
      (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
    );
  } catch {
    return [];
  }
}

export function getBriefingBySlug(slug: string): Briefing | null {
  try {
    // slug: YYYY-MM-DD 또는 YYYY-MM-DD_HHMM
    if (!/^\d{4}-\d{2}-\d{2}(_\d{4})?$/.test(slug)) return null;
    const filePath = path.join(dataDir, `${slug}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: Briefing = JSON.parse(raw);
    if (!parsed.date || !parsed.html) return null;
    return parsed;
  } catch {
    return null;
  }
}
