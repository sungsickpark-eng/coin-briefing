import fs from 'fs';
import path from 'path';

export interface Briefing {
  date: string;
  title: string;
  html: string;
  generated_at: string;
}

export interface ArchiveEntry {
  date: string;
  title: string;
  generated_at: string;
}

const dataDir = path.join(process.cwd(), 'data');

export function getLatestBriefing(): Briefing | null {
  try {
    const filePath = path.join(dataDir, 'latest.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: Briefing = JSON.parse(raw);
    // Treat placeholder (empty date) as no briefing yet
    if (!parsed.date || !parsed.html) {
      return null;
    }
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
    // Sort newest first
    return parsed.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export function getBriefingByDate(date: string): Briefing | null {
  try {
    // Basic validation — date must look like YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return null;
    }
    const filePath = path.join(dataDir, `${date}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: Briefing = JSON.parse(raw);
    if (!parsed.date || !parsed.html) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAllArchiveDates(): string[] {
  const archive = getArchive();
  return archive.map((entry) => entry.date);
}
