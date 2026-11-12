import { safeGetItem, safeRemoveItem, safeSetItem } from './safeStorage';

/**
 * Status "Kunci" laporan disimpan per siswa supaya bertahan setelah refresh dan terbaca oleh
 * halaman lain (Simulasi, Update Rapor) yang harus ikut menolak perubahan saat laporan final.
 */
const lockKey = (studentId: string) => `bac_v2_locked_${studentId}`;

export function isReportLocked(studentId: string): boolean {
  return safeGetItem(lockKey(studentId)) === '1';
}

export function setReportLocked(studentId: string, locked: boolean): void {
  if (locked) safeSetItem(lockKey(studentId), '1');
  else safeRemoveItem(lockKey(studentId));
}
