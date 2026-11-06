// Data integrity checks for the browser capture and both report modes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'outputs/garuda-refresh-2026-10-22');
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const snapshot=read('garuda-snapshot.json'),drill=read('drill-summary.json'),classroom=read('classroom-summary.json');
const coverage=snapshot.coverage;
assert.equal(coverage.drillSessionsAllSubjects,114);assert.equal(coverage.drillSessionsUtbk,19);assert.equal(coverage.drillQuestionsUtbk,74);
assert.equal(drill.subjects.reduce((n,s)=>n+s.correct,0),36);
const expected={PU:[7,22,35],PPU:[7,4,18],PK:[1,2,5],PB:[2,3,6],PM:[2,5,10]};
for(const s of drill.subjects)assert.deepEqual([s.sessions,s.correct,s.total],expected[s.subtest]);
assert.deepEqual(coverage.attendance,{Hadir:35,Terlambat:1,Sakit:6,Izin:2});
assert.equal(classroom.input.sessions.length,44);
const filled=classroom.input.sessions.filter(s=>s.note.text);
assert.equal(filled.length,16);
const evidence=classroom.summary.statements.flatMap(s=>s.evidence);
assert.equal(evidence.length,16);assert.equal(new Set(evidence.map(e=>e.noteId)).size,16);
for(const e of evidence)assert.equal(e.quote,filled.find(s=>s.note.id===e.noteId)?.note.text);
for(const s of classroom.input.sessions){
 const row=snapshot.attendance.find(a=>a.id===s.id);assert(row);assert.equal(s.attendance,row.attendance);
 if(s.note.text)assert.equal(s.note.text,snapshot.notes.find(n=>n.id===s.note.id)?.text);
 assert(s.datetime.slice(0,10)>=snapshot.requestedPeriod.start&&s.datetime.slice(0,10)<=snapshot.requestedPeriod.end);
}
for(const mode of ['Guided Report','Meeting Mode']){
 const html=fs.readFileSync(path.join(root,`Consultation Brief - Garuda Mahawira Sena - ${mode}.html`),'utf8');
 for(const [i,script]of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries())new vm.Script(script[1],{filename:`${mode}:${i}`});
 const embedded=name=>JSON.parse(html.match(new RegExp(`const ${name}\\s*=\\s*([\\s\\S]*?);\\n`))[1]);
 assert.deepEqual(embedded('drillSnapshot'),drill);assert.deepEqual(embedded('classroomReport'),classroom);
 const events=embedded('toEvents'),series=embedded('series');assert.equal(events.length,4);
 for(const [i,event]of events.entries()){
  const source=snapshot.tryout.find(t=>t.name===event.name&&t.datetime.startsWith(event.date));assert(source,event.name);
  assert.equal(series.average.values[i],source.score);
  for(const [code,value]of Object.entries(source.subtests))assert.equal(series[code].values[i],value);
 }
 assert(html.includes('Data s.d. 21 Okt · diambil 22 Okt 2026'));
 assert(!html.includes('Nilai dan rekaman kelas: Student Tower, disalin 21 Okt'));
 for(const code of ['LBIN','LBI-A','LBI-S'])assert(!drill.subjects.some(s=>s.subtest===code));
 console.log(`${mode}: valid JS; embedded data matches; 4 tryout matrices match source; 16 exact note citations.`);
}
console.log('PASS: 114 drill sessions, UTBK 19 sessions / 36 correct of 74; attendance 36/44 including late; 16 teacher notes.');
