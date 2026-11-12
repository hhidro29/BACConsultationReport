import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { CHECKPOINT1_STUDENTS } from '../data/garudaData';

export interface Crumb {
  label: string;
  /** Tanpa `to` = halaman saat ini (teks biasa, aria-current). */
  to?: string;
}

interface AppTopbarProps {
  crumbs: Crumb[];
  /** Identitas Kakak Asuh di kanan atas; default mengikuti siswa pertama (SA yang sama untuk semua siswa demo). */
  saName?: string;
  saEmail?: string;
  /** Tampilkan chip "Engine Aturan"; `customized` mengubahnya jadi chip peringatan. */
  engine?: { customized: boolean };
  /** Slot tambahan di kiri identitas SA. */
  children?: React.ReactNode;
}

const DEFAULT_SA = CHECKPOINT1_STUDENTS[0].identity;

/** Satu topbar untuk semua halaman supaya breadcrumb, tautan, dan perilaku mobile seragam. */
export const AppTopbar: React.FC<AppTopbarProps> = ({ crumbs, saName = DEFAULT_SA.saName, saEmail = DEFAULT_SA.saEmail, engine, children }) => (
  <header className="topbar">
    <div className="topbar-inner">
      <nav aria-label="breadcrumb" className="breadcrumbs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={`${c.label}-${i}`}>
              {i > 0 && <span className="crumb-sep" aria-hidden="true">›</span>}
              {c.to && !last ? (
                <Link to={c.to}>{c.label}</Link>
              ) : (
                <span className="crumb-current" aria-current={last ? 'page' : undefined}>{c.label}</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="topbar-right">
        {engine && (
          <Link
            to="/engine"
            className={engine.customized ? 'engine-chip engine-chip--custom' : 'engine-chip'}
            title="Buka Simulator, Jejak Aturan & Kontrol Engine Panduan Kakak Asuh"
          >
            <GitBranch size={12} aria-hidden="true" /> {engine.customized ? 'Engine Aturan · Custom' : 'Engine Aturan'}
          </Link>
        )}
        {children}
        <div className="user-pill">
          <span className="user-pill-text">{saName} · {saEmail}</span>
          <div className="user-avatar" aria-hidden="true">WC</div>
        </div>
      </div>
    </div>
  </header>
);
