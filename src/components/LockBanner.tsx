import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface LockBannerProps {
  studentId: string;
  /** Teks aksi di tombol; default menuju laporan agar SA bisa membuka kunci di sana. */
  actionLabel?: string;
  /** Sembunyikan tombol aksi (dipakai di halaman laporan sendiri, yang punya tombol Buka Kunci). */
  hideAction?: boolean;
  children?: React.ReactNode;
}

export const LockBanner: React.FC<LockBannerProps> = ({ studentId, actionLabel = 'Buka di Laporan', hideAction, children }) => (
  <div className="lock-banner" role="status">
    <Lock size={16} aria-hidden="true" />
    <div className="lock-banner-text">
      <strong>Laporan terkunci.</strong>{' '}
      {children ?? 'Pilihan jurusan, nilai rapor, dan catatan tidak bisa diubah. Buka kunci di halaman laporan untuk mengedit.'}
    </div>
    {!hideAction && (
      <Link to={`/v2?student=${studentId}`} className="btn btn-outline">
        {actionLabel}
      </Link>
    )}
  </div>
);
