import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronDown } from 'lucide-react';

export const RouterTopbar: React.FC = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isV2 = location.pathname.startsWith('/v2');
  const isV1 = location.pathname.startsWith('/v1');
  const isRapor = location.pathname.startsWith('/rapor');

  return (
    <div className="version-switch-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          background: '#eab308',
          color: '#713f12',
          fontWeight: 800,
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4
        }}>
          PROTOTYPE ROUTER
        </span>
        <Link
          to="/"
          style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: 11.5,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
          title="Buka Portal Hub Semua Versi"
        >
          <Home size={13} strokeWidth={2.2} />
          Semua Versi
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="version-switch-group">
          <Link to="/v2" className={`version-switch-btn${isV2 ? ' active' : ''}`}>
            ⚡ V2: Usulan Tim Akademik (Target 600)
          </Link>
          <Link to="/v1" className={`version-switch-btn${isV1 ? ' active' : ''}`}>
            📊 V1: Baseline Tren Skor
          </Link>
          <Link to="/rapor" className={`version-switch-btn${isRapor ? ' active' : ''}`}>
            📝 Rapor 20 Mapel
          </Link>
        </div>

        <div
          className="version-dropdown"
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            type="button"
            className="version-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: '#1e293b',
              border: '1px solid #475467',
              color: '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            Arsip <ChevronDown size={11} />
          </button>
          <div
            className={`version-dropdown-menu${dropdownOpen ? ' show' : ''}`}
            style={{
              display: dropdownOpen ? 'block' : 'none',
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 4,
              background: '#1e293b',
              border: '1px solid #475467',
              borderRadius: 6,
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              minWidth: 175,
              zIndex: 2000,
              padding: '4px 0'
            }}
          >
            <a
              href="./legacy/Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Guided%20Report.html"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', padding: '6px 12px', fontSize: 11.5, color: '#cbd5e1', textDecoration: 'none' }}
            >
              📑 Guided Report
            </a>
            <a
              href="./legacy/Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Meeting%20Mode.html"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', padding: '6px 12px', fontSize: 11.5, color: '#cbd5e1', textDecoration: 'none' }}
            >
              🤝 Meeting Mode
            </a>
            <a
              href="./legacy/Simulasi%20Wording%20SA%20-%20Tryout.html"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', padding: '6px 12px', fontSize: 11.5, color: '#cbd5e1', textDecoration: 'none' }}
            >
              💬 Simulasi Wording
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
