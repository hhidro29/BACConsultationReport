import type { ProgramChoice } from '../data/garudaData';

export const STORAGE_KEY_CUSTOM_PROGRAMS = 'bac_v2_custom_programs_v1';

/** localStorage can throw (private mode, blocked site data, quota); never let that crash a render. */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function isValidProgramChoice(p: unknown): p is ProgramChoice {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.prodi === 'string' &&
    typeof o.univ === 'string' &&
    typeof o.degree === 'string' &&
    typeof o.targetScore === 'number' &&
    typeof o.weightedScore === 'number' &&
    typeof o.gap === 'number' &&
    Array.isArray(o.supportSubjects)
  );
}

/**
 * Loads custom program choices saved by Simulasi, keyed by student id.
 * Anything that is not a well-formed object of non-empty arrays of ProgramChoice is dropped
 * instead of crashing the page (e.g. stored "null", a string, or entries with missing fields).
 */
export function loadCustomPrograms(): Record<string, ProgramChoice[]> {
  const raw = safeGetItem(STORAGE_KEY_CUSTOM_PROGRAMS);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: Record<string, ProgramChoice[]> = {};
    for (const [studentId, list] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(list) && list.length > 0 && list.every(isValidProgramChoice)) {
        result[studentId] = list;
      }
    }
    return result;
  } catch {
    return {};
  }
}
