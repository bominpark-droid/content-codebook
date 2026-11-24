// 콘텐츠 코드북 — 화면 동작.
// 내용(공식 코드·사례·영상·퀴즈)은 여기 없습니다. data/ 폴더의 json 파일을 읽어 와 그립니다.
// 내용을 늘리거나 고칠 때는 data/ 만 고치면 됩니다.

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let CATS=[],CODES=[],CASES=[],VIDEOS=[],COURSE=[],SCEN=[],BORROW=[],TARGETS=[],AGES=[],DEEP=[],MOTIVES=[],TRENDS=[];
let VBY={},CBY={},VBYCODE={},RANK={};

// ---------- 내 기록 (이 기기의 브라우저 안에 저장) ----------
const S={known:{},best:null,seen:{},fav:{},marks:{},memo:{},look:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem('codebook')||'{}'))}catch(e){}
['known','seen','fav','marks','memo','look'].forEach(k=>{if(!S[k]||typeof S[k]!=='object')S[k]={}});
function save(){try{localStorage.setItem('codebook',JSON.stringify(S))}catch(e){}}

// ---------- 작은 도구 ----------
const catName=id=>(CATS.find(c=>c.id===id)||{}).name;
const TAGS={pop:['🔥','인기'],insight:['💡','인사이트'],beauty:['🎬','영상미']};
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dayNo=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const fmtDur=s=>{if(!s)return'';s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
const fmtViews=n=>!n?'':n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'억 회':n>=1e4?Math.round(n/1e4).toLocaleString('ko')+'만 회':n.toLocaleString('ko')+'회';
const vUrl=(v,t)=>v.src==='vimeo'?'https://vimeo.com/'+v.id:'https://www.youtube.com/watch?v='+v.id+(t?'&t='+t+'s':'');
const vThumb=(v,big)=>v.thumb||(v.src==='vimeo'?'':'https://i.ytimg.com/vi/'+v.id+'/'+(big?'hqdefault':'mqdefault')+'.jpg');
const badges=(v,withKind)=>`<span class="badges">${(v.tags||[]).map(t=>`<span class="bd ${t}">${TAGS[t][0]} ${TAGS[t][1]}</span>`).join('')}${withKind&&v.kind?`<span class="bd kind">${esc(v.kind)}</span>`:''}</span>`;
const metaLine=v=>[v.maker,v.year,fmtDur(v.sec),v.views?'조회수 '+fmtViews(v.views):''].filter(Boolean).map(esc).join(' · ');
function toast(msg){const old=$('.toast');if(old)old.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(x){}ta.remove();return ok}}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// 썸네일 한 칸 (영상 그림 + 길이 + 본 표시)
function thumbBox(v,big){const th=vThumb(v,big);
 return `<span class="vth${th?'':' noimg'}">${th?`<img src="${th}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">`:''}<span class="play">▶</span>${v.sec?`<span class="dur">${fmtDur(v.sec)}</span>`:''}${S.seen[v.id]?'<span class="seenmark">봄</span>':''}${S.fav[v.id]?'<span class="favmark">⭐</span>':''}</span>`}
// 가로로 긴 영상 줄 (코드 카드·사례·코스에서 씀). 누르면 앱 안에서 재생
function vidRow(v,note,small){if(!v)return'';
 return `<button type="button" class="vid${small?' sm':''}${S.seen[v.id]?' seen':''}" data-v="${v.id}">${thumbBox(v)}<span class="vtx"><b>${esc(v.title)}</b>${note?`<span>${esc(note)}</span>`:''}</span></button>`}

// ---------- 머리말 숫자 ----------
function stats(){const seen=VIDEOS.filter(v=>S.seen[v.id]).length;
 $('#seenCount').textContent=seen;$('#vidTotal').textContent=VIDEOS.length;
 $('#knownCount').textContent=CODES.filter(c=>S.known[c.id]).length;$('#totalCount').textContent=CODES.length;
 $('#bestScore').textContent=S.best==null?'—':S.best+'/10'}

// ---------- 오늘 ----------
let heroSkip=0;
const courseIds=()=>COURSE.flatMap(s=>s.ids).filter(id=>VBY[id]);
function nextUp(){const flat=courseIds();const un=flat.filter(id=>!S.seen[id]);
 let pool=un.length?un:VIDEOS.filter(v=>!S.seen[v.id]).sort((a,b)=>RANK[a.id]-RANK[b.id]).map(v=>v.id);
 if(!pool.length)pool=VIDEOS.map(v=>v.id);
 if(!pool.length)return null;
 const base=un.length?0:dayNo()%pool.length;return VBY[pool[(base+heroSkip)%pool.length]]}
function renderHome(){const v=nextUp();const flat=courseIds();const done=flat.filter(id=>S.seen[id]).length;
 if(v){const inCourse=flat.includes(v.id)&&!S.seen[v.id];
  $('#heroSlot').innerHTML=`<div class="hero"><button type="button" class="hth" data-v="${v.id}" aria-label="재생">${vThumb(v,true)?`<img src="${vThumb(v,true)}" alt="">`:''}<span class="bigplay">▶</span></button>
  <div class="hb"><div class="lab">${inCourse?`오늘의 한 편 · 코스 ${flat.indexOf(v.id)+1}번째`:'오늘의 한 편'}</div><h3>${esc(v.title)}</h3>${badges(v,true)}
  <p>${esc(v.point||Object.values(v.notes||{})[0]||'')}</p><p class="src">${metaLine(v)}</p>
  <div class="qbar"><button class="btn" type="button" data-v="${v.id}">▶ 지금 보기</button><button class="btn ghost" type="button" id="heroNext">다른 영상</button></div></div></div>`;
  $('#heroNext').onclick=()=>{heroSkip++;renderHome()};
  const c=CBY[(v.codes||[])[0]];
  $('#todayCodeSlot').innerHTML=c?`<div class="today"><div class="lab">이 영상의 공식</div><div class="t"><strong>${c.id} · ${esc(c.name)}</strong><span>${esc(c.f)}</span></div><button class="btn ghost" type="button" id="todayGo">카드 보기</button></div>`:'';
  if(c)$('#todayGo').onclick=()=>{curCat='all';$('#codeSearch').value=c.id;location.hash='#codes';chips();renderCodes()}}
 const seenN=VIDEOS.filter(x=>S.seen[x.id]).length,favN=VIDEOS.filter(x=>S.fav[x.id]).length;
 $('#statRow').innerHTML=[[`${done} / ${flat.length}`,'코스 진행'],[`${seenN} / ${VIDEOS.length}`,'본 영상'],[`${CODES.filter(c=>S.known[c.id]).length} / ${CODES.length}`,'익힌 코드'],[favN,'내 레퍼런스']].map(x=>`<div class="statbox"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
 $('#courseCount').textContent=flat.length?`${flat.length}편 가운데 ${done}편 봄`:'';
 const firstOpen=COURSE.findIndex(s=>s.ids.some(id=>VBY[id]&&!S.seen[id]));
 $('#courseSlot').innerHTML=COURSE.map((s,i)=>{const ids=s.ids.filter(id=>VBY[id]);const d=ids.filter(id=>S.seen[id]).length;
  return `<details class="stage"${i===firstOpen?' open':''}><summary><div><b>${esc(s.t)}</b><span>${esc(s.d||'')}</span></div><span class="cnt${d===ids.length?' done':''}">${d} / ${ids.length}</span></summary><div class="rows">${ids.map(id=>vidRow(VBY[id],VBY[id].point||Object.values(VBY[id].notes||{})[0]||'')).join('')}</div></details>`}).join('')}

// ---------- 영상관 ----------
let vTag='all',vKind='all';
function vidChips(){const cnt=t=>VIDEOS.filter(v=>t==='fav'?S.fav[v.id]:(v.tags||[]).includes(t)).length;
 const tags=[['all','전체 '+VIDEOS.length],['pop','🔥 인기 '+cnt('pop')],['insight','💡 인사이트 '+cnt('insight')],['beauty','🎬 영상미 '+cnt('beauty')],['fav','⭐ 내 레퍼런스 '+cnt('fav')]];
 $('#tagChips').innerHTML=tags.map(t=>`<button class="chip" type="button" data-t="${t[0]}" aria-pressed="${t[0]===vTag}">${t[1]}</button>`).join('');
 const kc={};VIDEOS.forEach(v=>{if(v.kind)kc[v.kind]=(kc[v.kind]||0)+1});
 const kinds=[['all','모든 갈래'],...Object.keys(kc).sort((a,b)=>kc[b]-kc[a]).map(k=>[k,k+' '+kc[k]])];
 $('#kindChips').innerHTML=kinds.map(k=>`<button class="chip" type="button" data-k="${esc(k[0])}" aria-pressed="${k[0]===vKind}">${esc(k[1])}</button>`).join('');
 $$('#tagChips .chip').forEach(b=>b.onclick=()=>{vTag=b.dataset.t;vidChips();renderVids()});
 $$('#kindChips .chip').forEach(b=>b.onclick=()=>{vKind=b.dataset.k;vidChips();renderVids()})}
function renderVids(){const q=$('#vidSearch').value.trim().toLowerCase(),sort=$('#vidSort').value,un=$('#vidUnseen').checked;
 let list=VIDEOS.filter(v=>(vTag==='all'||(vTag==='fav'?S.fav[v.id]:(v.tags||[]).includes(vTag)))&&(vKind==='all'||v.kind===vKind)&&(!un||!S.seen[v.id])
  &&(!q||[v.title,v.maker,v.kind,v.point,v.fact,v.year,(v.codes||[]).map(c=>c+' '+((CBY[c]||{}).name||'')).join(' ')].join(' ').toLowerCase().includes(q)));
 const by={rec:(a,b)=>RANK[a.id]-RANK[b.id],views:(a,b)=>(b.views||0)-(a.views||0),new:(a,b)=>(b.year||0)-(a.year||0),old:(a,b)=>(a.year||9999)-(b.year||9999),short:(a,b)=>(a.sec||1e9)-(b.sec||1e9)}[sort];
 list=list.slice().sort(by);
 $('#vidCount').textContent=list.length+'편';
 $('#vidGrid').innerHTML=list.length?list.map(v=>`<button type="button" class="vcard" data-v="${v.id}">${thumbBox(v)}<span class="vb">${badges(v)}<b>${esc(v.title)}</b><span class="meta">${[v.kind,v.year,v.views?fmtViews(v.views):''].filter(Boolean).map(esc).join(' · ')}</span>${v.fact?`<span class="fact">${esc(v.fact)}</span>`:''}</span></button>`).join('')
  :`<p class="lead">${vTag==='fav'?'아직 담은 영상이 없습니다. 영상을 열고 <⭐ 내 레퍼런스>를 누르면 여기에 모입니다.':'조건에 맞는 영상이 없습니다. 조건을 풀어 보세요.'}</p>`}

// ---------- 재생 화면 ----------
let YTP=null,ytReady=null,CUR=null,pushed=false;
function ytApi(){if(!ytReady)ytReady=new Promise(res=>{if(window.YT&&YT.Player)return res(true);
  const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res(true)};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytReady=null;res(false)};document.head.appendChild(s);
  setTimeout(()=>res(!!(window.YT&&YT.Player)),8000)});return ytReady}
function fallback(v,why){const th=vThumb(v,true);
 $('#pFrame').innerHTML=`<div class="fallback"${th?` style="background-image:url('${th}')"`:''}><b>${esc(why)}</b><a href="${vUrl(v)}" target="_blank" rel="noopener">▶ ${v.src==='vimeo'?'비메오':'유튜브'}에서 보기</a></div>`}
async function openPlayer(id,start){const v=VBY[id];if(!v)return;
 if(CUR)stopPlayer();CUR=v;
 $('#player').hidden=false;$('#player').scrollTop=0;document.body.style.overflow='hidden';
 if(!pushed){history.pushState({watch:id},'');pushed=true}
 $('#pOut').href=vUrl(v);$('#pOut').textContent=(v.src==='vimeo'?'비메오':'유튜브')+'에서 열기';
 renderPBody();
 if(v.src==='vimeo'){$('#pFrame').innerHTML=`<iframe src="https://player.vimeo.com/video/${v.id}?playsinline=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(v.title)}"></iframe>`;return}
 if(v.embed===false){fallback(v,'이 영상은 올린 쪽에서 다른 앱 안 재생을 막아 두었습니다.');return}
 $('#pFrame').innerHTML='<div id="ytp"></div>';
 const ok=await ytApi();if(CUR!==v)return;
 if(!ok){fallback(v,'재생기를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');return}
 YTP=new YT.Player('ytp',{videoId:v.id,width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,start:start||0},
  events:{onError:()=>{if(CUR===v){YTP=null;fallback(v,'이 영상은 앱 안에서 재생되지 않습니다.')}},
   onStateChange:e=>{if(e.data===0&&CUR===v&&!S.seen[v.id]){S.seen[v.id]=todayStr();save();renderPBody();toast('본 영상으로 표시했습니다')}}}})}
function stopPlayer(){try{if(YTP&&YTP.destroy)YTP.destroy()}catch(e){}YTP=null;$('#pFrame').innerHTML=''}
function closePlayer(fromPop){if(!CUR)return;stopPlayer();CUR=null;$('#player').hidden=true;document.body.style.overflow='';
 if(pushed&&!fromPop){pushed=false;history.back()}else pushed=false;
 refresh()}
window.addEventListener('popstate',()=>{if(CUR)closePlayer(true)});
function curTime(){try{return YTP&&YTP.getCurrentTime?Math.floor(YTP.getCurrentTime()):null}catch(e){return null}}
function seek(t){try{if(YTP&&YTP.seekTo){YTP.seekTo(t,true);YTP.playVideo();$('#player').scrollTo({top:0,behavior:'smooth'})}else window.open(vUrl(CUR,t),'_blank','noopener')}catch(e){}}
function renderPBody(){const v=CUR;if(!v)return;const marks=S.marks[v.id]||[];const lk=S.look[v.id]||[];
 const codes=(v.codes||[]).map(id=>CBY[id]).filter(Boolean);
 $('#pBody').innerHTML=`${badges(v,true)}<h2>${esc(v.title)}</h2><div class="meta">${metaLine(v)}</div>
 <div class="pact"><button class="btn sm${S.seen[v.id]?' on':''}" type="button" id="pSeen">${S.seen[v.id]?'✓ 봤어요':'봤어요 표시'}</button><button class="btn ghost sm" type="button" id="pFav">${S.fav[v.id]?'⭐ 내 레퍼런스에 있음':'☆ 내 레퍼런스에 담기'}</button></div>
 ${v.fact?`<div class="box fact"><h4>왜 뛰어난 작품인가</h4><p>${esc(v.fact)}${v.fact_src?` <a href="${esc(v.fact_src)}" target="_blank" rel="noopener">근거 보기</a>`:''}</p></div>`:''}
 ${v.point?`<div class="box"><h4>무엇을 볼까</h4><p>${esc(v.point)}</p></div>`:''}
 ${(v.look||[]).length?`<div class="box"><h4>볼 때 확인할 것</h4><ul class="look">${v.look.map((x,i)=>`<li><label><input type="checkbox" data-look="${i}"${lk[i]?' checked':''}><span>${esc(x)}</span></label></li>`).join('')}</ul></div>`:''}
 ${codes.length?`<div class="box"><h4>이 영상에 쓰인 공식</h4>${codes.map(c=>`<details class="cused"><summary><span class="code">${c.id}</span> ${esc(c.name)} <span class="catlab">${esc(catName(c.cat))}</span></summary><p class="formula">${esc(c.f)}</p>${(v.notes||{})[c.id]?`<p class="here"><b>이 영상에서 </b>${esc(v.notes[c.id])}</p>`:''}<p class="row"><b>왜</b>${esc(c.why)}</p><p class="row pro"><b>디테일</b>${esc(c.pro)}</p></details>`).join('')}</div>`:''}
 <div class="box"><h4>내 장면 메모</h4><p class="src">${v.src==='vimeo'?'눈에 띈 장면을 적어 두세요.':'보다가 눈에 띈 장면에서 단추를 누르면 그 시각이 함께 저장됩니다. 저장된 시각을 누르면 그 장면으로 바로 갑니다.'}</p>
  <div class="tools" style="margin:8px 0 0"><input type="text" id="markIn" placeholder="예) 여기서 음악이 뚝 끊긴다"><button class="btn sm" type="button" id="markAdd">📍 지금 장면 저장</button></div>
  <div class="marks">${marks.map((m,i)=>`<div class="mark">${m.t==null?'<span></span>':`<button class="t" type="button" data-seek="${m.t}">${fmtDur(m.t)||'0:00'}</button>`}<span>${esc(m.x||'')}</span><button class="x" type="button" data-del="${i}" aria-label="지우기">×</button></div>`).join('')}</div></div>
 <div class="box"><h4>내 콘텐츠에 어떻게 쓸까</h4><textarea id="pMemo" placeholder="이 영상에서 훔쳐 올 것 한 가지를 적어 보세요.">${esc(S.memo[v.id]||'')}</textarea></div>
 <div class="pact"><button class="btn ghost sm" type="button" id="pAsk">이 영상을 Claude에게 물어볼 질문 복사</button></div>
 <p class="src">${v.channel?'올린 곳: '+esc(v.channel)+(v.official===false?' (공식 채널 아님)':'')+' · ':''}${v.checked?'연결 확인한 날 '+esc(v.checked):''}</p>`;
 $('#pSeen').onclick=()=>{if(S.seen[v.id])delete S.seen[v.id];else S.seen[v.id]=todayStr();save();renderPBody()};
 $('#pFav').onclick=()=>{if(S.fav[v.id])delete S.fav[v.id];else S.fav[v.id]=todayStr();save();renderPBody()};
 $$('#pBody [data-look]').forEach(b=>b.onchange=()=>{const a=S.look[v.id]||[];a[+b.dataset.look]=b.checked;S.look[v.id]=a;save()});
 const add=()=>{const x=$('#markIn').value.trim();const t=curTime();if(!x&&t==null){toast('메모를 적어 주세요');return}
  (S.marks[v.id]=S.marks[v.id]||[]).push({t,x});S.marks[v.id].sort((a,b)=>(a.t??1e9)-(b.t??1e9));save();renderPBody();toast(t==null?'메모를 저장했습니다':fmtDur(t)+' 장면을 저장했습니다')};
 $('#markAdd').onclick=add;$('#markIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();add()}});
 $$('#pBody [data-seek]').forEach(b=>b.onclick=()=>seek(+b.dataset.seek));
 $$('#pBody [data-del]').forEach(b=>b.onclick=()=>{S.marks[v.id].splice(+b.dataset.del,1);if(!S.marks[v.id].length)delete S.marks[v.id];save();renderPBody()});
 $('#pMemo').oninput=e=>{const x=e.target.value;if(x.trim())S.memo[v.id]=x;else delete S.memo[v.id];save()};
 $('#pAsk').onclick=async()=>{const ok=await copyText(askPrompt(`다음 영상의 연출을 분석해 주세요: ${v.title} (${vUrl(v)})\n특히 첫 3초, 편집 리듬, 색과 조명, 사운드가 각각 어떤 역할을 하는지와, 내 사업의 30초 영상에 옮겨 쓸 수 있는 점 세 가지를 알려 주세요.`));toast(ok?'복사했습니다. Claude 앱에 붙여 넣으세요':'복사하지 못했습니다')}}
$('#pClose').onclick=()=>closePlayer(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CUR)closePlayer(false)});
// 어느 화면에서든 영상(data-v)을 누르면 재생 화면이 열린다
document.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b&&!b.closest('#player')){e.preventDefault();openPlayer(b.dataset.v)}});

// ---------- 공식 코드 ----------
let curCat='all';let MODE='ad';try{MODE=localStorage.getItem('cbMode')||'ad'}catch(e){}
function modeBtns(){$$('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.mode===MODE);b.onclick=()=>{MODE=b.dataset.mode;try{localStorage.setItem('cbMode',MODE)}catch(e){};modeBtns();renderCodes()}})}
function chips(){$('#catChips').innerHTML=CATS.map(c=>`<button class="chip" type="button" data-c="${c.id}" aria-pressed="${c.id===curCat}">${c.name}</button>`).join('');
 $$('#catChips .chip').forEach(b=>b.onclick=()=>{curCat=b.dataset.c;chips();renderCodes()})}
function codeVids(c){const list=(VBYCODE[c.id]||[]).slice().sort((a,b)=>(((b.notes||{})[c.id]?1:0)-((a.notes||{})[c.id]?1:0))||RANK[a.id]-RANK[b.id]);
 if(!list.length)return'';const row=v=>vidRow(v,(v.notes||{})[c.id]||v.point||'');const head=list.slice(0,2),rest=list.slice(2);
 return `<div class="vids"><span class="vlab">실제 작품 보기 · ${list.length}편</span>${head.map(row).join('')}${rest.length?`<details><summary class="more" style="display:inline-block">+ ${rest.length}편 더 보기</summary><div class="vids" style="margin-top:8px">${rest.map(row).join('')}</div></details>`:''}</div>`}
function renderCodes(){const q=$('#codeSearch').value.trim();
 const list=CODES.filter(c=>(curCat==='all'||c.cat===curCat)&&(!q||[c.id,c.name,c.f,c.why,c.pro,c.kid,c.ad,catName(c.cat)].join(' ').includes(q)));
 $('#codeGrid').innerHTML=list.length?list.map(c=>`<article class="card"><div class="top"><span class="code">${c.id}</span><span class="catlab">${catName(c.cat)}</span></div>
 <h3>${esc(c.name)}</h3>${vizFor(c.viz,null,MODE==='ad'?c.ad:c.kid)}<p class="formula">${esc(c.f)}</p><p class="row"><b>왜</b>${esc(c.why)}</p><p class="row pro"><b>디테일</b>${esc(c.pro)}</p><p class="row kid"><b>${MODE==='ad'?'2040 예':'어린이 예'}</b>${esc(MODE==='ad'?c.ad:c.kid)}</p>
 ${codeVids(c)}
 <div class="cardfoot"><button class="known" type="button" data-id="${c.id}" aria-pressed="${!!S.known[c.id]}">${S.known[c.id]?'익혔어요':'익힘 표시'}</button></div></article>`).join(''):'<p class="lead">검색 결과가 없습니다. 다른 단어로 찾아 보세요.</p>';
 $$('#codeGrid .known').forEach(b=>b.onclick=()=>{S.known[b.dataset.id]=!S.known[b.dataset.id];save();stats();renderCodes()})}
$('#codeSearch').addEventListener('input',renderCodes);

// ---------- 레전드 사례 ----------
function renderCases(){$('#caseGrid').innerHTML=CASES.map(c=>`<article class="card"><div class="catlab">${c.g?'<span class="tag">2040</span>':''}${esc(c.y)}</div><h3>${esc(c.t)}</h3>
 <p class="row"><b>무엇</b>${esc(c.what)}</p><p class="row"><b>왜</b>${esc(c.why)}</p><p class="row pro"><b>훔칠 것</b>${esc(c.steal)}</p>
 <div>${c.codes.map(id=>`<span class="tag">${id}</span>`).join('')}</div>${c.vid&&VBY[c.vid]?vidRow(VBY[c.vid],'',true):''}</article>`).join('')}

// ---------- 차용 연습 ----------
function renderBorrow(){$('#borrowBody').innerHTML=BORROW.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('');
 const sel=$('#targetSel');if(sel.options.length<=1)TARGETS.forEach(t=>{const o=document.createElement('option');o.textContent=t;sel.appendChild(o)})}
function gen(){const b=BORROW[Math.floor(Math.random()*BORROW.length)];const sel=$('#targetSel').value;const t=sel==='any'?TARGETS[Math.floor(Math.random()*TARGETS.length)]:sel;
 const c=CODES[Math.floor(Math.random()*CODES.length)];
 $('#mission').textContent=`<${b[0]}>의 <${b[1]}>을(를) 가져와 <${t}> 30초 기획안 만들기. 보조 코드: ${c.id} ${c.name}`;
 $('#missionQs').innerHTML=[`${b[0]}에서 이 장치가 사람을 붙잡는 진짜 이유는 무엇인가? (힌트: ${b[2]})`,`${t}에서 그 이유를 만족시키는 장면 하나를 첫 3초용으로 적는다.`,`보조 코드 <${c.name}>을(를) 어디에 쓸지 한 줄로 적는다.`,`완성한 기획을 AI로 만들고, 시청 지속 그래프에서 이탈 지점을 확인한다.`].map(x=>`<li>${esc(x)}</li>`).join('')}
$('#genBtn').onclick=gen;$('#targetSel').onchange=gen;

// ---------- 연령대 지도 · 트렌드 ----------
function renderAges(){$('#ageBody').innerHTML=AGES.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}
function renderDeep(){$('#deepBody').innerHTML=DEEP.map(r=>`<tr>${r.map((x,i)=>`<td>${i?esc(x):'<b>'+esc(x)+'</b>'}</td>`).join('')}</tr>`).join('');$('#motiveGrid').innerHTML=MOTIVES.map(m=>`<article class="card"><h3>${esc(m[0])}</h3><p class="row">${esc(m[1])}</p><p class="row kid"><b>카피 예</b>${esc(m[2])}</p></article>`).join('')}
function renderTrends(){$('#trendGrid').innerHTML=TRENDS.map(t=>`<article class="card"><h3>${esc(t.t)}</h3><p class="row">${esc(t.d)}</p><p class="src">근거: ${esc(t.lv)}${t.src?` · <a href="${t.src[1]}" target="_blank" rel="noopener">${esc(t.src[0])}</a>`:''}</p></article>`).join('')}

// ---------- 퀴즈 ----------
let QZ=null;
function drillQs(){return shuffle(CODES).slice(0,10).map(c=>{const others=shuffle(CODES.filter(x=>x.id!==c.id)).slice(0,3);const opts=shuffle([c,...others]);
 return{q:`다음 공식의 이름은? <${c.f}>`,o:opts.map(x=>x.id+' '+x.name),a:opts.indexOf(c),e:`${c.id} ${c.name}. ${c.why}`}})}
function startQuiz(kind){const qs=kind==='drill'?drillQs():shuffle(SCEN).slice(0,10).map(q=>{const idx=shuffle([0,1,2,3]);return{q:q.q,o:idx.map(i=>q.o[i]),a:idx.indexOf(q.a),e:q.e}});
 QZ={kind,qs,i:0,score:0,wrong:[],answered:false};drawQ()}
function drawQ(){const z=QZ;if(!z){$('#quizBox').innerHTML='<p class="qtext" style="margin-top:0">퀴즈를 골라 시작하세요.</p><p class="note">상황 퀴즈 '+SCEN.length+'문제와 코드 드릴(공식 '+CODES.length+'개에서 무작위)이 있습니다.</p>';return}
 if(z.i>=z.qs.length){if(z.kind==='scenario'&&(S.best==null||z.score>S.best)){S.best=z.score;save();stats()}
  $('#quizBox').innerHTML=`<div class="qmeta"><span>결과</span><span>${z.kind==='drill'?'코드 드릴':'상황 퀴즈'}</span></div><p class="qtext">${z.score} / ${z.qs.length}</p>${z.wrong.length?'<p class="catlab">다시 볼 문제</p>'+z.wrong.map(w=>`<div class="fb"><strong>${esc(w.q)}</strong>${esc(w.e)}</div>`).join(''):'<p>모두 맞혔습니다.</p>'}<div class="qbar"><button class="btn" type="button" id="again">다시 하기</button></div>`;
  $('#again').onclick=()=>startQuiz(z.kind);return}
 const q=z.qs[z.i];
 $('#quizBox').innerHTML=`<div class="qmeta"><span>${z.i+1} / ${z.qs.length}</span><span>맞힘 ${z.score}</span></div><div class="progress"><i style="width:${z.i/z.qs.length*100}%"></i></div>
 <p class="qtext">${esc(q.q)}</p><div class="opts">${q.o.map((o,i)=>`<button class="opt" type="button" data-i="${i}">${esc(o)}</button>`).join('')}</div><div id="fbSlot"></div>`;
 $$('#quizBox .opt').forEach(b=>b.onclick=()=>{if(z.answered)return;z.answered=true;const i=+b.dataset.i;const ok=i===q.a;if(ok)z.score++;else z.wrong.push(q);
  $$('#quizBox .opt').forEach(x=>{x.disabled=true;if(+x.dataset.i===q.a)x.classList.add('right');else if(+x.dataset.i===i)x.classList.add('wrong')});
  $('#fbSlot').innerHTML=`<div class="fb"><strong>${ok?'맞았습니다.':'아쉽습니다.'}</strong>${esc(q.e)}</div><div class="qbar"><button class="btn" type="button" id="nextQ">${z.i+1<z.qs.length?'다음 문제':'결과 보기'}</button></div>`;
  $('#nextQ').onclick=()=>{z.i++;z.answered=false;drawQ()};$('#nextQ').focus()})}
$('#startScenario').onclick=()=>startQuiz('scenario');$('#startDrill').onclick=()=>startQuiz('drill');

// ---------- 질문하기 (앱이 AI를 부르지 않는다. 질문문을 만들어 복사해 준다) ----------
function askPrompt(q){return `당신은 광고·영상 연출과 콘텐츠 마케팅 전문가입니다. 질문자는 20~40대 대상 오디오북·전자책·출판 사업을 하고, 음악 전문가이며, 영상 제작은 입문자입니다. 한국어로 쉽게 답하세요.
규칙: 실제 사례를 들 때는 확실한 것만 쓰고, 모르면 모른다고 쓰세요. 영상 주소는 직접 확인한 것만 적고, 확인하지 못했으면 작품 이름만 적으세요. 「」 대신 < >를 쓰세요. 마지막 줄에 한 줄 요약을 쓰세요.
질문: ${q}`}
function lessonPrompt(field){const seen=CASES.map(c=>c.t).concat(VIDEOS.map(v=>v.title)).join(', ');
 return `당신은 광고·영상 연출 교육자입니다. 한국어로, 콘텐츠 기획자가 안목을 키울 수 있는 레슨 1개를 만드세요.
분야: ${field==='any'?'광고, 쇼츠, 영화 예고편, 뮤직비디오, 브랜드 캠페인, 게임 트레일러 중 하나를 골라':field}.
조건: 실제로 널리 알려진, 완성도와 작품성이 뛰어난 작품이나 캠페인 1개를 사례로 고르세요. 사실이 확실하지 않은 부분은 쓰지 마세요. 다음은 이미 다뤘으니 피하세요: ${seen}.
사례에서 다른 분야에도 옮겨 쓸 수 있는 원리 하나를 뽑고, 20~40대 대상 오디오북·전자책·출판 사업과 어린이 교육 콘텐츠에 각각 대입한 예를 쓰세요.
다음 순서로 답하세요: 레슨 제목 / 작품명과 연도 / 무엇을 했나 / 왜 통했나 / 옮겨 쓸 공식 한 문장 / 전문가만 보는 디테일 / 2040 대입 예 / 어린이 대입 예 / 상황 퀴즈 1문제와 해설.
웹 검색을 쓸 수 있으면 그 작품의 공식 유튜브 영상 주소를 찾아 실제로 열리는지 확인한 뒤 적고, 확인하지 못했으면 주소를 적지 마세요. 「」 대신 < >를 쓰세요.`}
$('#askCopy').onclick=async()=>{const q=$('#askIn').value.trim();if(!q){toast('궁금한 것을 먼저 적어 주세요');$('#askIn').focus();return}
 const ok=await copyText(askPrompt(q));toast(ok?'복사했습니다. <Claude 열기>를 눌러 붙여 넣으세요':'복사하지 못했습니다')};
$('#labCopy').onclick=async()=>{const ok=await copyText(lessonPrompt($('#labField').value));toast(ok?'복사했습니다. Claude 앱에 붙여 넣으세요':'복사하지 못했습니다')};
$$('.askchip').forEach(b=>b.onclick=()=>{$('#askIn').value=b.textContent;$('#askIn').focus()});

// ---------- 화면 바꾸기 ----------
const VIEWS=['home','vids','codes','cases','borrow','ages','trends','quiz','lab'];
function route(){const h=(location.hash||'#home').slice(1);const v=VIEWS.includes(h)?h:'home';
 VIEWS.forEach(x=>{$('#v-'+x).hidden=x!==v});$$('nav.tabs a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+v?'page':'false'));
 $('header.mast').classList.toggle('compact',v!=='home');
 const cur=$('nav.tabs a[aria-current="page"]');if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:'nearest',inline:'center'})}
window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0)});
// 기록이 바뀐 뒤 화면을 다시 그린다 (본 표시·별표가 카드에 반영되게)
function refresh(){stats();renderHome();vidChips();renderVids();renderCodes();renderCases()}

// ---------- 시작: data/ 폴더를 읽어 온다 ----------
async function load(){const names=['codes','cases','videos','course','quiz','maps','trends'];
 const get=n=>fetch('data/'+n+'.json').then(r=>{if(!r.ok)throw new Error(n+'.json');return r.json()});
 const [codes,cases,videos,course,quiz,maps,trends]=await Promise.all(names.map(get));
 CATS=codes.cats;CODES=codes.codes;CASES=cases;VIDEOS=videos;COURSE=course;SCEN=quiz;TRENDS=trends;
 BORROW=maps.borrow;TARGETS=maps.targets;AGES=maps.ages;DEEP=maps.deep;MOTIVES=maps.motives;
 CODES.forEach(c=>CBY[c.id]=c);VIDEOS.forEach(v=>{VBY[v.id]=v;(v.codes||[]).forEach(c=>(VBYCODE[c]=VBYCODE[c]||[]).push(v))});
 // 추천순: 코스에 든 영상이 코스 순서대로 먼저, 나머지는 딱지 수·조회수로
 const flat=course.flatMap(s=>s.ids);const score=v=>(v.tags||[]).length*3+(v.fact?2:0)+(v.look&&v.look.length?1:0)+Math.log10((v.views||0)+10)/3;
 VIDEOS.slice().sort((a,b)=>score(b)-score(a)).forEach((v,i)=>RANK[v.id]=1000+i);flat.forEach((id,i)=>{if(VBY[id])RANK[id]=i});
 const last=VIDEOS.map(v=>v.checked||'').sort().pop();if(last)$('#checkedNote').textContent='영상 연결을 마지막으로 확인한 날: '+last+'.'}
load().then(()=>{$('#loadMsg').remove();chips();modeBtns();vidChips();renderVids();renderCodes();renderCases();renderBorrow();renderAges();renderDeep();renderTrends();gen();drawQ();renderHome();stats();route();
 $('#vidSearch').addEventListener('input',renderVids);$('#vidSort').onchange=renderVids;$('#vidUnseen').onchange=renderVids})
 .catch(e=>{$('#loadMsg').textContent='내용을 불러오지 못했습니다 ('+e.message+'). 인터넷 연결을 확인하고 다시 열어 주세요.'});
