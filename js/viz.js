// 원리 도식(그림)을 그리는 코드. 내용 데이터가 아니라 그림 도구라서 js 에 둔다.
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const W=320,H=150;
const sv=(inner,label)=>`<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label||'도식'}">${inner}</svg>`;
const T=(x,y,s,cls,anchor)=>`<text x="${x}" y="${y}" class="${cls||'vt'}" text-anchor="${anchor||'middle'}">${s}</text>`;
const R=(x,y,w,h,cls,rx)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx==null?4:rx}" class="${cls}"/>`;
const C=(x,y,r,cls)=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
const L=(x1,y1,x2,y2,cls)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls||'vs'}"/>`;
const P=(d,cls)=>`<path d="${d}" class="${cls||'vs'}"/>`;
const ARW='<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="fa"/></marker></defs>';
const A=(x1,y1,x2,y2,cls)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls||'va'}" marker-end="url(#ah)"/>`;
function face(x,y,r,mood,cls){const e=r*.28;let m='';if(mood==='wow')m=C(x,y+r*.38,r*.18,'fi');else if(mood==='sad')m=P(`M${x-r*.3},${y+r*.5} Q${x},${y+r*.25} ${x+r*.3},${y+r*.5}`,'vsi');else m=P(`M${x-r*.3},${y+r*.3} Q${x},${y+r*.6} ${x+r*.3},${y+r*.3}`,'vsi');
 return C(x,y,r,cls||'fam')+C(x-e,y-r*.15,r*.11,'fi')+C(x+e,y-r*.15,r*.11,'fi')+m}
function thumbFrame(inner,x,y,w,h,dark){return R(x||40,y||12,w||240,h||126,dark?'fdk':'fpp',6)+inner}
const VIZ={
 timeline:()=>sv(R(20,60,70,30,'fac')+T(55,80,'결과','vtw')+R(92,60,210,30,'fln')+T(197,80,'과정 (어떻게 됐을까?)')+L(20,100,90,100,'vsa')+T(55,116,'0~3초','vts')+T(160,40,'결과를 먼저, 이유는 뒤로','vtb'),'결과 먼저 타임라인'),
 interrupt:()=>sv(P('M20,95 L70,95 L80,30 L92,120 L104,60 L112,95 L300,95','vsa')+T(86,22,'0초: 예상 깨기','vtb')+T(220,85,'평범한 흐름이었다면 넘김','vts'),'패턴 인터럽트'),
 gap:()=>sv(R(30,50,170,26,'fac')+T(115,68,'아는 것','vtw')+R(200,50,30,26,'fdash')+T(215,96,'빈칸','vtb')+R(230,50,60,26,'fln')+T(160,30,'거의 알 것 같은 만큼만 비우기','vt')+T(160,128,'빈칸이 크면 포기, 없으면 안 궁금','vts'),'호기심 갭'),
 target:()=>sv(C(160,75,55,'fln')+C(160,75,36,'fpp')+C(160,75,18,'fac')+T(160,79,'1명','vtw')+T(60,30,'모두에게','vts')+T(160,145,'한 사람에게 말할수록 멈춘다','vts'),'타깃 좁히기'),
 scale:()=>sv(R(80,30,60,90,'fam')+T(110,138,'잃는 것','vts')+R(180,65,60,55,'fac')+T(210,138,'얻는 것','vts')+T(110,24,'더 크게 느낌','vtb'),'손실 회피'),
 three:()=>sv(R(30,70,70,50,'fln')+T(65,100,'1')+R(110,60,80,60,'fln')+T(150,95,'2')+R(200,35,95,85,'fac')+T(247,85,'3 · 가장 강하게','vtw')+T(160,24,'약속한 숫자, 마지막이 정점','vts'),'숫자 약속'),
 jcut:()=>sv(T(28,48,'화면','vts','start')+R(70,36,120,22,'fln')+T(130,51,'장면 A')+R(190,36,110,22,'fln')+T(245,51,'장면 B')+T(28,98,'소리','vts','start')+R(70,86,90,22,'fln')+T(115,101,'A 소리')+R(160,86,140,22,'fac')+T(230,101,'B 소리가 먼저','vtw')+L(190,28,190,120,'vsd')+T(160,138,'소리가 화면보다 먼저 들어오는 J컷','vts'),'J컷'),
 storyline:()=>sv(R(10,55,80,40,'fln')+T(50,79,'상황')+T(110,70,'그런데','vtb')+A(92,80,128,80)+R(130,55,80,40,'fln')+T(170,79,'갈등')+T(230,70,'그래서','vtb')+A(212,80,238,80)+R(240,55,70,40,'fac')+T(275,79,'결과','vtw')+T(160,130,'<그리고>로 이어지면 지루한 장면','vts'),'그런데 그래서'),
 spine:()=>{let s='';const st=['옛날에','매일','어느 날','그 때문에','그 때문에','마침내','그 뒤로'];st.forEach((t,i)=>{const x=8+i*44;s+=R(x,55,40,40,i===2||i===5?'fac':'fln')+T(x+20,79,t,i===2||i===5?'vtw2':'vt2')});return sv(s+T(160,128,'7칸을 먼저 채우면 1분짜리도 이야기가 된다','vts'),'스토리 스파인')},
 pas:()=>sv(P('M20,40 Q80,40 110,95 Q140,135 170,110 Q230,60 300,30','vsa')+T(40,30,'문제','vtb')+T(130,140,'더 아프게','vtb')+T(285,22,'해결','vtb'),'PAS 곡선'),
 setup:()=>sv(L(20,100,300,100,'vs')+C(60,100,8,'fam')+T(60,125,'심기','vtb')+C(270,100,8,'fac')+T(270,125,'회수 <아!>','vtb')+P('M60,90 Q165,10 270,90','vsd')+T(165,40,'자연스럽게 지나가야 예측 안 됨','vts'),'떡밥과 회수'),
 loop:()=>sv(P('M110,75 A50,50 0 1 1 210,75','vsa')+P('M210,75 A50,50 0 1 1 110,75','vsd')+T(110,80,'처음','vtb')+T(210,80,'끝','vtb')+T(160,140,'끝 문장이 첫 문장 앞부분이 되게','vts'),'루프 엔딩'),
 trailer:()=>{let s=R(10,90,70,20,'fln')+T(45,104,'1막 세계','vt2');for(let i=0;i<6;i++)s+=R(86+i*20,90-i*10,16,20+i*10,'fln');s+=T(140,140,'2막 고조 몽타주','vts')+R(212,40,55,70,'fdk')+T(239,79,'제목','vtw')+R(272,70,40,40,'fac')+T(292,94,'버튼','vtw');return sv(s,'트레일러 구조')},
 peak:()=>sv(P('M20,110 L70,90 L110,100 L160,30 L200,95 L250,85 L300,60','vsa')+C(160,30,7,'fam')+T(160,20,'정점','vtb')+C(300,60,7,'fac')+T(290,50,'끝','vtb','end')+T(100,135,'중간보다 정점과 끝이 기억된다','vts'),'피크 엔드'),
 face:()=>sv(thumbFrame(face(110,75,40,'wow')+R(170,40,90,26,'fam',3)+T(215,58,'세 단어','vtw')+R(175,80,70,40,'fpp',3)+T(210,104,'대상','vt2'),40,12,240,126,true)+T(160,146,'요소 3개: 얼굴 · 대상 · 짧은 글자','vts'),'썸네일 3요소'),
 gaze:()=>sv(thumbFrame(face(90,75,36,'wow')+A(125,68,190,68,'vaw')+R(195,40,70,60,'fam',4)+T(230,75,'핵심','vtw'),40,12,240,126,true)+T(160,146,'시선이 화살표가 된다','vts'),'시선 유도'),
 title:()=>sv(thumbFrame(face(100,55,28,'wow')+R(150,35,100,26,'fam',3)+T(200,53,'이게 된다고?','vtw'),40,6,240,90,true)+R(40,104,240,14,'fln',2)+T(45,115,'제목: 정보 · 숫자 · 대상','vt2','start')+R(40,122,150,10,'fln',2)+T(160,146,'썸네일은 감정, 제목은 정보','vts'),'썸네일과 제목'),
 blur:()=>sv(thumbFrame(R(70,35,80,80,'fpp',4)+R(150,35,80,80,'fdash',4)+T(190,85,'?','vtqw')+face(255,100,16,'wow'),40,12,240,126,true)+T(160,146,'결과 직전, 가림은 하나만','vts'),'결과 직전'),
 small:()=>sv(thumbFrame(face(95,65,30,'wow')+R(140,45,110,30,'fam',3)+T(195,65,'큰 글자','vtw'),20,20,180,110,true)+R(220,70,64,36,'fdk',3)+C(238,88,9,'fam')+R(250,82,28,10,'fam',2)+T(252,124,'실제 피드 크기','vts')+T(160,146,'작게 줄여도 읽히는가','vts'),'작은 화면 테스트'),
 contrast:()=>sv(R(40,12,240,126,'',6).replace('class=""','style="fill:#141b3a"')+`<text x="160" y="72" text-anchor="middle" style="font:900 34px var(--display);fill:#f6e72b">핵심어</text><text x="160" y="104" text-anchor="middle" style="font:500 14px var(--body);fill:#ffffff">흰 글자 보조 문구</text>`+T(160,146,'어두운 배경 + 강조색 1 + 흰색','vts'),'고대비 3색'),
 split:()=>sv(R(40,12,120,126,'fln',6)+T(100,70,'전','vtb')+T(100,92,'쌓인 안 읽은 책','vts')+R(160,12,120,126,'fac',6)+T(220,70,'후','vtw')+T(220,92,'완독 목록','vtw2')+L(160,12,160,138,'vsw'),'비포 애프터'),
 palette:(p)=>{const cs=p.c,ls=p.l||[];let s='';const w=280/cs.length;cs.forEach((c,i)=>{s+=`<rect x="${20+i*w}" y="28" width="${w-6}" height="74" rx="5" style="fill:${c}"/>`+T(20+i*w+(w-6)/2,120,ls[i]||c,'vts')});return sv(s+(p.cap?T(160,18,p.cap,'vtb'):''),'팔레트')},
 ratio:()=>sv(`<rect x="20" y="45" width="168" height="50" rx="4" style="fill:#f1ede4"/><rect x="188" y="45" width="84" height="50" style="fill:#243a6b"/><rect x="272" y="45" width="28" height="50" rx="4" style="fill:#e0a526"/>`+T(104,75,'60 주조색','vt')+`<text x="230" y="75" text-anchor="middle" style="font:500 12px var(--body);fill:#fff">30 보조</text>`+T(286,118,'10 강조','vtb')+T(160,30,'강조색은 시선 보낼 곳에만','vts'),'60 30 10'),
 sat:()=>sv(['#ff3b30','#ffcc00','#34c759','#007aff'].map((c,i)=>`<rect x="${20+i*34}" y="35" width="30" height="60" rx="4" style="fill:${c}"/>`).join('')+['#b9776e','#c7b27a','#83a08a','#6f86a6'].map((c,i)=>`<rect x="${174+i*34}" y="35" width="30" height="60" rx="4" style="fill:${c}"/>`).join('')+T(85,115,'고채도: 어리고 신나게','vts')+T(240,115,'저채도: 성숙하고 고급스럽게','vts'),'채도와 나이'),
 temp:()=>sv(`<defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset=".5" stop-color="#f3ede2"/><stop offset="1" stop-color="#3c7bd6"/></linearGradient></defs><rect x="20" y="40" width="280" height="44" rx="6" fill="url(#tg)"/>`+T(40,105,'따뜻함: 친밀 · 향수 · 휴식','vts','start')+T(300,105,'차가움: 긴장 · 미래 · 집중','vts','end')+T(160,28,'색온도로 감정 전환을 말 없이','vtb'),'색온도'),
 value:()=>sv(`<rect x="30" y="30" width="120" height="70" rx="5" style="fill:#ffffff;stroke:#ccc"/><text x="90" y="72" text-anchor="middle" style="font:700 18px var(--body);fill:#f2d22e">노란 글자</text><rect x="170" y="30" width="120" height="70" rx="5" style="fill:#1d2a55"/><text x="230" y="72" text-anchor="middle" style="font:700 18px var(--body);fill:#f2d22e">노란 글자</text>`+T(90,120,'밝기가 비슷 → 안 읽힘','vts')+T(230,120,'밝기 차이 큼 → 읽힘','vts'),'명도 대비'),
 light3:()=>sv(C(160,70,16,'fln')+T(160,74,'인물','vt2')+R(150,118,20,14,'fdk',2)+T(160,146,'카메라','vts')+C(80,110,9,'fam')+T(80,135,'키(주광)','vts')+A(88,104,146,80,'vsa')+C(250,110,9,'fac')+T(250,135,'필(보조)','vts')+A(242,104,174,80,'vsd')+C(200,18,9,'fam')+T(240,20,'백(역광)','vts')+A(194,24,170,56,'vsa'),'3점 조명'),
 key:()=>sv(R(20,15,135,105,'fpp',6)+face(87,65,26,'smile','fln')+T(87,138,'하이키: 밝고 가볍게','vts')+R(165,15,135,105,'fdk',6)+`<path d="M232,39 a26,26 0 0,0 0,52 z" class="fam"/>`+T(232,138,'로우키: 어둡고 긴장','vts'),'하이키 로우키'),
 rembrandt:()=>sv(`<ellipse cx="160" cy="72" rx="42" ry="54" class="fln"/><path d="M160,18 a42,54 0 0,1 0,108 z" style="fill:#2a2f38"/><path d="M168,70 L188,70 L172,92 z" class="fam"/>`+T(160,140,'그늘진 뺨의 빛 삼각형','vts')+A(70,40,118,60,'vsa')+T(60,32,'45도 위 주광','vts'),'렘브란트 조명'),
 rim:()=>sv(R(40,12,240,126,'fdk',6)+`<ellipse cx="160" cy="70" rx="30" ry="36" style="fill:#0c0e12;stroke:#ffd27a;stroke-width:3"/><path d="M110,138 Q160,95 210,138 z" style="fill:#0c0e12;stroke:#ffd27a;stroke-width:3"/>`+T(160,30,'뒤에서 빛 → 윤곽선','vtw'),'림라이트'),
 angle:()=>sv(R(150,40,20,70,'fln',8)+C(160,32,10,'fln')+R(40,110,22,14,'fdk',2)+A(60,112,148,50,'vsa')+T(50,138,'로우앵글: 강하게','vts')+R(258,20,22,14,'fdk',2)+A(258,30,172,70,'vsd')+T(270,52,'하이앵글: 작고 귀엽게','vts'),'앵글'),
 symm:()=>sv(R(20,20,130,90,'fpp',4)+L(85,20,85,110,'vsd')+R(70,45,30,50,'fac',3)+T(85,128,'대칭: 연출된 세계','vts')+R(170,20,130,90,'fpp',4)+L(213,20,213,110,'vsd')+L(257,20,257,110,'vsd')+L(170,50,300,50,'vsd')+L(170,80,300,80,'vsd')+C(257,50,10,'fac')+T(235,128,'3분할: 자연스러운 현실','vts'),'대칭과 3분할'),
 beat:()=>{let s='';for(let i=0;i<28;i++){const h=i%4===0?60:20+((i*37)%25);s+=R(14+i*10.5,90-h/2,6,h,i%4===0?'fac':'fln',2)}for(let i=0;i<7;i++)s+=L(14+i*42+3,20,14+i*42+3,130,'vsd');return sv(s+T(160,145,'강박(진한 막대)에 컷','vts'),'박자 컷')},
 rhythm:()=>sv(R(20,60,30,30,'fln')+R(54,60,30,30,'fln')+R(88,60,30,30,'fln')+R(122,60,170,30,'fac')+T(207,80,'긴 컷이 무거워진다','vtw')+T(70,108,'짧게 · 짧게 · 짧게','vts')+T(160,30,'컷 길이도 리듬처럼 변주','vtb'),'컷 리듬'),
 match:()=>sv(R(20,25,120,90,'fpp',4)+C(80,70,26,'fam')+T(80,132,'둥근 달','vts')+A(146,70,174,70)+R(180,25,120,90,'fpp',4)+C(240,70,26,'fln')+T(240,75,'시계','vt2')+T(240,132,'같은 모양으로 장면 점프','vts'),'매치컷'),
 kuleshov:()=>sv(face(60,70,26,'smile','fln')+A(92,55,150,35)+A(92,85,150,105)+R(155,18,70,34,'fln')+T(190,40,'밤 11시 메일','vt2')+T(270,40,'→ 걱정','vtb')+R(155,88,70,34,'fln')+T(190,110,'케이크','vt2')+T(270,110,'→ 기대','vtb')+T(60,130,'같은 무표정','vts'),'쿨레쇼프'),
 punch:()=>sv(R(20,25,130,90,'fpp',4)+face(85,70,24,'smile','fln')+A(156,70,170,70)+R(175,25,130,90,'fpp',4)+face(240,80,44,'wow','fln')+T(160,138,'핵심 단어 순간에만 확대','vts'),'펀치인'),
 caption:()=>sv(R(30,50,260,44,'fdk',6)+`<text x="160" y="78" text-anchor="middle" style="font:700 16px var(--body);fill:#fff">번아웃은 <tspan style="fill:#f6d22b">게으름이 아니다</tspan></text>`+T(160,120,'문장당 강조 단어는 하나','vts'),'핵심 단어 강조'),
 soundlogo:()=>{let s='';for(let i=0;i<5;i++)s+=L(30,40+i*12,290,40+i*12,'vs');const n=[[90,76],[140,64],[190,52]];n.forEach(([x,y])=>{s+=`<ellipse cx="${x}" cy="${y}" rx="9" ry="6.5" class="fac" transform="rotate(-20 ${x} ${y})"/>`+L(x+8,y,x+8,y-36,'vsa')});return sv(s+T(160,128,'3음, 매번 같은 자리, 같은 음색','vts'),'사운드 로고')},
 drop:()=>sv(P('M20,120 Q120,115 180,50','vsa')+R(182,40,30,90,'fdash')+T(197,30,'침묵','vtb')+R(214,12,20,118,'fam')+T(250,28,'드롭!','vtb','start')+T(90,138,'빌드업','vts'),'빌드업과 드롭'),
 eq:()=>sv(L(20,120,300,120,'vs')+P('M20,60 Q80,55 110,62 Q140,110 175,110 Q205,110 230,62 Q270,55 300,62','vsa')+R(130,40,90,22,'fac',3)+T(175,56,'목소리 자리','vtw')+T(30,138,'저음','vts','start')+T(300,138,'고음','vts','end'),'EQ'),
 melody:()=>{let s='';for(let i=0;i<5;i++)s+=L(20,40+i*12,300,40+i*12,'vs');const m=[[40,76],[66,64],[92,76],[118,64]];[0,140].forEach(o=>m.forEach(([x,y])=>{s+=`<ellipse cx="${x+o}" cy="${y}" rx="8" ry="6" class="${o?'fln':'fac'}"/>`}));return sv(s+P('M30,30 L30,24 L130,24 L130,30','vsd')+P('M170,30 L170,24 L270,24 L270,30','vsd')+T(80,18,'훅','vtb')+T(220,18,'반복','vtb')+T(160,128,'좁은 음역 · 짧게 · 반복 + 동작','vts'),'반복 멜로디')},
 sfx:()=>sv(R(20,55,80,40,'fln')+R(120,55,80,40,'fln')+R(220,55,80,40,'fln')+T(110,45,'휙','vtb')+T(210,45,'사각','vtb')+T(160,125,'전환마다 짧은 소리, 2~3종 번갈아','vts'),'전환 효과음'),
 crowd:()=>{let s='';for(let r=0;r<4;r++)for(let c=0;c<12;c++)s+=C(30+c*24,30+r*22,7,(r*12+c)%5===0?'fln':'fac');return sv(s+C(30+11*24,30+3*22,9,'fam')+T(160,140,'다른 사람들도 이미 한다','vts'),'사회적 증거')},
 emotion:()=>sv(R(30,40,150,40,'fam')+T(105,65,'1. 감정 (웃음 · 뭉클)','vtw')+A(182,60,198,60)+R(200,40,90,40,'fln')+T(245,65,'2. 정보','vt')+T(160,110,'느낀 다음에 정보를 얹는다','vts'),'감정 먼저'),
 cute:()=>sv(`<ellipse cx="90" cy="70" rx="28" ry="40" class="fln"/>`+C(80,58,4,'fi')+C(100,58,4,'fi')+T(90,132,'어른 비율','vts')+C(230,75,40,'fam')+C(216,82,9,'fi')+C(244,82,9,'fi')+T(230,132,'큰 눈 · 낮은 눈 · 둥근 얼굴','vts'),'귀여움 비율'),
 countdown:()=>sv(C(70,70,30,'fln')+T(70,78,'3','vtq')+C(160,70,30,'fln')+T(160,78,'2','vtq')+C(250,70,30,'fac')+T(250,78,'1','vtqw')+T(160,132,'질문 뒤 멈춤이 있어야 답을 외친다','vts'),'참여 카운트다운'),
 repeat:()=>{let s='';for(let i=0;i<5;i++){s+=R(16+i*60,35,52,70,'fpp',4)+R(22+i*60,41,40,10,'fac',2)+T(42+i*60,85,(i+1)+'화','vt2')}return sv(s+T(160,130,'같은 오프닝 · 같은 색 · 다른 이야기','vts'),'반복 노출')},
 copy:()=>''
};
function vizFor(key,param,example){const k=Array.isArray(key)?key[0]:key;const p=Array.isArray(key)?key[1]:param;
 if(k==='copy'||!VIZ[k])return `<div class="copyviz"><span>광고 카피 예</span><p>${esc(example||'')}</p></div>`;
 try{return VIZ[k](p||{})}catch(e){return ''}}
