"""Add session-scoped leaderboard references without assigning an unknown screenshot to a tryout."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def block(text,start,end,new):
 a=text.index(start);b=text.index(end,a);return text[:a]+new+'\n'+text[b:]

session='''
// Each reference belongs to one tryout AND one program/university. Unknown screenshot sessions stay separate.
let choiceSession='unassigned';
const leaderboardStorageKey='garuda-leaderboard-by-session-v1';
const leaderboardBySession={unassigned:Object.fromEntries(choices.map(c=>[c.id,{rank:null,participants:null,highestScore:c.leaderboardHighestScore,source:c.leaderboardSource}]))};
try{const saved=JSON.parse(localStorage.getItem(leaderboardStorageKey)||'{}');for(const event of toEvents){if(saved[event.id]&&typeof saved[event.id]==='object')leaderboardBySession[event.id]=saved[event.id];}}catch(error){}
const selectedChoiceEvent=()=>toEvents.find(e=>e.id===choiceSession)||toEvents.at(-1);
function leaderboardSessionOptions(){return '<option value="unassigned"'+(choiceSession==='unassigned'?' selected':'')+'>Referensi tersimpan · sesi belum tercatat</option>'+toEvents.map(event=>'<option value="'+event.id+'"'+(event.id===choiceSession?' selected':'')+'>'+eventLabel(event)+' · '+eventDate(event.date)+' '+event.date.slice(0,4)+'</option>').join('');}
function choiceReference(c,eventId=choiceSession){return ReportInsights.leaderboardRecord(leaderboardBySession,eventId,c.id);}
function chooseLeaderboardSession(value){
 if(value!=='unassigned'&&!toEvents.some(e=>e.id===value))return;
 choiceSession=value;baseline='latest';
 document.querySelectorAll('[data-baseline]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.baseline===baseline)));
 renderChoices();if(activeChoice&&$('choice-dialog').open)renderChoiceDetail();
}
$('choice-session').addEventListener('change',e=>chooseLeaderboardSession(e.target.value));
function baselineValue(){const values=series.average.values.filter(numeric);return baseline==='latest'?series.average.values[toEvents.indexOf(selectedChoiceEvent())]:scoreMedian(values);}
function choiceScoreLabel(){return choiceView==='scenario'?'Skor simulasi':baseline==='median'?'Nilai tengah '+series.average.values.filter(numeric).length+' tryout':selectedChoiceEvent().id===toEvents.at(-1).id?'Nilai tryout terakhir':'Nilai pada sesi terpilih';}
function choiceSubtestScore(key){const values=series[key]?.values||[];return baseline==='median'&&choiceView!=='scenario'?scoreMedian(values.filter(numeric)):values[toEvents.indexOf(selectedChoiceEvent())];}
function choiceScore(){return choiceView==='scenario'?choiceScenario.score:baselineValue();}
function choiceWeighted(c){return c.pgWeightedScore;}
function choiceLeaderboardHighest(c){return choiceReference(c).highestScore;}
function choiceLeaderboardSubtest(c,key){return null;}
function choiceLeaderboardGap(c,score=choiceScore()){const target=choiceLeaderboardHighest(c);return target!==null&&numeric(score)?score-target:null;}
function choiceRank(c){return choiceReference(c).rank;}
function renderChoices(){
 const score=choiceScore();$('comparison-score').textContent=numeric(score)?format(score):'—';
 $('comparison-label').textContent=choiceView==='scenario'?'Skor simulasi yang dibandingkan':'Skor siswa · '+choiceScoreLabel().toLowerCase();
 $('choice-session').innerHTML=leaderboardSessionOptions();
 document.querySelector('[data-baseline="latest"]').textContent=selectedChoiceEvent().id===toEvents.at(-1).id?'Nilai tryout terakhir':'Nilai sesi terpilih';
 const status=choiceSession==='unassigned'?'Sesi referensi leaderboard belum tercatat. Peringkat langsung belum tersedia; selisih memakai referensi tersimpan.':'Pembanding dan peringkat mengikuti '+eventLabel(selectedChoiceEvent())+' · '+eventDate(selectedChoiceEvent().date)+'. '+(choices.some(c=>choiceReference(c).highestScore===null)?'Data leaderboard sesi ini belum lengkap.':'');
 $('choice-leaderboard-status').hidden=false;$('choice-leaderboard-status').textContent=status;
 $('choice-rows').innerHTML=choices.map((c,i)=>{const ref=choiceReference(c),target=ref.highestScore,gap=choiceLeaderboardGap(c,score),position=ref.rank===null?'<span class="rank-unavailable">Belum tersedia</span>':'<strong>'+ref.rank+' dari '+ref.participants+'</strong>';return '<tr><td><div class="choice-program"><span class="choice-order">'+(i+1)+'</span>'+c.degree+' '+c.program+'</div><div class="choice-university">'+c.university+'</div></td><td class="number">'+position+'</td><td class="number">'+(target===null?'<span class="rank-unavailable">Belum tersedia</span>':format(target))+'</td><td class="number"><span class="choice-gap '+(gap===null?'':gap<0?'negative':gap>0?'positive':'neutral')+'">'+(gap===null?'—':signed(gap))+'</span></td><td class="number"><button type="button" class="link-button" data-choice="'+c.id+'">Detail →</button></td></tr>';}).join('');
}
'''

history='''
function leaderboardHistory(c){
 const rows=toEvents.map((event,i)=>{const ref=choiceReference(c,event.id);return '<tr class="'+(event.id===choiceSession?'selected-event':'')+'"><td>'+eventLabel(event)+'<small>'+eventDate(event.date)+'</small></td><td class="number">'+format(series.average.values[i])+'</td><td class="number">'+(ref.rank===null?'—':ref.rank+' dari '+ref.participants)+'</td><td class="number">'+(ref.highestScore===null?'—':format(ref.highestScore))+'</td></tr>';}).join('');
 return '<div class="scan-section"><div class="table-wrap"><table class="choice-history-table"><caption>Riwayat peringkat pada pilihan ini</caption><thead><tr><th>Sesi tryout</th><th class="number">Nilai Garuda</th><th class="number">Peringkat</th><th class="number">Nilai tertinggi</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="choice-rank-status">— = data leaderboard untuk sesi dan pilihan ini belum tersedia. Peringkat dibandingkan bersama jumlah pesertanya.</p></div>';
}
function leaderboardEditor(c){
 if(choiceSession==='unassigned')return '<p class="choice-session-notice">Pilih sesi tryout untuk melengkapi referensi dan riwayat peringkatnya.</p>';
 const ref=choiceReference(c);
 return '<details class="choice-secondary"><summary>Lengkapi data leaderboard sesi ini</summary><p class="choice-session-notice">Isi dari leaderboard '+eventLabel(selectedChoiceEvent())+' untuk '+c.degree+' '+c.program+' · '+c.university+'. Data disimpan di browser ini.</p><form id="leaderboard-editor" class="leaderboard-form"><label>Peringkat Garuda<input id="leaderboard-rank" type="number" min="1" step="1" value="'+(ref.rank??'')+'"></label><label>Jumlah peserta<input id="leaderboard-participants" type="number" min="1" step="1" value="'+(ref.participants??'')+'"></label><label>Nilai tertinggi<input id="leaderboard-highest" type="number" min="0" max="1000" step="any" value="'+(ref.highestScore??'')+'"></label><button class="btn" type="submit">Simpan data sesi</button><p id="leaderboard-editor-status" role="status" class="choice-rank-status"></p></form></details>';
}
$('choice-dialog-content').addEventListener('change',event=>{if(event.target.id==='choice-dialog-session')chooseLeaderboardSession(event.target.value);});
$('choice-dialog-content').addEventListener('submit',event=>{
 if(event.target.id!=='leaderboard-editor')return;event.preventDefault();
 const read=id=>$(id).value.trim()===''?null:Number($(id).value),rank=read('leaderboard-rank'),participants=read('leaderboard-participants'),highestScore=read('leaderboard-highest');
 if((rank!==null&&(!Number.isInteger(rank)||rank<1||participants===null))||(participants!==null&&(!Number.isInteger(participants)||participants<1))||(rank!==null&&rank>participants)||(highestScore!==null&&(!numeric(highestScore)||highestScore<0||highestScore>1000))){$('leaderboard-editor-status').textContent='Peringkat dan peserta harus bilangan bulat positif; peringkat tidak boleh melebihi peserta. Nilai tertinggi berada pada 0–1.000.';return;}
 const c=choices.find(c=>c.id===activeChoice);if(!c||choiceSession==='unassigned')return;
 leaderboardBySession[choiceSession]??={};leaderboardBySession[choiceSession][c.id]={rank,participants,highestScore,source:'Diisi pada prototype dari leaderboard sesi yang dipilih',enteredAt:new Date().toISOString()};
 let saved=true;try{const data=Object.fromEntries(Object.entries(leaderboardBySession).filter(([key])=>key!=='unassigned'));localStorage.setItem(leaderboardStorageKey,JSON.stringify(data));}catch(error){saved=false;}
 renderChoices();renderChoiceDetail();
 const editor=$('leaderboard-editor');editor.closest('details').open=true;$('leaderboard-editor-status').textContent=saved?'Data sesi tersimpan di browser ini.':'Data diterapkan untuk tampilan ini; penyimpanan browser tidak tersedia.';
});
'''

for mode in ['Guided Report','Meeting Mode']:
 p=ROOT/f'Consultation Brief - Garuda Mahawira Sena - {mode}.html';text=p.read_text()
 target='      <div class="choice-view-toggle"'
 a=text.index(target)
 text=text[:a]+'      <div class="choice-session-bar"><label class="select-label" for="choice-session">Sesi leaderboard <select id="choice-session"></select></label></div>\n'+text[a:]
 text=block(text,'function baselineValue(){','function choiceGapDescription(',session)
 text=text.replace("  const event=toEvents.at(-1);\n  return eventLabel(event)","  const event=selectedChoiceEvent();\n  return eventLabel(event)",1)
 text=text.replace('const rank=estimatedLeaderboardRank(c),mapping=choicePriorityMapping(c);','const ref=choiceReference(c),rank=ref.rank,mapping=choicePriorityMapping(c);')
 text=text.replace("'Tryout terakhir: '+toEvents.at(-1).name+' · 8 Oktober 2026.'","'Sesi nilai siswa: '+selectedChoiceEvent().name+' · '+eventDate(selectedChoiceEvent().date)+' '+selectedChoiceEvent().date.slice(0,4)+'.'")
 a=text.index("    '<div><strong>Perkiraan peringkat</strong>");b=text.index("    '<div><strong>Acuan nilai",a)
 text=text[:a]+"    '<div><strong>Peringkat pada sesi terpilih</strong><p>Peringkat menggunakan urutan langsung dan jumlah peserta dari leaderboard sesi yang dipilih. '+(rank===null?'Data peringkat langsung belum tersedia.':rank+' dari '+ref.participants+' peserta.')+' Angka estimasi dari persentil pada versi sebelumnya tidak digunakan sebagai peringkat langsung.</p></div>'+\n"+text[b:]
 a=text.index("    '<div><strong>Nilai tertinggi peserta di leaderboard</strong>");b=text.index("    '<div><strong>Kode subtes",a)
 text=text[:a]+"    '<div><strong>Referensi leaderboard tersimpan</strong><p>'+c.leaderboardSource+'</p>'+(choiceEvidenceFiles[c.id]?'<a href=\"'+choiceEvidenceFiles[c.id]+'\" target=\"_blank\" rel=\"noopener\">Lihat screenshot sumber ↗</a>':'')+'<p>Nilai tersimpan: '+format(c.leaderboardHighestScore)+'. Sesi tryout pada screenshot belum tercatat sehingga referensi ini tetap terpisah dari sesi bertanggal. Pemilihan sesi tidak menyalin angka ini ke sesi tersebut.</p><p>Data yang diisi pada prototype harus diperiksa terhadap leaderboard aslinya.</p></div>'+\n"+text[b:]
 text=text.replace('  const rank=estimatedLeaderboardRank(c);','  const ref=choiceReference(c),rank=ref.rank;',1)
 a=text.index("  $('choice-dialog-content').innerHTML='<div class=\"choice-scan\">")
 b=text.index("    '<div class=\"scan-section\"><h3>Perbandingan nilai",a)
 text=text[:a]+'''  $('choice-dialog-content').innerHTML='<div class="choice-dialog-session"><label class="select-label" for="choice-dialog-session">Sesi leaderboard<select id="choice-dialog-session">'+leaderboardSessionOptions()+'</select></label></div>'+ '<div class="choice-scan"><div class="detail-stat"><label>'+scoreLabel+'</label><strong>'+format(score)+'</strong><small class="subnumber">'+choiceScoreContext()+'</small></div><div class="detail-stat"><label>Peringkat pada sesi terpilih</label><strong>'+(rank===null?'—':rank)+'</strong><small class="subnumber">'+(rank===null?'Peringkat langsung belum tersedia':'dari '+ref.participants+' peserta')+'</small></div></div>'+
    '<p class="choice-rank-note">'+(choiceSession==='unassigned'?'Sesi referensi tersimpan belum tercatat. Nilai Garuda memakai '+choiceScoreContext()+'.':'Peringkat dan pembanding mengikuti sesi yang dipilih; nilai tengah tidak mengubah peringkat sesi.')+'</p>'+leaderboardEditor(c)+
'''+text[b:]
 text=text.replace('    weightedExploration(c,score)+choiceSourceDetails(c);','    leaderboardHistory(c)+weightedExploration(c,score)+choiceSourceDetails(c);',1)
 pos=text.index("document.querySelectorAll('[data-leaderboard-info]')")
 text=text[:pos]+history+'\n'+text[pos:]
 text=text.replace('Peringkat bersifat perkiraan. Nilai tertinggi peserta bukan batas kelulusan.','Peringkat mengikuti sesi leaderboard yang dipilih. Nilai tertinggi peserta bukan batas kelulusan.')
 text=text.replace('Estimasi dari persentil Student Tower, bukan urutan resmi leaderboard. Tetap saat acuan nilai siswa diganti.','Urutan langsung Garuda dari jumlah peserta pada pilihan dan sesi tryout yang dipilih. Jika belum tersedia, ditampilkan —.')
 text=text.replace('Nilai pembanding tetap saat acuan Garuda diganti. Nama lengkap dan tanggal tryout pembanding tersedia jika sudah tercatat pada sumber data.','Nilai pembanding mengikuti sesi leaderboard yang dipilih. Referensi yang belum diketahui sesinya ditampilkan terpisah.')
 p.write_text(text)
print('Added per-session reference selection, direct rank history, and local numeric data entry to both modes.')
