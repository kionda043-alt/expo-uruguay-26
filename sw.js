/* Expo Uruguay · service worker. Versión del contenido: f40637dc55
   Guarda la app completa la primera vez que se abre, así sigue andando sin internet. */
const CACHE='expo-uy-f40637dc55';
const FILES=[
"./",
"assets/fonts/fonts.css",
"assets/fonts/lilita-one-latin-400.woff2",
"assets/fonts/lilita-one-latin-ext-400.woff2",
"assets/fonts/montserrat-latin-700.woff2",
"assets/fonts/montserrat-latin-800.woff2",
"assets/fonts/montserrat-latin-900.woff2",
"assets/fonts/montserrat-latin-ext-700.woff2",
"assets/fonts/montserrat-latin-ext-800.woff2",
"assets/fonts/montserrat-latin-ext-900.woff2",
"assets/fonts/nunito-latin-400.woff2",
"assets/fonts/nunito-latin-700.woff2",
"assets/fonts/nunito-latin-800.woff2",
"assets/fonts/nunito-latin-900.woff2",
"assets/fonts/nunito-latin-ext-400.woff2",
"assets/fonts/nunito-latin-ext-700.woff2",
"assets/fonts/nunito-latin-ext-800.woff2",
"assets/fonts/nunito-latin-ext-900.woff2",
"assets/img/ag.webp",
"assets/img/bar.webp",
"assets/img/bg.webp",
"assets/img/bowl.webp",
"assets/img/burger.webp",
"assets/img/cafe.webp",
"assets/img/cbd.webp",
"assets/img/club.webp",
"assets/img/consult.webp",
"assets/img/cul.webp",
"assets/img/exh.webp",
"assets/img/food.webp",
"assets/img/helado.webp",
"assets/img/hon.webp",
"assets/img/ind.webp",
"assets/img/logo.webp",
"assets/img/par.webp",
"assets/img/pizza.webp",
"assets/img/plano.webp",
"assets/img/sem.webp",
"assets/img/spons.webp",
"assets/img/tbc.webp",
"assets/img/tex.webp",
"assets/img/tix.webp",
"assets/img/xmark.webp",
"assets/js/qrcode.min.js",
"assets/video/introVid.mp4",
"assets/video/introVidH.mp4",
"assets/video/v_ag.mp4",
"assets/video/v_bar.mp4",
"assets/video/v_cbd.mp4",
"assets/video/v_club.mp4",
"assets/video/v_consult.mp4",
"assets/video/v_cul.mp4",
"assets/video/v_exh.mp4",
"assets/video/v_food.mp4",
"assets/video/v_hon.mp4",
"assets/video/v_ind.mp4",
"assets/video/v_par.mp4",
"assets/video/v_plano.mp4",
"assets/video/v_sem.mp4",
"assets/video/v_spons.mp4",
"assets/video/v_tix.mp4",
"icons/apple-touch-icon.png",
"icons/favicon-32.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"manifest.webmanifest"
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('expo-uy-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin||url.pathname.endsWith('/sw.js'))return;
  // Página: primero internet (para tomar cambios), si no hay, la guardada
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./',cp));return r}).catch(()=>caches.open(CACHE).then(c=>c.match('./',{ignoreSearch:true}))));
    return;
  }
  // Videos: el navegador pide pedazos (Range); los servimos desde el archivo guardado
  const range=req.headers.get('range');
  if(range){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req.url,{ignoreSearch:true})).then(async hit=>{
      if(!hit)return fetch(req);
      const buf=await hit.arrayBuffer();const total=buf.byteLength;
      const m=/bytes=(\d*)-(\d*)/.exec(range)||[];
      let a=m[1]?parseInt(m[1]):0, b=m[2]?parseInt(m[2]):total-1;
      if(!m[1]&&m[2]){a=Math.max(0,total-parseInt(m[2]));b=total-1}
      b=Math.min(b,total-1);
      return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':hit.headers.get('Content-Type')||'video/mp4','Content-Range':`bytes ${a}-${b}/${total}`,'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}});
    }));
    return;
  }
  // Resto (imágenes, fuentes, scripts): primero lo guardado, rápido
  e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true})).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
});
