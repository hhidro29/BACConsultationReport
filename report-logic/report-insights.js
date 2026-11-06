/* Shared report rules. Missing data stays null; thresholds require explicit configuration. */
const ReportInsights=(()=>{
  const finite=n=>typeof n==='number'&&Number.isFinite(n);
  function median(values){const a=values.filter(finite).sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length?(a.length%2?a[m]:(a[m-1]+a[m])/2):null;}
  function priorityOrder(a,b){return b.count-a.count||(a.median??Infinity)-(b.median??Infinity)||(a.latest??Infinity)-(b.latest??Infinity)||a.key.localeCompare(b.key);}
  function drill(priorities,rows,{accuracyMin=75,questionTarget=null}={}){
    const valid=rows.filter(r=>Number.isInteger(r.correct)&&Number.isInteger(r.total)&&r.total>0&&r.correct>=0&&r.correct<=r.total);
    const total=valid.reduce((n,r)=>n+r.total,0),correct=valid.reduce((n,r)=>n+r.correct,0);
    const covered=priorities.filter(p=>valid.some(r=>r.subtest===p.key));
    const missing=priorities.filter(p=>!covered.includes(p));
    const target=Number.isInteger(questionTarget)&&questionTarget>0?questionTarget:null;
    return {total,correct,accuracy:total?correct/total*100:null,belowAccuracy:total?correct/total*100<accuracyMin:null,covered,missing,priorityCount:priorities.length,questionTarget:target,quantityState:!total?'no_data':target===null?'unconfigured':total<target?'below_target':'met_target'};
  }
  function scoreBand(value,bounds){
    if(!finite(value)||value<0)return {id:'no_data',label:'Nilai belum tersedia'};
    if(!bounds||!finite(bounds.developing)||!finite(bounds.good)||bounds.developing<0||bounds.good<=bounds.developing)return {id:'unconfigured',label:'Kelompok nilai belum ditetapkan'};
    return value<bounds.developing?{id:'needs_work',label:'Perlu penguatan'}:value<bounds.good?{id:'developing',label:'Berkembang'}:{id:'good',label:'Baik'};
  }
  function leaderboardRecord(data,eventId,choiceId){
    const r=data?.[eventId]?.[choiceId];if(!r)return {rank:null,participants:null,highestScore:null};
    const participants=Number.isInteger(r.participants)&&r.participants>0?r.participants:null;
    const rank=Number.isInteger(r.rank)&&r.rank>0&&participants!==null&&r.rank<=participants?r.rank:null;
    const highestScore=finite(r.highestScore)&&r.highestScore>=0&&r.highestScore<=1000?r.highestScore:null;
    return {...r,rank,participants,highestScore};
  }
  return {median,priorityOrder,drill,scoreBand,leaderboardRecord};
})();
if(typeof module!=='undefined')module.exports=ReportInsights;
