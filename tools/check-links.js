#!/usr/bin/env node
// 영상 연결 점검 도구.
// data/videos.json 의 영상을 하나씩 유튜브·비메오에 물어서
//   ① 아직 살아 있는지  ② 앱 안에서 재생이 되는지  를 확인합니다.
//
// 쓰는 법 (저장소 폴더에서):
//   node tools/check-links.js            확인만 하고 결과를 보여 줍니다
//   node tools/check-links.js --write    확인한 날짜·조회수·길이를 videos.json 에 적습니다
//   node tools/check-links.js --id XXXX  영상 하나만 확인합니다 (새 영상을 넣기 전에)
//   node tools/check-links.js --search "검색어"   유튜브에서 영상 ID 를 찾습니다
//
// 문제가 하나라도 있으면 끝날 때 0 이 아닌 값으로 끝납니다 (자동 점검이 알아차리게).
// 영상을 내려받지 않습니다. 공개된 정보만 읽습니다.

const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'..','data','videos.json');
const H={'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36','accept-language':'ko,en;q=0.8'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// 유튜브 페이지 안에 들어 있는 정보 덩어리(JSON)를 꺼낸다
function grab(html,marker){const i=html.indexOf(marker);if(i<0)return null;let s=html.indexOf('{',i),d=0,q=false,e=false;
 for(let j=s;j<html.length;j++){const c=html[j];if(q){if(e)e=false;else if(c==='\\')e=true;else if(c==='"')q=false}else if(c==='"')q=true;else if(c==='{')d++;else if(c==='}'){d--;if(!d){try{return JSON.parse(html.slice(s,j+1))}catch(x){return null}}}}return null}

async function info(id){const o={id};
 try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id));o.oembed=r.status;if(r.status===200){const j=await r.json();o.title=j.title;o.channel=j.author_name}}catch(e){o.oembed='ERR'}
 try{const h=await (await fetch('https://www.youtube.com/watch?v='+id,{headers:H})).text();const p=grab(h,'ytInitialPlayerResponse');
  if(p){const ps=p.playabilityStatus||{},vd=p.videoDetails||{},mf=(p.microformat||{}).playerMicroformatRenderer||{};
   o.status=ps.status;o.reason=ps.reason;o.embed=ps.playableInEmbed===true;o.sec=+vd.lengthSeconds||0;o.views=+vd.viewCount||0;o.title=o.title||vd.title;o.channel=o.channel||vd.author;o.date=(mf.publishDate||'').slice(0,10)}}catch(e){o.status='ERR'}
 return o}
// 유튜브가 잠깐 막을 때가 있어서, 애매하면 쉬었다가 다시 묻는다
async function infoSure(id){let o=await info(id);
 for(let k=0;k<3&&!(o.status==='OK'&&o.oembed===200)&&!/비공개|볼 수 없|unavailable|private/i.test(o.reason||'');k++){await sleep(4000*(k+1));o=await info(id)}
 return o}
async function vimeo(id){try{const r=await fetch('https://vimeo.com/api/oembed.json?url=https://vimeo.com/'+id);if(r.status!==200)return{id,status:'DEAD'};const j=await r.json();return{id,status:'OK',embed:true,title:j.title,channel:j.author_name,sec:j.duration,thumb:j.thumbnail_url}}catch(e){return{id,status:'ERR'}}}
async function search(q){const h=await (await fetch('https://www.youtube.com/results?search_query='+encodeURIComponent(q),{headers:H})).text();const d=grab(h,'ytInitialData');const out=[];
 (function walk(x){if(!x||typeof x!=='object')return;if(x.videoRenderer){const v=x.videoRenderer;out.push([v.videoId,(v.lengthText||{}).simpleText||'',(v.viewCountText||{}).simpleText||'',((v.ownerBadges||[]).length?'✔':'')+(((v.ownerText||{}).runs||[{}])[0].text||''),(v.title.runs||[]).map(r=>r.text).join('')].join(' | '));return}for(const k in x)walk(x[k])})(d);return out.slice(0,12)}

// 결과를 한 낱말로: 정상 / 앱 밖 재생만 / 죽음 / 확인 못 함
function verdict(o){if(o.status==='OK')return o.embed?'정상':'앱 밖 재생만';
 if(/비공개|볼 수 없|unavailable|private/i.test(o.reason||'')||o.oembed===404||o.status==='DEAD')return'죽음';
 return'확인 못 함'}

(async()=>{const a=process.argv.slice(2);
 if(a[0]==='--search'){(await search(a.slice(1).join(' '))).forEach(x=>console.log(x));return}
 if(a[0]==='--id'){for(const id of a.slice(1)){const o=/^\d+$/.test(id)?await vimeo(id):await infoSure(id);console.log(verdict(o),JSON.stringify(o))}return}
 const WRITE=a.includes('--write');const vids=JSON.parse(fs.readFileSync(FILE,'utf8'));const today=new Date().toISOString().slice(0,10);
 const bad=[];let n=0;
 for(const v of vids){n++;const o=v.src==='vimeo'?await vimeo(v.id):await infoSure(v.id);const r=verdict(o);
  if(r==='정상'||(r==='앱 밖 재생만'&&v.embed===false)){if(WRITE){v.checked=today;if(o.sec)v.sec=o.sec;if(o.views)v.views=o.views;if(o.channel)v.channel=o.channel;if(o.thumb)v.thumb=o.thumb}}
  else{bad.push([r,v.id,v.title]);if(WRITE&&r==='앱 밖 재생만')v.embed=false}
  if(n%10===0){process.stdout.write(`${n}/${vids.length} 확인…\n`);await sleep(600)}}
 if(WRITE)fs.writeFileSync(FILE,JSON.stringify(vids,null,1)+'\n');
 console.log(`\n영상 ${vids.length}편 가운데 문제 ${bad.length}편`);
 bad.forEach(b=>console.log(` · [${b[0]}] ${b[2]}  →  https://www.youtube.com/watch?v=${b[1]}`));
 if(bad.some(b=>b[0]!=='확인 못 함'))process.exitCode=1;else if(bad.length)console.log('「확인 못 함」은 유튜브가 잠깐 막은 것일 수 있습니다. 조금 뒤에 다시 돌려 보세요.')})();
