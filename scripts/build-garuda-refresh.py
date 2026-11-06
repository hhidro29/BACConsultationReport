"""Build the 22 October capture from rendered Student Tower tables.

Input is source-captures.json saved through Codex browser, never a live API.
Keep the previous W40 package intact and preserve identical rows within a page.
"""
import collections
import datetime as dt
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs/garuda-refresh-2026-10-22'
START, END = '2026-07-13', '2026-11-26'
MONTHS = dict(zip('Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des'.split(), range(1, 13)))


def stamp(value):
    m = re.fullmatch(r'(\d+) (\w+) (\d{4})(?:, (\d{2})\.(\d{2}))?', value.strip())
    assert m, value
    d, mon, y, h, minute = m.groups()
    return f'{y}-{MONTHS[mon]:02d}-{int(d):02d}T{h or "00"}:{minute or "00"}:00.000'


def save(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


captures = json.loads((OUT / 'source-captures.json').read_text())
drills, attendance, notes, parents, events = [], [], [], [], []
sources, weekly = [], {}
captured_pages = collections.defaultdict(list)
expected_pages = {}
for index, capture in enumerate(captures, 1):
    sid = f'SRC-REFRESH-{index:03d}'
    period = capture['period']
    start, end = period['start'], period['end']
    assert (dt.date.fromisoformat(end) - dt.date.fromisoformat(start)).days <= 30
    sources.append({'id': sid, 'url': capture['url'], 'tab': capture['tab'], 'period': period})
    pagination = re.search(r'Halaman\s+(\d+)\s+dari\s+(\d+)\s+(\d+) sesi', capture['text'])
    if capture['tab'] == 'Drill Soal' and pagination:
        page, pages, count = map(int, pagination.groups())
        key = (start, end)
        captured_pages[key].append(page)
        expected_pages[key] = (pages, count)
    for table in capture['tables']:
        header = table[0]
        for rownum, row in enumerate(table[1:], 1):
            provenance = {'sourceId': sid, 'sourceRow': rownum}
            if header == ['Mulai', 'Kelas', 'Kurikulum', 'Subject', 'Benar / total', 'Jawaban salah', 'Tidak dijawab', 'Akurasi']:
                when = stamp(row[0])
                assert start <= when[:10] <= end
                correct, total = map(int, row[4].split('/'))
                wrong, unanswered = int(row[5]), int(row[6])
                assert correct + wrong + unanswered == total
                drills.append({'id': f'REFRESH-DRILL-{len(drills)+1:03d}', 'datetime': when,
                               'class': row[1], 'curriculum': row[2], 'subject': row[3],
                               'correct': correct, 'total': total, 'wrong': wrong,
                               'unanswered': unanswered, 'sourceAccuracy': row[7], **provenance})
            elif header == ['Waktu', 'Mata pelajaran', 'Guru', 'Status', 'Catatan']:
                when = stamp(row[0])
                assert start <= when[:10] <= end
                attendance.append({'id': f'REFRESH-CLASS-{len(attendance)+1:03d}', 'datetime': when,
                                   'subject': row[1], 'teacher': row[2], 'attendance': row[3],
                                   'attendanceNote': None if row[4] == '-' else row[4], **provenance})
            elif header == ['Sumber', 'Subject', 'Tanggal Penulisan', 'Ditulis Oleh', 'Notes']:
                when = stamp(row[2])
                assert start <= when[:10] <= end
                notes.append({'id': f'REFRESH-NOTE-{len(notes)+1:03d}', 'type': row[0],
                              'subject': row[1], 'datetime': when,
                              'author': None if row[3] == '-' else row[3],
                              'text': None if row[4] == '-' else row[4], **provenance})
            elif header == ['Sumber', 'Date-time', 'Channel', 'Ringkasan', 'Hasil Pembahasan', 'Screenshot']:
                when = stamp(row[1])
                assert start <= when[:10] <= end
                parents.append({'datetime': when, 'channel': row[2], 'summary': row[3],
                                'outcome': row[4], **provenance})
            elif header[0] == 'TO event / submission':
                name, date = row[0].rsplit('\n', 1)
                when = stamp(date)
                if START <= when[:10] <= END:
                    events.append({'name': name, 'datetime': when, 'score': int(row[1]),
                                   'subtests': {key: int(value.strip().splitlines()[0]) for key, value in zip(header[2:10], row[2:10])},
                                   'choices': row[10:], **provenance})
            elif header[0] in ['Snapshot mingguan', 'Periode']:
                key = (capture['tab'], row[0])
                if key in weekly:
                    assert weekly[key]['values'] == row[1:]
                else:
                    weekly[key] = {'tab': capture['tab'], 'label': row[0], 'values': row[1:], 'sourceId': sid}

for period, (pages, count) in expected_pages.items():
    assert sorted(captured_pages[period]) == list(range(1, pages + 1))
    actual = sum(1 for row in drills if period[0] <= row['datetime'][:10] <= period[1])
    assert actual == count, (period, actual, count)

assert len(drills) == 114 and len(attendance) == 44 and len(notes) == 37 and len(events) == 4
assert len({(s['datetime'], s['subject']) for s in attendance}) == len(attendance)
name_to_code = {'Kemampuan Penalaran Umum': 'PU', 'Pengetahuan dan Pemahaman Umum': 'PPU',
                'Pemahaman Bacaan dan Menulis': 'PB', 'Pengetahuan Kuantitatif': 'PK',
                'Penalaran Matematika': 'PM'}
grouped = {}
for row in drills:
    if row['class'] != 'UTBK & Ujian Mandiri':
        continue
    assert row['subject'] in name_to_code
    key = name_to_code[row['subject']]
    item = grouped.setdefault(key, {'subtest': key, 'sourceSubject': row['subject'], 'sessions': 0, 'correct': 0, 'total': 0})
    item['sessions'] += 1
    item['correct'] += row['correct']
    item['total'] += row['total']
drill_snapshot = {'studentId': 'GARUDAI4LG3ZTNGA', 'startDate': START, 'endDate': END,
                  'source': 'Student Tower', 'copiedAt': '2026-10-22', 'mappingLevel': 'subtest',
                  'materialCoverage': 'unavailable', 'subjects': list(grouped.values())}

session_notes = {(n['datetime'], n['subject']): n for n in notes if n['type'] == 'Sesi'}
sessions = []
for row in sorted(attendance, key=lambda s: s['datetime'], reverse=True):
    note = session_notes.get((row['datetime'], row['subject']))
    sessions.append({**row, 'attendanceSourceId': row['sourceId'],
                     'note': note or {'id': 'NO-NOTE-' + row['id'], 'text': None, 'author': None, 'sourceId': None}})
assert len(session_notes) == 36
recorded = [s for s in sessions if s['note']['text']]
assert len(recorded) == 16
groups = collections.defaultdict(list)
for session in recorded:
    groups[session['note']['text']].append(session)
assert sorted(map(len, groups.values())) == [1, 1, 14]
common = next(s for s in groups.values() if len(s) == 14)
exceptions = [s for s in recorded if s not in common]
statements = [
    {'text': 'Pada 14 dari 16 sesi yang memiliki catatan, pengajar mencatat siswa aktif bertanya, memahami materi sangat baik, dan mengerjakan tugas secara mandiri.',
     'evidence': [{'noteId': s['note']['id'], 'quote': s['note']['text']} for s in common]},
    {'text': 'Pada Fisika (10 Sep), siswa sesekali masih perlu ditunjuk. Pada Dasar-Dasar Linguistik (7 Sep), siswa masih membutuhkan bantuan di beberapa bagian materi.',
     'evidence': [{'noteId': s['note']['id'], 'quote': s['note']['text']} for s in exceptions]}
]
used_sources = {s['sourceId'] for s in sessions} | {n['sourceId'] for n in session_notes.values()}
classroom = {'schemaVersion': 1, 'input': {'studentAlias': 'PILOT-001',
             'period': {'start': START, 'end': END, 'capturedOn': '2026-10-22'}, 'sessions': sessions,
             'sources': [{'id': s['id'], 'url': s['url'], 'label': s['tab'] + ' · ' + s['period']['start'] + '–' + s['period']['end']} for s in sources if s['id'] in used_sources],
             'timestampNote': 'Waktu mengikuti tampilan sumber. Rentang yang diminta berakhir setelah tanggal pengambilan; belum menunjukkan kelengkapan sampai November.'},
             'summary': {'mode': 'curated_prototype', 'promptVersion': 'classroom-summary-v1', 'statements': statements}}
statuses = dict(collections.Counter(s['attendance'] for s in sessions))
snapshot = {'schemaVersion': 1, 'capturedOn': '2026-10-22', 'studentId': 'GARUDAI4LG3ZTNGA',
            'requestedPeriod': {'start': START, 'end': END},
            'batches': [{'start': a, 'end': b} for a, b in [(START, '2026-08-12'), ('2026-08-13', '2026-09-12'), ('2026-09-13', '2026-10-13'), ('2026-10-14', '2026-11-13'), ('2026-11-14', END)]],
            'coverage': {'drillSessionsAllSubjects': len(drills), 'drillSessionsUtbk': sum(s['sessions'] for s in grouped.values()),
                         'drillQuestionsUtbk': sum(s['total'] for s in grouped.values()),
                         'classSessions': len(sessions), 'attendance': statuses, 'teacherNotesWithText': len(recorded),
                         'tryoutEvents': len(events), 'parentInteractions': len(parents),
                         'latestDrillDate': max(d['datetime'][:10] for d in drills), 'latestClassDate': max(s['datetime'][:10] for s in sessions)},
            'drill': drills, 'attendance': attendance, 'notes': notes, 'parentEngagement': parents,
            'tryout': events, 'sources': sources, 'weeklySnapshots': list(weekly.values()),
            'limitations': ['Snapshot mingguan mencakup minggu penuh, termasuk tanggal di luar potongan pengambilan. Total report dihitung dari rincian sesi bertanggal, bukan penjumlahan snapshot mingguan.',
                            'Riwayat tryout, profiling, tes diagnostik dan tugas tindak lanjut tidak mengikuti filter tanggal pada tampilan sumber; tanggal record diperiksa terpisah.',
                            'Dua baris drill Biologi identik pada 18 Oktober pukul 22.43 dipertahankan sebagai dua baris sumber; tanpa ID sesi asli, belum dapat dipastikan sebagai duplikasi.',
                            'Tidak ada data aktivitas November saat pengambilan 22 Oktober. Rentang yang diminta bukan pernyataan bahwa data sudah lengkap hingga 26 November.',
                            'Rincian materi asli dan penghubung drill per materi belum tersedia. Materi contoh prototype tetap terpisah.',
                            'Leaderboard dan acuan prodi tetap bersumber pada screenshot sebelumnya; pengambilan ini tidak memperbaruinya.']}
save('garuda-snapshot.json', snapshot)
save('drill-summary.json', drill_snapshot)
save('classroom-summary.json', classroom)
print(json.dumps(snapshot['coverage'], ensure_ascii=False, indent=2))
