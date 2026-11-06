"""Apply the reviewed report layout to the preserved 22 October report inputs."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs/report-revision-2026-10-23'
RULES=(ROOT/'report-logic/report-insights.js').read_text()

def replace_block(text,start,end,new):
 a=text.index(start);b=text.index(end,a)
 return text[:a]+new+'\n'+text[b:]

css='''
/* Report revision — 23 October 2026 */
.brief-detail{display:block;margin-top:4px;font-weight:400;font-size:12px;line-height:1.6}.brief-detail.negative{color:#b42318}.late-highlight{color:#985300;font-weight:700}
.indicator-settings{padding-top:10px;margin-top:12px;border-top:1px solid var(--line)}.indicator-form,.leaderboard-form{display:flex;align-items:end;flex-wrap:wrap;gap:12px;margin-top:12px}.indicator-form label,.leaderboard-form label{display:grid;gap:5px;font-size:11px;color:var(--muted)}.indicator-form input,.leaderboard-form input{border:1px solid var(--line);border-radius:6px;padding:7px 9px;width:150px;color:var(--ink);background:#fff}.indicator-status{margin-top:8px;font-size:11px;color:var(--muted)}
.score-position{font-size:12px;margin-top:8px}.score-position.needs_work{color:#b42318}.score-position.good{color:#167565}.drill-priority{font-size:10px;padding:2px 6px;border-radius:4px;background:#fbe9e5;color:#9d3022;margin-left:7px;white-space:nowrap}.drill-summary-table .drill-subtest-line{flex-wrap:wrap}.drill-summary-table .drill-material-row>td{padding:0 8px 9px}.drill-material-details{padding:10px 12px;background:#fafbfe;border:1px solid #e9edf4;border-radius:6px}.drill-material-details>summary{font-size:12px;color:var(--accent);cursor:pointer}.drill-topic-table{margin-top:8px;table-layout:fixed}.drill-topic-table th:first-child{width:40%}.drill-topic-table th,.drill-topic-table td{white-space:normal;font-size:11px;padding:8px!important}.drill-topic-table td.number{text-align:right}.drill-topic-table th{font-size:10px}.drill-topic-table th:nth-child(2){width:28%}.drill-summary-table>thead>tr>th:first-child{width:60%}.drill-summary-table td.accuracy-low{color:#b42318;font-weight:600}.drill-summary-table td.accuracy-good{color:#167565;font-weight:600}.material-data-details{margin-top:12px}.material-data-details ul{padding-left:18px}.drill-rules-note{font-size:11px;color:var(--muted);margin:8px 0 12px}.classroom-table{min-width:850px;table-layout:fixed;margin-top:10px}.classroom-table th:nth-child(1){width:12%}.classroom-table th:nth-child(2){width:18%}.classroom-table th:nth-child(3){width:15%}.classroom-table th:nth-child(4){width:12%}.classroom-table th:nth-child(5){width:43%}.classroom-table th,.classroom-table td{padding:10px 9px;vertical-align:top;font-size:11px;overflow-wrap:anywhere}.classroom-table thead th{font-size:10px}.classroom-table blockquote{margin:0;line-height:1.6}.classroom-table .note-author{display:block;margin-top:5px;font-size:10px;color:var(--muted)}.classroom-table tr.is-late td:nth-child(4){background:#fff2da;color:#8b4f06;font-weight:700}.classroom-pagination{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:12px}.classroom-pagination p{font-size:11px;color:var(--muted)}.classroom-pagination div{display:flex;gap:8px}.btn:disabled{opacity:.4;cursor:default}.classroom-evidence{margin-top:16px}.classroom-evidence>summary{cursor:pointer;font-size:11px;color:var(--muted)}.classroom-stats .late-stat dd{color:#985300}
.choice-session-bar{padding:12px 20px;border-bottom:1px solid var(--line);background:#fafbfe}.choice-session-bar .select-label{align-items:flex-start;flex-direction:column;gap:6px}.choice-session-bar select{max-width:100%;width:100%}.choice-dialog-session{display:block;padding:0 0 14px}.choice-dialog-session .select-label{display:grid;gap:6px}.choice-dialog-session select{max-width:100%;width:100%}.choice-history-table{margin-top:10px}.choice-history-table th,.choice-history-table td{font-size:11px;padding:9px 8px}.choice-history-table .selected-event{background:#f0f2ff}.choice-history-table td:first-child small{display:block;color:var(--muted)}.choice-rank-status{font-size:11px;color:var(--muted);margin:8px 0}.choice-history-table caption{text-align:left;font-size:13px;font-weight:600;color:var(--ink);padding-bottom:8px}.leaderboard-form{margin:10px 0}.leaderboard-form input{width:135px}.choice-session-notice{margin-top:7px;font-size:11px;color:var(--muted)}
@media(max-width:600px){.indicator-form{display:grid;grid-template-columns:1fr}.indicator-form input{width:100%}.drill-summary-table{min-width:520px}.classroom-pagination{align-items:flex-start}.choice-history-table{min-width:450px}}
'''
settings='''
      <details class="matrix-help indicator-settings"><summary>Pengaturan indikator</summary>
        <p>Isi sesuai acuan tim akademik. Kolom kosong berarti belum dinilai. Batas skor berlaku untuk <strong id="indicator-series-name">Skor total</strong>.</p>
        <form id="indicator-form" class="indicator-form">
          <label>Batas mulai berkembang<input id="score-developing" type="number" min="0" max="1000" step="any" placeholder="Belum ditetapkan"></label>
          <label>Batas mulai baik<input id="score-good" type="number" min="0" max="1000" step="any" placeholder="Belum ditetapkan"></label>
          <label>Target soal drill periode report<input id="drill-target" type="number" min="1" step="1" placeholder="Belum ditetapkan"></label>
          <button class="btn" type="submit">Terapkan indikator</button>
        </form><p id="indicator-status" class="indicator-status" role="status">Akurasi drill kurang jika di bawah 75%. Target jumlah soal dan kelompok skor belum ditetapkan.</p>
      </details>'''

config='''
// REPORT_INSIGHTS_START
'''+RULES+'''
// REPORT_INSIGHTS_END
const reportRules={accuracyMin:75,questionTarget:null,scoreBands:{}};
function updateIndicatorFields(){
 const band=reportRules.scoreBands[currentSeries];
 $('indicator-series-name').textContent=series[currentSeries].name;
 $('score-developing').value=band?.developing??'';$('score-good').value=band?.good??'';$('drill-target').value=reportRules.questionTarget??'';
}
$('indicator-form').addEventListener('submit',event=>{
 event.preventDefault();
 const read=id=>$(id).value.trim()===''?null:Number($(id).value);
 const developing=read('score-developing'),good=read('score-good'),target=read('drill-target');
 if((developing===null)!==(good===null)||(developing!==null&&(developing<0||good<=developing||good>1000))){$('indicator-status').textContent='Isi kedua batas skor. Batas baik harus lebih besar daripada batas berkembang (0–1.000).';return;}
 if(target!==null&&(!Number.isInteger(target)||target<1)){$('indicator-status').textContent='Target drill harus berupa jumlah soal bulat lebih dari nol.';return;}
 reportRules.scoreBands[currentSeries]=developing===null?null:{developing,good};reportRules.questionTarget=target;
 $('indicator-status').textContent='Indikator diterapkan untuk tampilan ini. Akurasi drill kurang jika di bawah 75%.';
 renderAcademicFollowup(currentSeries);renderOverview();renderDrillInsights();
});
'''

academic='''function renderAcademicFollowup(key){
  const values=scopedEvents().map(event=>series[key].values[event.index]);
  const result=TryoutWording.analyze(scopedEvents().map(event=>({id:event.name,date:event.date,kind:event.kind,value:series[key].values[event.index]})),{seriesLabel:series[key].name,tolerance:0});
  $('academic-followup-evidence').textContent=[result.observation,...result.notes].join(' ');
  const position=ReportInsights.scoreBand(values.at(-1),reportRules.scoreBands[key]);
  const middle=ReportInsights.scoreBand(scoreMedian(values),reportRules.scoreBands[key]);
  $('academic-score-position').className='score-position '+position.id;
  $('academic-score-position').textContent=position.id==='unconfigured'?position.label+'.':position.id==='no_data'?position.label+'.':'Nilai terakhir: '+position.label.toLowerCase()+'. Nilai tengah: '+middle.label.toLowerCase()+'.';
  const tasks=[result.parameters.missingCount&&result.additionalQuestions.length?result.additionalQuestions[0]:result.student];
  if(position.id==='needs_work')tasks.push('Tinjau contoh pengerjaan untuk menentukan bagian yang perlu diperkuat.');
  if(position.id==='developing')tasks.push('Bahas bagian yang sudah dipahami dan yang masih membutuhkan dukungan.');
  if(position.id==='good')tasks.push('Bahas cara belajar yang dirasa membantu dan bagian yang ingin dipertahankan.');
  renderSaTasks('academic-followup-student',tasks);renderSaTasks('academic-followup-parent',result.parent);
}'''

drill='''function renderDrillInsights(){
  const events=scopedEvents(),stats=rankSubtests(events),priorities=overallMaterialPriorities(events);
  const subjects=drillSnapshot.subjects.filter(item=>numeric(item.correct)&&numeric(item.total)&&item.total>0&&item.correct>=0&&item.correct<=item.total);
  const summary=ReportInsights.drill(priorities,subjects,reportRules);
  $('drill-summary-rows').innerHTML=stats.length?stats.map(item=>{
    const drill=subjects.find(row=>row.subtest===item.key),priority=priorities.findIndex(p=>p.key===item.key);
    const accuracy=drill?drill.correct/drill.total*100:null;
    const main='<tr data-drill-subtest="'+item.key+'"><td><div class="drill-subtest-line"><span class="subtest-label">'+item.key+'</span>'+(item.name!==item.key?'<span class="subtest-name">'+item.name+'</span>':'')+(priority>=0?'<span class="drill-priority">Prioritas '+(priority+1)+'</span>':'')+'</div></td><td class="number">'+(drill?drill.total:'—')+'</td><td class="number '+(accuracy===null?'':accuracy<reportRules.accuracyMin?'accuracy-low':'accuracy-good')+'">'+(accuracy===null?'—':format(accuracy)+'%')+'</td></tr>';
    if(priority<0)return main;
    const subject=priorities[priority];
    const topics=subject.topics.length?'<table class="drill-topic-table" aria-label="Materi prioritas '+item.key+'"><thead><tr><th>Materi</th><th class="number">Benar di tryout</th><th>Drill materi</th></tr></thead><tbody>'+subject.topics.map(topic=>'<tr><td>'+topic.name+'</td><td class="number">'+topic.correct+' / '+topic.total+' ('+format(topic.accuracy)+'%)</td><td><span class="muted">Belum ada data</span></td></tr>').join('')+'</tbody></table>':'<p class="muted">Rincian materi belum tersedia.</p>';
    return main+'<tr class="drill-material-row"><td colspan="3"><details class="drill-material-details" data-material-subtest="'+item.key+'"><summary>Materi yang perlu diperbaiki · '+subject.topics.length+' topik</summary>'+topics+'<p class="drill-rules-note">Data drill per materi belum tersedia; status pengerjaan materi belum dapat dipastikan.</p></details></td></tr>';
  }).join(''):'<tr><td colspan="3" class="muted">Belum ada data subtes.</td></tr>';
  $('drill-summary-scope').textContent='Prioritas dari '+events.length+' tryout · '+(toKind==='all'?'semua jenis':toKind.toLowerCase())+' · Drill: '+eventDate(drillSnapshot.startDate)+'–'+eventDate(drillSnapshot.endDate)+' '+drillSnapshot.endDate.slice(0,4);
  $('drill-quantity-note').textContent=summary.total===0?'Data drill belum tersedia.':summary.questionTarget===null?'Total '+summary.total+' soal. Jumlah belum dinilai karena target soal periode report belum ditetapkan.':'Total '+summary.total+' dari target '+summary.questionTarget+' soal · '+(summary.quantityState==='met_target'?'target jumlah tercapai.':'masih kurang '+(summary.questionTarget-summary.total)+' soal.');
  renderSaTasks('drill-followup-student',['Bahas cara siswa memilih materi drill pada subtes prioritas.','Tinjau contoh pengerjaan dan pembahasan jawabannya jika tersedia.']);
  renderMaterialSample();
}'''

classroom='''let classroomPage=1;
const classroomPageSize=6;
function renderClassroomSessions(){
 const sessions=classroomReport.input.sessions,pages=Math.max(1,Math.ceil(sessions.length/classroomPageSize));
 classroomPage=Math.min(pages,Math.max(1,classroomPage));
 const start=(classroomPage-1)*classroomPageSize;
 const body=$('classroom-session-rows');body.replaceChildren();
 for(const session of sessions.slice(start,start+classroomPageSize)){
  const row=document.createElement('tr');row.id='class-session-'+session.id;row.dataset.attendanceSourceId=session.attendanceSourceId;row.dataset.noteSourceId=session.note.sourceId||'';
  if(session.attendance==='Terlambat')row.className='is-late';
  const cells=[eventDate(session.datetime.slice(0,10))+' · '+session.datetime.slice(11,16).replace(':','.'),session.subject,session.teacher||'—',session.attendance||'Belum tercatat'];
  cells.forEach(text=>{const td=document.createElement('td');td.textContent=text;row.append(td);});
  const note=document.createElement('td');
  if(session.note.text){const quote=document.createElement('blockquote');quote.textContent=session.note.text;note.append(quote);if(session.note.author&&session.note.author!==session.teacher){const author=document.createElement('small');author.className='note-author';author.textContent='Catatan: '+session.note.author;note.append(author);}}
  else{note.textContent='Belum ada catatan';note.className='muted';}
  row.append(note);body.append(row);
 }
 $('classroom-page-status').textContent=sessions.length?'Sesi '+(start+1)+'–'+Math.min(start+classroomPageSize,sessions.length)+' dari '+sessions.length+' · halaman '+classroomPage+' dari '+pages:'Belum ada sesi kelas.';
 $('classroom-prev').disabled=classroomPage===1;$('classroom-next').disabled=classroomPage===pages;
}
$('classroom-prev').addEventListener('click',()=>{classroomPage--;renderClassroomSessions();});
$('classroom-next').addEventListener('click',()=>{classroomPage++;renderClassroomSessions();});
function renderClassroomReport(){
 const {sessions,sources}=classroomReport.input;
 const recorded=sessions.filter(session=>typeof session.note?.text==='string'&&session.note.text.trim());
 const present=sessions.filter(s=>['Hadir','Terlambat'].includes(s.attendance)).length,late=sessions.filter(s=>s.attendance==='Terlambat').length;
 const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const stats=$('classroom-stats');stats.replaceChildren();
 [['Kehadiran',present+' / '+sessions.length],['Terlambat',String(late)],['Catatan pengajar',recorded.length+' / '+sessions.length]].forEach(([label,value])=>{const group=element('div');if(label==='Terlambat')group.className='late-stat';group.append(element('dt',label));const count=element('dd',value+' ');count.append(element('small','sesi'));group.append(count);stats.append(group);});
 const summary=$('classroom-summary'),citationList=$('classroom-citations');summary.replaceChildren();citationList.replaceChildren();
 const statements=classroomReport.summary.statements;
 const sourceBacked=classroomReport.summary.mode==='curated_prototype'&&statements.length>0&&statements.every(statement=>statement.text&&statement.evidence.length>0&&statement.evidence.every(evidence=>recorded.some(session=>session.note.id===evidence.noteId&&evidence.quote&&session.note.text.includes(evidence.quote))));
 if(sourceBacked)statements.forEach(statement=>{
  const p=element('p',statement.text);p.dataset.sourceIds=statement.evidence.map(e=>e.noteId).join(' ');summary.append(p);
  const citations=element('div',undefined,'classroom-citations');citations.append(element('span','Catatan sumber:'));
  statement.evidence.forEach(e=>{const session=recorded.find(s=>s.note.id===e.noteId),link=element('a',session.subject+' · '+eventDate(session.datetime.slice(0,10)));link.href='#class-session-'+session.id;link.addEventListener('click',event=>{event.preventDefault();classroomPage=Math.floor(sessions.indexOf(session)/classroomPageSize)+1;renderClassroomSessions();const row=$('class-session-'+session.id);row.scrollIntoView({block:'center'});row.tabIndex=-1;row.focus({preventScroll:true});});citations.append(link);});citationList.append(citations);
 });else summary.append(element('p','Ringkasan belum tersedia. Silakan baca catatan asli per sesi.'));
 $('classroom-coverage').textContent='Kehadiran mencakup '+sessions.filter(s=>s.attendance==='Hadir').length+' hadir dan '+late+' terlambat. Tidak hadir: '+sessions.filter(s=>s.attendance==='Sakit').length+' sakit · '+sessions.filter(s=>s.attendance==='Izin').length+' izin. '+(sessions.length-recorded.length)+' sesi belum memiliki catatan pengajar.';
 const links=$('classroom-source-links');links.replaceChildren(...sources.map(source=>{const link=element('a',source.label+' ↗');link.href=source.url;link.target='_blank';link.rel='noopener';return link;}));
 renderClassroomSessions();
}
'''

for mode,backup in [('Guided Report','before-guided.html'),('Meeting Mode','before-meeting.html')]:
 text=(OUT/backup).read_text()
 text=text.replace('</style>',css+'\n</style>',1)
 text=re.sub(r'\s*<p class="brief-footnote">.*?</p>','',text,count=1)
 text=text.replace('<strong id="brief-drill"></strong>','<strong id="brief-drill"></strong><span class="brief-detail" id="brief-drill-count"></span><span class="brief-detail" id="brief-drill-accuracy"></span>')
 text=text.replace('<p id="academic-followup-evidence"', '<p id="academic-score-position" class="score-position"></p><p id="academic-followup-evidence"',1)
 text=text.replace('    </article>\n  </section>\n\n  <section id="materi"',settings+'\n    </article>\n  </section>\n\n  <section id="materi"',1)
 # Move material provenance into the drill section. Per-priority topic rows are rendered in its table.
 a=text.index('      <div id="materi-contoh"');b=text.index('      <div class="focus-guidance"',a)
 material=text[a:b]
 text=text[:a]+text[b:]
 a=text.index('      <div class="focus-guidance"');b=text.index('      <p class="source-note">',a)
 guidance=text[a:b];text=text[:a]+text[b:]
 provenance='''<details id="materi-contoh" class="matrix-help material-data-details"><summary>Cara pemilihan materi dan cakupan data</summary>
 <p>Urutan prioritas: frekuensi masuk tiga nilai terendah, nilai tengah terendah, lalu nilai tryout terbaru terendah. Rincian ditampilkan untuk tiga subtes prioritas, masing-masing tiga materi dengan persentase benar terendah.</p>
 <p>Rentang data materi: <span id="material-period"></span>. Nilai subtes: <span id="material-score-scope"></span>. Hasil tryout materi: <span id="material-source-scope"></span>.</p>
 <p>Rincian hasil materi masih memakai data prototype. Data drill asli tersedia pada tingkat subtes; pemetaan drill per materi belum tersedia.</p><ul id="material-source-events"></ul>
 <p>Benar di tryout = jumlah jawaban benar / jumlah soal materi. Data materi tidak dijumlahkan ke total drill subtes.</p></details>'''
 text=text.replace('<h2 id="drill-title">Bagaimana hasil drill soalnya?</h2>','<h2 id="drill-title">Drill dan materi yang perlu diperbaiki</h2>')
 text=text.replace('<a href="#drill">Drill terkait</a>','<a href="#drill">Drill &amp; materi</a>')
 text=text.replace('      <details class="matrix-help"><summary>Cara membaca drill</summary>', '      <p id="drill-quantity-note" class="drill-rules-note"></p>\n      '+provenance+'\n      <details class="matrix-help"><summary>Cara membaca drill</summary>',1)
 text=text.replace('Subtes diurutkan dari yang paling sering masuk tiga nilai terendah di tryout, lalu rata-rata nilai terendah. Batang kecil menunjukkan frekuensinya; klik untuk melihat jumlah tryout.','Urutan subtes mengikuti tabel nilai. Akurasi drill kurang jika di bawah 75%; nilai 75% atau lebih memenuhi ambang akurasi. Jumlah drill dinilai setelah target soal periode report ditetapkan.')
 text=text.replace('lalu rata-rata terendah.','lalu nilai tengah terendah, lalu nilai pada tryout terbaru terendah.')
 # Keep the SA material followup next to the merged material section.
 text=text.replace('      <div class="evidence-note sa-followup-callout"><strong>Yang perlu digali SA</strong><div class="sa-audience-grid"><div class="sa-audience-item"><strong>Siswa</strong><div id="drill-followup-student"',guidance+'      <div class="evidence-note sa-followup-callout"><strong>Yang perlu digali SA</strong><div class="sa-audience-grid"><div class="sa-audience-item"><strong>Siswa</strong><div id="drill-followup-student"',1)
 # One material+drill task box suffices; remove the duplicated material SA box but retain hidden legacy IDs for renderer compatibility.
 text=text.replace(guidance,'',1)
 text=text.replace('  renderMaterialGuidance(events);\n','')
 a=text.index('function renderMaterialGuidance(events){');b=text.index('\n}',a)+2;text=text[:a]+text[b:]
 # Replace classroom popup trigger with full table in the main section.
 table='''<h3 class="classroom-sessions-title">Sesi dan catatan pengajar</h3><p id="classroom-coverage" class="classroom-coverage"></p>
 <div class="table-wrap"><table class="classroom-table" aria-label="Sesi kelas dan catatan pengajar"><thead><tr><th>Tanggal · waktu</th><th>Mata pelajaran</th><th>Pengajar</th><th>Kehadiran</th><th>Catatan pengajar</th></tr></thead><tbody id="classroom-session-rows"></tbody></table></div>
 <div class="classroom-pagination"><p id="classroom-page-status" role="status"></p><div><button id="classroom-prev" class="btn" type="button">← Sebelumnya</button><button id="classroom-next" class="btn" type="button">Berikutnya →</button></div></div>
 <details class="classroom-evidence"><summary>Sumber ringkasan dan rekaman kelas</summary><div id="classroom-citations"></div><div id="classroom-source-links" class="classroom-source-links" aria-label="Sumber Student Tower"></div></details>'''
 text=re.sub(r'<button class="btn classroom-details-button".*?</button>',table,text,count=1)
 text=re.sub(r'<dialog id="classroom-dialog".*?</dialog>\s*','',text,count=1,flags=re.S)
 text=text.replace('Baca ringkasan pengajar; buka detail untuk melihat catatan tiap sesi.','Baca ringkasan pengajar dan catatan asli pada tabel sesi.')
 text=text.replace('// TRYOUT_WORDING_END','// TRYOUT_WORDING_END\n'+config,1)
 text=replace_block(text,'function renderAcademicFollowup(key){','function subSummaryRow',academic)
 text=text.replace("renderAcademicFollowup(key);renderSubjectFocus();renderOverview();renderDrillInsights();","updateIndicatorFields();renderAcademicFollowup(key);renderSubjectFocus();renderOverview();renderDrillInsights();")
 text=text.replace('eligible,mean:available.length?', 'eligible,median:scoreMedian(available),latest:numeric(last)?last:null,mean:available.length?',1)
 text=text.replace('}).sort((a,b)=>b.count-a.count||(a.mean??Infinity)-(b.mean??Infinity)||a.key.localeCompare(b.key));','}).sort(ReportInsights.priorityOrder);',1)
 text=replace_block(text,'function renderDrillInsights(){','function renderOverview(){',drill)
 old="  $('brief-drill').textContent=drillRows.length?drillTotal+' soal: '+drillRows.map(row=>row.subtest+' '+row.total).join(' + ')+'.':'Data drill belum tersedia.';"
 new="""  const drillSummary=ReportInsights.drill(lowestSubtests,drillRows,reportRules);
  $('brief-drill').textContent=!lowestSubtests.length?'Prioritas subtes belum tersedia.':drillSummary.covered.length?'Drill tercatat pada '+drillSummary.covered.length+' dari '+lowestSubtests.length+' subtes prioritas: '+drillSummary.covered.map(s=>s.key).join(', ')+'.'+(drillSummary.missing.length?' '+drillSummary.missing.map(s=>s.key).join(' dan ')+' belum tercatat.':''):'Drill pada '+lowestSubtests.length+' subtes prioritas belum tercatat.';
  $('brief-drill-count').textContent=drillSummary.total===0?'Jumlah soal drill belum tersedia.':drillSummary.total+' soal drill UTBK'+(drillSummary.questionTarget===null?' · jumlah belum dinilai; target belum ditetapkan.':' dari target '+drillSummary.questionTarget+' · '+(drillSummary.quantityState==='met_target'?'target tercapai.':'belum mencapai target.'));
  const accuracy=$('brief-drill-accuracy');accuracy.className='brief-detail'+(drillSummary.belowAccuracy?' negative':'');
  accuracy.textContent=drillSummary.accuracy===null?'Akurasi belum tersedia.':'Total '+format(drillSummary.accuracy)+'% benar'+(drillSummary.belowAccuracy?' · kurang dari 75%.':' · memenuhi ambang 75%.')+(drillSummary.covered.length?' '+drillSummary.covered.map(s=>{const d=drillRows.find(r=>r.subtest===s.key);return s.key+': '+d.total+' soal · '+format(d.correct/d.total*100)+'% benar';}).join('; ')+'.':'');"""
 assert old in text;text=text.replace(old,new,1)
 old="  $('brief-classroom').textContent='Hadir '+classSessions.filter(session=>['Hadir','Terlambat'].includes(session.attendance)).length+'/'+classSessions.length+' sesi; '+classNotes.length+' sesi memiliki catatan pengajar.';"
 new="""  const present=classSessions.filter(s=>['Hadir','Terlambat'].includes(s.attendance)).length,late=classSessions.filter(s=>s.attendance==='Terlambat').length;
  $('brief-classroom').replaceChildren(document.createTextNode('Hadir '+present+' dari '+classSessions.length+' sesi, termasuk '));
  const lateLabel=document.createElement('span');lateLabel.className='late-highlight';lateLabel.textContent=late+' sesi terlambat';$('brief-classroom').append(lateLabel,document.createTextNode('. Tidak hadir: '+classSessions.filter(s=>s.attendance==='Sakit').length+' sakit · '+classSessions.filter(s=>s.attendance==='Izin').length+' izin.'));"""
 assert old in text;text=text.replace(old,new,1)
 text=text.replace('class="number">Rata-rata</th>','class="number">Nilai tengah</th>')
 text=text.replace("(item.mean===null?'—':format(item.mean))","(item.median===null?'—':format(item.median))")
 text=text.replace("rankSubtests(events,data).filter(item=>item.mean!==null).sort((a,b)=>a.mean-b.mean||a.key.localeCompare(b.key)).slice(0,3)","rankSubtests(events,data).filter(item=>item.median!==null&&item.count>0).slice(0,3)")
 # Remove old duplicate material table renderer, keep period/source metadata.
 a=text.index("  $('material-sample-rows').innerHTML=");b=text.index('\n}',a);text=text[:a]+text[b:]
 text=replace_block(text,'function renderClassroomReport(){','// CLASSROOM_REPORT_END',classroom)
 (ROOT/f'Consultation Brief - Garuda Mahawira Sena - {mode}.html').write_text(text)
print('Updated summary, median priorities, merged drill/materials, indicator inputs and classroom table in both modes.')
