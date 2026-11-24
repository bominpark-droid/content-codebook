// 오프라인용 보관함.
// 인터넷이 되면 언제나 새 파일을 먼저 받아 오고(그래서 앱을 고쳐도 번호를 올릴 필요가 없습니다),
// 인터넷이 안 될 때만 마지막으로 받아 둔 것을 보여 줍니다.
const CACHE='codebook';
const CORE=['./','./index.html','./css/app.css','./js/viz.js','./js/app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
 './data/codes.json','./data/cases.json','./data/videos.json','./data/course.json','./data/quiz.json','./data/maps.json','./data/trends.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request.url,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))))});
