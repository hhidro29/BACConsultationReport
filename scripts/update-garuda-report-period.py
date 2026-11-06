"""Apply the captured consultation period to both existing report modes."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs/garuda-refresh-2026-10-22'
drill = json.loads((OUT / 'drill-summary.json').read_text())
classroom = json.loads((OUT / 'classroom-summary.json').read_text())
snapshot = json.loads((OUT / 'garuda-snapshot.json').read_text())
compact = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
subjects = {s['subtest']: s for s in drill['subjects']}

for mode in ['Guided Report', 'Meeting Mode']:
    path = ROOT / f'Consultation Brief - Garuda Mahawira Sena - {mode}.html'
    text = path.read_text()
    text, count = re.subn(r'const drillSnapshot=\{.*?\};', 'const drillSnapshot=' + compact(drill) + ';', text, count=1, flags=re.S)
    assert count == 1
    text, count = re.subn(r'const classroomReport = \{.*?\};', 'const classroomReport = ' + compact(classroom) + ';', text, count=1, flags=re.S)
    assert count == 1
    text = text.replace('// CLASSROOM_REPORT_START — sumber: garuda-classroom-summary-2026-10-22.json.', '// CLASSROOM_REPORT_START — sumber: outputs/garuda-refresh-2026-10-22/classroom-summary.json.')
    text = text.replace('28 Sep–4 Okt 2026', '13 Jul–26 Nov 2026')
    text = text.replace('Periode data: 28 Sep–8 Okt 2026', 'Periode data: 13 Jul–26 Nov 2026 (diambil 22 Okt 2026; data tersedia hingga 21 Okt 2026)')
    text = text.replace('<div class="period">Aktivitas<strong>13 Jul–26 Nov 2026</strong><span class="small">Riwayat tryout: 23 Agu–8 Okt 2026</span></div>', '<div class="period">Periode report<strong>13 Jul–26 Nov 2026</strong><span class="small">Data s.d. 21 Okt · diambil 22 Okt 2026</span><br><span class="small">Riwayat tryout: 23 Agu–8 Okt 2026</span></div>')
    text = text.replace('Drill dan kelas: 13 Jul–26 Nov 2026. Nilai tryout mengikuti filter.', 'Periode 13 Jul–26 Nov 2026 · data tersedia hingga 21 Okt. Nilai tryout mengikuti filter.')
    text = text.replace('Sumber: Student Tower · disalin 21 Okt 2026.', 'Sumber: Student Tower · diambil ulang 22 Okt 2026.')
    text = text.replace('Student Tower · disalin 21 Oktober 2026.', 'Student Tower · diambil ulang 22 Oktober 2026.')
    text = text.replace('Nilai dan rekaman kelas: Student Tower, disalin 21 Okt 2026; menunggu pemeriksaan SA.', 'Nilai, drill, dan rekaman kelas: Student Tower, diambil ulang 22 Okt 2026; menunggu pemeriksaan SA.')
    # Attendance includes the source status Terlambat; do not relabel it as on-time.
    text = text.replace("session.attendance==='Hadir'", "['Hadir','Terlambat'].includes(session.attendance)")
    text = text.replace("$('classroom-coverage').textContent=missing?missing+' dari '+sessions.length+' sesi belum memiliki catatan pengajar. Ringkasan hanya mencakup sesi yang memiliki catatan.':'Ringkasan mencakup '+recorded.length+' sesi yang memiliki catatan pengajar.';", "$('classroom-coverage').textContent='Kehadiran: '+sessions.filter(s=>s.attendance==='Hadir').length+' hadir, '+sessions.filter(s=>s.attendance==='Terlambat').length+' terlambat, '+sessions.filter(s=>s.attendance==='Sakit').length+' sakit, '+sessions.filter(s=>s.attendance==='Izin').length+' izin. '+(missing?missing+' dari '+sessions.length+' sesi belum memiliki catatan pengajar. Ringkasan hanya mencakup sesi yang memiliki catatan.':'Ringkasan mencakup '+recorded.length+' sesi yang memiliki catatan pengajar.');")
    text = text.replace("source.id==='SRC-04'?'Sumber kehadiran ↗':'Sumber catatan pengajar ↗'", "source.label+' ↗'")
    text = text.replace("detail.dataset.attendanceSourceId=session.id;detail.dataset.noteSourceId=session.note.id;", "detail.dataset.attendanceSourceId=session.attendanceSourceId;detail.dataset.noteSourceId=session.note.sourceId||'';")
    # Keep saved fallback cells consistent with runtime aggregates.
    m = re.search(r'(<tbody id="drill-summary-rows">)(.*?)(</tbody>)', text, flags=re.S)
    assert m
    def update_row(match):
        row = match[0]
        key_match = re.search(r'<span class="subtest-label">([^<]+)</span>', row)
        assert key_match
        s = subjects.get(key_match[1])
        total = str(s['total']) if s else '—'
        pct = (f"{s['correct']/s['total']*100:.1f}".rstrip('0').rstrip('.').replace('.', ',') + '%') if s else '—'
        cells = row.rsplit('<td class="number">', 2)
        assert len(cells) == 3
        return cells[0] + '<td class="number">' + total + '</td><td class="number">' + pct + '</td></tr>'
    table_rows = re.sub(r'<tr>.*?</tr>', update_row, m[2], flags=re.S)
    text = text[:m.start(2)] + table_rows + text[m.end(2):]
    # Source parent context stays in the drill disclosure, separate from teacher notes.
    parent_note = '<p id="drill-parent-source">Catatan WhatsApp, 19 Okt 2026: siswa dilaporkan sedang sakit dan mengalami kendala mencapai target drill. Ini catatan interaksi orang tua, bukan kesimpulan dari nilai.</p>'
    if 'id="drill-parent-source"' not in text:
        target = '<p>Benar (%) = jawaban benar dibagi jumlah soal. Tanda — berarti data drill belum tercatat.</p></details>'
        assert target in text
        text = text.replace(target, '<p>Benar (%) = jawaban benar dibagi jumlah soal. Tanda — berarti data drill belum tercatat.</p>' + parent_note + '</details>')
    # A legacy session modal also receives refreshed original notes.
    m = re.search(r'const contextDialogContent=(\{.*?\n\});\nfunction openContextDialog', text, flags=re.S)
    assert m
    content = json.loads(m[1])
    from html import escape
    content['sessions']['html'] = '<div class="note-list">' + ''.join('<article><strong>' + escape(s['subject'] + ' · ' + s['datetime'][:10]) + '</strong><p>' + escape(s['note']['text'] or 'Belum ada catatan pengajar untuk sesi ini.') + '</p><div class="meta">' + escape(s['note']['author'] or s['teacher'] or 'Penulis belum tercatat') + '</div></article>' for s in classroom['input']['sessions']) + '</div>'
    text = text[:m.start(1)] + json.dumps(content, ensure_ascii=False, indent=2) + text[m.end(1):]
    path.write_text(text)
print('Updated both reports to 13 Jul–26 Nov 2026 from the 22 October capture.')
