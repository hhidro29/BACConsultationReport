import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { RuleTrace } from '../utils/saGuidelineEngine';

interface RuleTraceBoxProps {
  traces: RuleTrace[];
  collapsible?: boolean;
  editLinkTo?: string;
}

export const RuleTraceBox: React.FC<RuleTraceBoxProps> = ({
  traces,
  collapsible = false,
  editLinkTo = '/engine?tab=controls'
}) => {
  const [open, setOpen] = useState<boolean>(!collapsible);
  const matchedCount = traces.filter((t) => t.matched).length;

  return (
    <div style={{ marginTop: 10, borderTop: '1px dashed #cbd5e1', paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{
              background: open ? '#e6f4f2' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Eye size={13} color="#398896" />
            Mengapa output ini muncul? ({matchedCount}/{traces.length} kondisi terpicu)
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Eye size={13} color="#398896" /> JEJAK ATURAN (WHITE-BOX): {matchedCount}/{traces.length} kondisi terpicu
          </span>
        )}

        <Link
          to={editLinkTo}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#245f5a',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Sliders size={12} /> Kontrol Ambang &amp; Edit Wording →
        </Link>
      </div>

      {open && (
        <div style={{ marginTop: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '5px 8px', width: '24%' }}>Aturan</th>
                <th style={{ padding: '5px 8px', width: '32%' }}>Evaluasi Kondisi (Data vs Batas)</th>
                <th style={{ padding: '5px 8px', width: '12%' }}>Status</th>
                <th style={{ padding: '5px 8px' }}>Dampak ke Output</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((t) => (
                <tr key={t.ruleId} style={{ borderBottom: '1px solid #f1f5f9', background: t.matched ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, color: '#0f172a' }}>{t.ruleName}</td>
                  <td style={{ padding: '5px 8px', color: '#475569' }}>
                    <code style={{ fontSize: 10.5, background: '#f1f5f9', padding: '1px 4px', borderRadius: 4 }}>
                      {t.expression}
                    </code>
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '1.5px 6px',
                        borderRadius: 9999,
                        background: t.matched ? '#ecfdf3' : '#f1f5f9',
                        color: t.matched ? '#027a48' : '#64748b',
                        border: `1px solid ${t.matched ? '#a6f4c5' : '#e2e8f0'}`
                      }}
                    >
                      {t.matched ? 'TERPICU' : 'TIDAK'}
                    </span>
                  </td>
                  <td style={{ padding: '5px 8px', color: '#334155' }}>{t.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
