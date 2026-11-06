import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('report-logic/tryout-wording.js','utf8');
const ctx=vm.createContext({});vm.runInContext(source+';globalThis.engine=TryoutWording;',ctx);
const engine=ctx.engine;
const out='outputs/tryout-wording-2026-10-22';fs.mkdirSync(out,{recursive:true});
const keys=Object.keys(engine.patterns);
const kinds=['Reguler','Premium','Campuran','Kosong'];
const qualities=['Lengkap','Kosong di tengah','Kosong di awal','Kosong terakhir','Semua kosong','Nilai tidak valid'];
const tolerances=[0,5,10],magnitudes=[null,20,50],times=['Normal','Jeda panjang','Hasil lama','Tanggal tidak valid'];
const iso=days=>new Date(days*86400000).toISOString().slice(0,10);
function makeRows(values,{kind='Campuran',quality='Lengkap',time='Normal'}={}){
 const end=Date.parse((time==='Hasil lama'?'2026-07-01':'2026-10-08')+'T00:00:00Z')/86400000;
 const rows=Array.from(values,(value,i)=>({id:'TO-'+(i+1),value,date:iso(end-(values.length-1-i)*(time==='Jeda panjang'?45:7)),kind:kind==='Kosong'?null:kind==='Campuran'?(i%2?'Premium':'Reguler'):kind}));
 if(rows.length){
  if(quality==='Kosong di tengah')rows[Math.floor((rows.length-1)/2)].value=null;
  if(quality==='Kosong di awal')rows[0].value=null;
  if(quality==='Kosong terakhir')rows.at(-1).value=null;
  if(quality==='Semua kosong')rows.forEach(r=>r.value=null);
  if(quality==='Nilai tidak valid')rows[0].value=-1;
  if(time==='Tanggal tidak valid')rows[0].date='2026-02-31';
 }
 return rows;
}
const base=keys.map(pattern=>{
 const [label,values]=engine.patterns[pattern];
 const records=makeRows(values,{kind:'Reguler'});
 const output=engine.analyze(records,{seriesLabel:'Skor total'});
 assert.equal(output.pattern,pattern,'Base example: '+pattern);
 return {pattern,label,values,records,output};
});
let testedSequences=0;
for(let length=0;length<=7;length++){
 for(let code=0;code<3**length;code++){
  let c=code;const values=[500];
  for(let i=0;i<length;i++){values.push(values.at(-1)+[-20,0,20][c%3]);c=Math.floor(c/3);}
  const result=engine.analyze(makeRows(values));
  assert(keys.includes(result.pattern));
  assert(result.observation&&result.student&&result.parent&&result.nextStep);
  if(values.length>2&&values[0]===values.at(-1)&&new Set(values).size>1)assert.notEqual(result.pattern,'steady_flat');
  testedSequences++;
 }
}
const jsonl=fs.openSync(out+'/semua-kombinasi-wording.jsonl','w');
let combinations=0;
for(const b of base)for(const kind of kinds)for(const quality of qualities)for(const tolerance of tolerances)for(const largeChangePoints of magnitudes)for(const time of times){
 const records=makeRows(b.values,{kind,quality,time});
 const config={seriesLabel:'Skor total',tolerance,largeChangePoints,longGapDays:30,staleAfterDays:30,asOf:'2026-10-22'};
 const result=engine.analyze(records,config);
 assert(keys.includes(result.pattern));
 assert(!/undefined|NaN|Infinity/.test(JSON.stringify(result)));
 assert(!/[?]/.test([result.student,result.parent,result.nextStep,...result.additionalQuestions,result.typeQuestion].join(' '))); 
 if(result.parameters.validCount<2)assert.equal(result.typeQuestion,'');
 if(result.parameters.kindState!=='mixed')assert.equal(result.typeQuestion,'');
 if(time==='Tanggal tidak valid'&&records.length)assert.equal(result.parameters.datesComplete,false);
 if(largeChangePoints===null)assert.equal(result.parameters.magnitude.configured,false);
 fs.writeSync(jsonl,JSON.stringify({id:++combinations,basePattern:b.pattern,dimensions:{kind,quality,tolerance,largeChangePoints,time},records,config,output:result})+'\n');
}
fs.closeSync(jsonl);
assert.equal(combinations,12960);
const empty=engine.analyze([{value:null,date:'2026-10-01'},{value:0,date:'2026-10-08'}]);assert.equal(empty.parameters.validCount,1);
const hole=engine.analyze(makeRows([500,530,null]));assert.equal(hole.parameters.latestDelta,null);assert(hole.notes.some(n=>n.includes('tryout terakhir')));
const tol=engine.analyze(makeRows([500,505,510]),{tolerance:5});assert.equal(tol.pattern,'steady_flat');assert.equal(tol.parameters.netDelta,10);
const t=engine.analyze(makeRows([500,520]),{largeChangePoints:20});assert.equal(t.parameters.magnitude.latestLarge,true);
const chron=makeRows([500,550,520]);const reordered=engine.analyze([chron[2],chron[0],chron[1]]);assert.equal(reordered.pattern,engine.analyze(chron).pattern);
const future=engine.analyze([{value:500,date:'2026-11-01',kind:'Reguler'}],{asOf:'2026-10-22',staleAfterDays:30});assert(future.parameters.time.future);assert(!future.parameters.time.stale);
const insufficient=engine.analyze(makeRows([500,null,600]));assert.equal(insufficient.pattern,'initial_up');assert(insufficient.notes.some(n=>n.includes('belum tersedia')));
// Both standalone reports carry exactly this version of the engine.
for(const mode of ['Guided Report','Meeting Mode']){
 const html=fs.readFileSync(`Consultation Brief - Garuda Mahawira Sena - ${mode}.html`,'utf8');
 assert.equal(html.split('// TRYOUT_WORDING_START\n')[1].split('// TRYOUT_WORDING_END')[0],source);
}
const dimensions={basePatterns:keys.length,kinds,qualities,tolerances,largeChangePoints:magnitudes,times,combinations,testedSequences,asOf:'2026-10-22',note:'Nilai ambang dan skenario hanya contoh untuk review, bukan ketetapan akademik. Ini seluruh kombinasi bucket di atas, bukan seluruh angka skor yang mungkin.'};
fs.writeFileSync(out+'/cakupan-dan-hasil-uji.json',JSON.stringify(dimensions,null,2)+'\n');
fs.writeFileSync('samples/tryout-wording-cases.json',JSON.stringify({dimensions,cases:base},null,2)+'\n');
const table=base.map(b=>`| ${b.label} | ${b.values.length?b.values.join(' → '):'Tidak ada'} | \`${b.pattern}\` |`).join('\n');
const details=base.map((b,i)=>`### ${i+1}. ${b.label}\n\nContoh: ${b.values.length?b.values.join(' → '):'belum ada hasil'}.\n\n- **Temuan:** ${b.output.observation}\n- **Siswa:** ${b.output.student}\n- **Orang tua:** ${b.output.parent}\n- **Tindak lanjut:** ${b.output.nextStep}\n`).join('\n');
const doc=`# Matriks wording SA — progres tryout\n\nDiperbarui 22 Oktober 2026. Aturan awal untuk ditinjau SA/tim akademik; penyebab perubahan tidak disimpulkan otomatis. Reguler dan premium diperlakukan sebagai satu rangkaian sesuai keputusan pengguna. Wording pendalaman berbentuk tugas untuk SA, bukan pertanyaan langsung kepada siswa. Gunakan kata dasar seperti Bahas, Tinjau, Bandingkan, Pastikan atau Konfirmasi. Buat tugas singkat dan konkret; bentuk instruksi ditujukan kepada SA, tanpa mengarahkan jawaban siswa. Sebut objek yang dibahas tanpa menetapkan penyebab, mengasumsikan adanya kendala, atau mengarahkan jawaban. Temuan angka tetap terpisah dari tugas pendalaman. Nama field student, parent, nextStep, additionalQuestions dan typeQuestion dipertahankan untuk kompatibilitas; seluruh isinya kini berupa poin tugas.\n\n## Parameter dan kemungkinan nilainya\n\n| Parameter | Kondisi yang ditangani | Dampak wording |\n|---|---|---|\n| Jumlah hasil valid | 0, 1, 2, minimal 3 | Belum ada tren, satu pengalaman, satu perubahan, atau pola beberapa tryout |\n| Kelengkapan | Lengkap, kosong di awal/tengah/akhir, semua kosong, nilai tidak valid | Jelaskan cakupan; nilai kosong bukan nol; perubahan terakhir membutuhkan dua event terakhir bernilai |\n| Jenis tryout | Satu jenis, campuran, sebagian kosong, seluruhnya kosong | Tidak mengubah pola; campuran menambah poin pendalaman pengalaman jenis tryout |\n| Selisih keseluruhan | Naik, turun, dalam toleransi | Membaca arah awal–akhir tanpa mengabaikan pergerakan di tengah |\n| Selisih per tryout | Positif, negatif, dalam toleransi | Membaca konsistensi, jeda, dan perubahan arah terakhir |\n| Variasi | Rentang skor, jumlah pergantian arah, urutan perubahan | Membedakan benar-benar tetap dari naik-turun yang kembali ke awal |\n| Besar perubahan | Ambang belum diaktifkan; di bawah atau mencapai ambang untuk perubahan terakhir, terbesar, dan keseluruhan | Tambahan poin pendalaman pada perubahan yang melewati ambang konfigurasi |\n| Waktu | Tanggal lengkap/tidak valid; jeda normal/panjang; hasil baru/lama; tanggal setelah acuan | Tambahan konteks waktu, tanpa otomatis mengasumsikan penyebab |\n| Metrik | Skor total atau subtes | Aturan sama; label dan angka mengikuti metrik yang dipilih |\n\n## Definisi dan urutan keputusan\n\n1. Hanya angka finite >= 0 yang dianggap nilai valid. Nol adalah nilai, null/kosong/string/negatif bukan nol.\n2. Jika semua tanggal valid, urutkan kronologis. Jika ada tanggal tidak valid, pertahankan urutan sumber dan nyatakan keterbatasannya; waktu tidak dinilai.\n3. Tentukan pola: jumlah hasil → semua perubahan tetap → satu arah (dengan/tanpa jeda) → pembalikan pada perpindahan terakhir → naik-turun dengan arah keseluruhan naik/turun/tetap. Pembalikan terakhir tidak otomatis disebut konsisten.\n4. Pilih satu template utama. Tambahkan kondisi data, besar perubahan, waktu, dan jenis tryout secara berurutan. Modifikasi ini dapat muncul bersama tanpa mengganti pola utama.\n5. Selisih dalam toleransi memakai |delta| <= toleransi. Default report **0 poin**, sehingga kata tetap berarti tepat sama. Ambang opsional hanya aktif bila diisi angka positif.\n6. Ukuran besar perubahan memakai >= ambang; jeda panjang dan hasil lama memakai > ambang. Hasil lama membutuhkan tanggal acuan dan tanggal hasil terakhir.\n7. Untuk jeda di antara nilai kosong, pola hanya memakai hasil yang tersedia, dengan catatan kelengkapan. Perubahan pada tryout terakhir tidak dipinjam dari dua nilai lama bila hasil terakhir/sebelumnya kosong.\n8. Konsistensi memakai tanda perubahan antarevent, bukan sekadar selisih awal–akhir atau regresi. Jeda tanggal tidak dianggap laju poin per hari.\n\n## Matriks pola utama\n\n| Pola | Contoh nilai | Kode |\n|---|---|---|\n${table}\n\n## Wording tiap pola\n\n${details}\n## Lapisan tambahan dan kombinasi\n\n| Kondisi | Tambahan yang dihasilkan |\n|---|---|\n| Hasil kosong/tidak valid | Jumlah kekurangan, cakupan nilai yang dibaca, dan poin pendalaman melengkapi hasil |\n| Nilai tryout terakhir kosong | Penegasan bahwa pola belum menggambarkan tryout terakhir |\n| Tanggal tidak valid | Urutan sumber dipertahankan; jeda dan kebaruan tidak dinilai |\n| Perubahan terakhir mencapai ambang | Fakta ambang + poin pendalaman apa yang berbeda pada tryout terakhir |\n| Perubahan terbesar terjadi sebelumnya | Fakta perubahan terbesar + poin pendalaman tentang dua tryout tersebut |\n| Selisih kumulatif mencapai ambang | Nyatakan selisih awal–akhir meskipun perubahan tiap tryout lebih kecil |\n| Jeda panjang | Nyatakan panjang jeda + telusuri kegiatan/rutinitas selama jeda |\n| Hasil lama | Nyatakan usia hasil + telusuri hasil atau kondisi yang lebih baru |\n| Hasil bertanggal setelah acuan | Minta pemeriksaan tanggal; jangan sebut hasil lama |\n| Jenis campuran | Pertanyaan pengalaman antara jenis tryout, terpisah dari poin pendalaman utama |\n| Jenis kosong | Informasi kelengkapan jenis, tanpa membatalkan tren |\n\nToleransi positif dapat membuat kenaikan kecil berturut-turut masuk kategori tetap per langkah meskipun selisih kumulatif lebih besar; seluruh delta dan selisih kumulatif tetap tersedia. Batas 5/10 poin, 20/50 poin, dan 30 hari pada contoh simulasi adalah **nilai untuk review**, bukan standar akademik. Report memakai toleransi 0 dan menonaktifkan ambang besar/jeda/lama sampai ditentukan.\n\n## Cakupan kombinasi yang dihasilkan\n\nGenerator menghasilkan **${combinations.toLocaleString('id-ID')} kombinasi konfigurasi**: 15 contoh pola × 4 jenis tryout × 6 keadaan data × 3 toleransi × 3 ambang besar perubahan × 4 keadaan waktu. Beberapa konfigurasi menghasilkan teks sama; contoh tanpa nilai tidak dapat mempunyai tren atau jeda meskipun modifier dipilih. Ini seluruh kombinasi bucket tersebut, bukan klaim bahwa semua angka skor, panjang riwayat, atau kondisi operasional sudah terwakili. Nilai skor mentah memiliki kemungkinan tak terbatas; mesin aturan mengelompokkannya secara komposisional.\n\nSelain itu, semua **${testedSequences.toLocaleString('id-ID')} urutan tanda perubahan** sepanjang 0–7 perpindahan diuji, termasuk kondisi nilai ujung sama tetapi berfluktuasi. Pemeriksaan tambahan mencakup nilai nol, batas toleransi/ambang, kronologi, nilai terakhir kosong, dan tanggal masa depan.\n\n- [Simulator wording](Simulasi%20Wording%20SA%20-%20Tryout.html)\n- [Semua kombinasi beserta input, parameter, dan output](outputs/tryout-wording-2026-10-22/semua-kombinasi-wording.jsonl)\n- [Cakupan pengujian](outputs/tryout-wording-2026-10-22/cakupan-dan-hasil-uji.json)\n- [Contoh dasar yang bisa dipakai ulang](samples/tryout-wording-cases.json)\n\nSumber aturan: \`report-logic/tryout-wording.js\`. Salinannya tertanam pada kedua HTML Garuda agar tetap bisa dibuka mandiri.\n`;
fs.writeFileSync('Report Konsultasi - Matriks Wording Tryout.md',doc);
console.log(JSON.stringify({basePatterns:keys.length,combinations,testedSequences,output:out}));
const simulator=`<!doctype html>
<html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Simulasi Wording SA — Progres Tryout</title>
<style>
:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#233044;background:#f5f7fa;font-size:14px;line-height:1.6}*{box-sizing:border-box}body{margin:0}main{max-width:1200px;margin:auto;padding:28px 24px 60px}h1{font-size:27px;line-height:1.3;margin:0 0 8px}h2{font-size:17px;margin:0 0 10px}h3{font-size:13px;margin:0 0 5px}p{margin:6px 0 12px}.muted,small{color:#637086}.intro{max-width:820px}.workspace{display:grid;grid-template-columns:340px minmax(0,1fr);gap:22px;margin-top:24px}.panel{background:#fff;border:1px solid #dfe5ed;border-radius:12px;padding:20px;min-width:0}.field{display:flex;flex-direction:column;gap:5px;margin:0 0 13px}.field label{font-size:12px;font-weight:600}input,select,button{font:inherit;border:1px solid #ced6e1;border-radius:7px;padding:8px 10px;background:#fff;color:#233044;min-width:0;width:100%}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}small{font-size:11px}a{color:#4d56b3}button{background:#4d56b3;color:#fff;font-weight:600;cursor:pointer}.badge{display:inline-block;font-size:12px;color:#295f56;background:#e8f4ef;border-radius:20px;padding:4px 10px;margin-bottom:12px}.finding{padding:15px 17px;background:#eef5fc;border-radius:9px;font-size:15px;line-height:1.7}.audiences{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}.audience{border:1px solid #dce7e2;border-radius:9px;padding:13px;background:#f6fbf8}.audience p{font-size:13px;margin-bottom:0}.next{padding:12px 0;border-top:1px solid #e4e8ee;font-size:13px}#type-question{padding:12px 0;font-size:13px;border-top:1px solid #e4e8ee}#notes{font-size:12px;padding-left:18px;color:#526177}#notes li{margin:6px 0}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e5eaf0}th{background:#f7f9fc}details{margin-top:16px;font-size:12px}summary{cursor:pointer;font-weight:600}pre{overflow:auto;font-size:11px;white-space:pre-wrap;word-break:break-word;background:#f7f9fc;padding:12px;border-radius:7px}.history{font-size:12px;color:#637086;overflow-wrap:anywhere;margin-bottom:12px}footer{margin-top:24px;font-size:12px;display:flex;gap:18px;flex-wrap:wrap}[hidden]{display:none!important}:focus-visible{outline:3px solid #9babe5;outline-offset:2px}@media(max-width:760px){main{padding:20px 16px}.workspace{grid-template-columns:1fr}.audiences{grid-template-columns:1fr}h1{font-size:23px}.panel{padding:16px}}
</style>
<main><h1>Simulasi wording SA</h1><p class="intro muted">Uji pola nilai beserta kondisi tambahannya. Semua jenis tryout dihitung sebagai satu rangkaian; perbedaan jenis menjadi poin pendalaman pendalaman.</p>
<div class="workspace"><section class="panel" aria-label="Parameter simulasi"><h2>Parameter</h2>
<div class="field"><label for="scenario">Pola contoh</label><select id="scenario"></select></div>
<div class="field"><label for="scores">Urutan nilai</label><input id="scores" value="601, 576, 561, 546"><small>Pisahkan dengan koma. Gunakan - untuk nilai kosong dan titik untuk desimal.</small></div>
<div class="row"><div class="field"><label for="metric">Metrik</label><select id="metric"><option>Skor total</option><option>Penalaran Umum</option><option>Penalaran Matematika</option></select></div><div class="field"><label for="kind">Jenis tryout</label><select id="kind"><option>Campuran</option><option>Reguler</option><option>Premium</option><option>Kosong</option><option>Sebagian kosong</option></select></div></div>
<div class="field"><label for="quality">Kondisi data</label><select id="quality">${qualities.map(q=>'<option>'+q+'</option>').join('')}</select></div>
<div class="row"><div class="field"><label for="tolerance">Toleransi tetap (poin)</label><input id="tolerance" type="number" min="0" value="0"></div><div class="field"><label for="large">Ambang perubahan besar</label><input id="large" type="number" min="0" placeholder="Nonaktif"></div></div>
<div class="row"><div class="field"><label for="gap">Jeda tiap tryout (hari)</label><input id="gap" type="number" min="0" value="7"></div><div class="field"><label for="latest-date">Tanggal tryout terakhir</label><input id="latest-date" type="date" value="2026-10-08"></div></div>
<div class="row"><div class="field"><label for="long-gap">Ambang jeda panjang</label><input id="long-gap" type="number" min="0" placeholder="Nonaktif"></div><div class="field"><label for="stale">Ambang hasil lama (hari)</label><input id="stale" type="number" min="0" placeholder="Nonaktif"></div></div>
<div class="row"><div class="field"><label for="asof">Tanggal acuan</label><input id="asof" type="date" value="2026-10-22"></div><div class="field"><label for="dates">Kelengkapan tanggal</label><select id="dates"><option>Lengkap</option><option>Tanggal tidak valid</option></select></div></div>
<small>Angka ambang hanya untuk simulasi dan belum menjadi ketetapan akademik. Default report: toleransi 0; ambang lainnya nonaktif.</small>
</section><section class="panel" aria-label="Hasil wording"><h2>Output wording</h2><div aria-live="polite"><span id="pattern" class="badge"></span><p id="history" class="history"></p><p id="finding" class="finding"></p><div class="audiences"><div class="audience"><h3>Siswa</h3><p id="student"></p></div><div class="audience"><h3>Orang tua</h3><p id="parent"></p></div></div><div class="next"><h3>Tindak lanjut</h3><p id="next"></p></div><p id="type-question" hidden></p><ul id="notes" hidden></ul></div>
<details><summary>Input yang dibaca</summary><div id="input-table"></div></details><details><summary>Parameter hasil perhitungan</summary><pre id="parameters"></pre></details>
</section></div><footer><a href="Report%20Konsultasi%20-%20Matriks%20Wording%20Tryout.md">Matriks dan aturan wording</a><a href="outputs/tryout-wording-2026-10-22/semua-kombinasi-wording.jsonl" download>Unduh 12.960 kombinasi (JSONL)</a><a href="Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Guided%20Report.html#akademik">Buka report Garuda</a></footer></main>
<script>${source}
const examples=${JSON.stringify(base.map(b=>({pattern:b.pattern,label:b.label,values:b.values})))};
const $=id=>document.getElementById(id);
examples.forEach(example=>{const option=document.createElement('option');option.value=example.pattern;option.textContent=example.label;$('scenario').append(option);});
$('scenario').value='steady_down';
function num(id){return $(id).value.trim()===''?null:Number($(id).value);}
function render(){
 const text=$('scores').value.trim(),values=text?text.split(',').map(v=>{const x=v.trim();return x===''||x==='-'?null:Number(x);}):[];
 const end=Date.parse($('latest-date').value+'T00:00:00Z')/86400000,gap=num('gap')??7,kind=$('kind').value;
 const records=values.map((value,i)=>{const t=end-(values.length-1-i)*gap;return {id:'TO-'+(i+1),value,date:Number.isFinite(t)?new Date(t*86400000).toISOString().slice(0,10):null,kind:kind==='Kosong'?null:kind==='Sebagian kosong'?(i%2?null:'Reguler'):kind==='Campuran'?(i%2?'Premium':'Reguler'):kind};});
 if(records.length){const q=$('quality').value;if(q==='Kosong di tengah')records[Math.floor((records.length-1)/2)].value=null;if(q==='Kosong di awal')records[0].value=null;if(q==='Kosong terakhir')records.at(-1).value=null;if(q==='Semua kosong')records.forEach(r=>r.value=null);if(q==='Nilai tidak valid')records[0].value=-1;if($('dates').value!=='Lengkap')records[0].date='2026-02-31';}
 const output=TryoutWording.analyze(records,{seriesLabel:$('metric').value,tolerance:num('tolerance'),largeChangePoints:num('large'),longGapDays:num('long-gap'),staleAfterDays:num('stale'),asOf:$('asof').value});
 $('pattern').textContent=output.patternLabel;$('history').textContent=records.length?records.map(r=>typeof r.value==='number'&&Number.isFinite(r.value)&&r.value>=0?r.value:'—').join(' → '):'Belum ada hasil';$('finding').textContent=output.observation;$('student').textContent=output.student;$('parent').textContent=output.parent;$('next').textContent=output.nextStep;
 $('type-question').hidden=!output.typeQuestion;$('type-question').textContent=output.typeQuestion?'Pendalaman tambahan: '+output.typeQuestion:'';
 const notes=[...output.notes,...output.additionalQuestions];$('notes').replaceChildren();notes.forEach(note=>{const li=document.createElement('li');li.textContent=note;$('notes').append(li);});$('notes').hidden=!notes.length;
 $('parameters').textContent=JSON.stringify(output.parameters,null,2);
 const table=document.createElement('table');const head=table.createTHead().insertRow();['tryout','Tanggal','Jenis','Nilai'].forEach(label=>{const th=document.createElement('th');th.textContent=label;head.append(th);});const body=table.createTBody();records.forEach(r=>{const row=body.insertRow();[r.id,r.date||'—',r.kind||'—',Number.isFinite(r.value)&&r.value!==null?r.value:'—'].forEach(v=>{row.insertCell().textContent=v;});});$('input-table').replaceChildren(table);
}
$('scenario').addEventListener('change',()=>{$('scores').value=examples.find(e=>e.pattern===$('scenario').value).values.join(', ');render();});
document.querySelectorAll('input,select').forEach(el=>{if(el.id!=='scenario')el.addEventListener('input',render);});render();
</script></html>`;
new vm.Script(simulator.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync('Simulasi Wording SA - Tryout.html',simulator);
