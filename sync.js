/* ConVos · sala en vivo.
   Une el proyector, los celulares y la consola del presentador. No guarda nada en ninguna base:
   usa "presencia" (quién está conectado ahora) y se borra solo cuando cada uno cierra la página.
   Backends: 'supabase' (Realtime) o 'sim' (pestañas de un mismo navegador, para ensayar).
   Todo lo que llega de otros se trata como no confiable: se valida y nunca se pega como HTML. */
(function(){
'use strict';
const CFG=window.CONVOS_CFG||{};
const LOCS=window.CONVOS_LOCS||[];
const LOCMAP=new Map(LOCS.map(l=>[l.name,l]));
const SHOW=Array.isArray(window.CONVOS_SHOW)?window.CONVOS_SHOW:[];
const SCENES=SHOW.map(x=>x.id);
const BYID=Object.fromEntries(SHOW.map(x=>[x.id,x]));
const FLAGS={NAMES_OFF:1,QR:2,REFIT:4};   // lo que la consola puede pedirle al proyector

/* compañeros de ejemplo: para que el mapa no quede vacío si entra poca gente. Siempre se marcan como simulados.
   El orden importa: los primeros forman un auto, después alguien se sube, después llega otro auto…
   Mica tiene auto pero va con Nico (vive a 2,4 km): así el CO₂ en vivo cuenta un auto menos aunque solo haya ejemplos. */
const FILLERS=[
  ['Nico','Martínez',3],['Sofi','San Isidro',0],['Mica','Olivos',2],['Fede','Castelar',3],['Vero','Morón',0],['Lucho','Pilar',3],
  ['Cande','Tigre',0],['Juli','Haedo',2],['Tobi','Ramos Mejía',0],['Agus','Adrogué',3],['Lu','Lomas de Zamora',0],['Flor','Bernal',2],
  ['Santi','Quilmes',0],['Pau','Belgrano',0],['Gabi','Palermo',0],['Dani','Caballito',1],['Mati','Villa Urquiza',0],['Rama','La Plata',4]
].map(([n,loc,seats],i)=>({id:'sim'+String(i+1).padStart(2,'0'),n,loc,car:seats>0,seats:seats||3,sim:true}));

const clean=(s,max)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,max);
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hav=(a,b)=>{const R=6371,t=Math.PI/180,dA=(b[0]-a[0])*t,dO=(b[1]-a[1])*t;const x=Math.sin(dA/2)**2+Math.cos(a[0]*t)*Math.cos(b[0]*t)*Math.sin(dO/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const int=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max?v:0;
const okId=id=>typeof id==='string'&&/^[a-z0-9]{6,16}$/.test(id);

/* Lo que cada celular informa de sí: si tocó algo en la escena actual (sid/act) y su voto (v). Nada personal. */
function viewerBits(p){return {sid:typeof p.sid==='string'&&SCENES.includes(p.sid)?p.sid:'',act:p.act===1?1:0,v:int(p.v,6)};}
/* Una persona llega de la red: solo se aceptan estos campos y la localidad tiene que existir en la lista.
   La ubicación nunca viene del otro lado: se calcula acá a partir de la localidad (con un corrimiento para no marcar una casa). */
function validPerson(p){
  if(!p||typeof p!=='object'||p.k!=='p'||!okId(p.id))return null;
  const n=clean(p.n,14);if(!n||!LOCMAP.has(p.loc))return null;
  return {id:p.id,n,loc:p.loc,car:p.car===true,seats:Math.min(4,Math.max(1,parseInt(p.seats,10)||3)),...viewerBits(p)};
}
function validViewer(p){
  if(!p||typeof p!=='object'||p.k!=='a'||!okId(p.id))return null;
  return {id:p.id,...viewerBits(p)};
}
function pointOf(p){
  const l=LOCMAP.get(p.loc);if(!l)return null;const r=rng(hash(p.id));
  return [l.pt[0]+(r()-.5)*0.012,l.pt[1]+(r()-.5)*0.014];
}

/* ---- firma del presentador (ECDSA P-256). Solo la consola tiene la clave privada; los demás, la pública. ---- */
const u8=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const b64u8=a=>btoa(String.fromCharCode(...new Uint8Array(a)));
/* r = hora del último "reiniciar todo" (0 si nunca): va firmada para que nadie más pueda reiniciar los celulares */
const msgOf=(s,st,fill,f,seq,r)=>new TextEncoder().encode(s+'|'+st+'|'+fill+'|'+f+'|'+seq+(r?'|'+r:''));
const ALG={name:'ECDSA',hash:'SHA-256'};
let pubKeyP=null;
const pubKey=()=>pubKeyP||(pubKeyP=crypto.subtle.importKey('spki',u8(CFG.publicKey),{name:'ECDSA',namedCurve:'P-256'},false,['verify']));
async function verifyScene(d){
  try{
    if(!d||d.k!=='d'||!BYID[d.s]||!Number.isSafeInteger(d.seq)||!CFG.publicKey)return false;
    if(!Number.isInteger(d.st)||d.st<0||d.st>=(BYID[d.s].steps||1)||!Number.isInteger(d.f)||d.f<0||d.f>7)return false;
    if(!Number.isInteger(d.fill)||d.fill<0||d.fill>FILLERS.length)return false;   // cuántos compañeros de ejemplo
    if(typeof d.sig!=='string'||d.sig.length>200)return false;
    if(d.r!==undefined&&!(Number.isSafeInteger(d.r)&&d.r>0))return false;
    return await crypto.subtle.verify(ALG,await pubKey(),u8(d.sig),msgOf(d.s,d.st,d.fill,d.f,d.seq,d.r));
  }catch(_){return false;}
}
async function signScene(privB64,s,st,fill,f,seq,r){
  const k=await crypto.subtle.importKey('pkcs8',u8(privB64),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  return b64u8(await crypto.subtle.sign(ALG,k,msgOf(s,st,fill,f,seq,r)));
}

/* ---- backends: mismo contrato. track(key,payload) · leave() · onState(f) · onStatus(f) · start() ---- */
function simBackend(room,key){
  const bc=new BroadcastChannel('convos:'+room),peers=new Map(),ls=[],ss=[];let mine=null;
  const emit=()=>ls.forEach(f=>f(new Map(peers)));
  bc.onmessage=e=>{const m=e.data||{};
    if(m.t==='state'&&typeof m.key==='string'){if(m.payload==null)peers.delete(m.key);else peers.set(m.key,m.payload);emit();}
    else if(m.t==='hello'&&mine)bc.postMessage({t:'state',key,payload:mine});};
  addEventListener('pagehide',()=>{if(mine)bc.postMessage({t:'state',key,payload:null});});
  return {
    onState:f=>ls.push(f),onStatus:f=>ss.push(f),
    start(){ss.forEach(f=>f('sim'));bc.postMessage({t:'hello'});},
    track(_k,payload){mine=payload;peers.set(key,payload);bc.postMessage({t:'state',key,payload});emit();},
    leave(){if(mine){bc.postMessage({t:'state',key,payload:null});mine=null;peers.delete(key);emit();}}
  };
}
function loadScript(src,sri){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;if(sri){s.integrity=sri;s.crossOrigin='anonymous';}s.onload=ok;s.onerror=()=>no(new Error('script'));document.head.appendChild(s);});}
const SUPA_SRI='sha256-hZaWX+kY5lZgChtWjToWj1wNPSKmAIhrtvRKZVXbAec=';
function supaBackend(room,key){
  const ls=[],ss=[],tvs=new Map();let sb=null,ch=null,mine=null,online=false,extra=null,retry=0,downAt=0;
  const status=v=>ss.forEach(f=>f(v));
  /* la escena llega por dos caminos: la presencia (sirve a quien entra tarde) y un aviso directo (los cambios en vivo; si uno se pierde, llega el otro) */
  const emit=()=>{if(!ch)return;const st=ch.presenceState(),m=new Map(),now=Date.now();
    for(const k in st){const a=st[k];if(a&&a.length)m.set(k,k==='presenter'?a.slice(-8):a[a.length-1]);}
    if(extra)m.set('presenter',[].concat(m.get('presenter')||[],[extra]));
    for(const [k,v] of tvs){if(now-v.t>10000)tvs.delete(k);else m.set(k,v.p);}   // proyectores que avisaron en los últimos 10 s
    ls.forEach(f=>f(m));};
  /* anunciarse; si Supabase no confirma, se reintenta solo */
  async function put(){
    if(!ch||!online)return;let r;
    try{r=await ch.track(mine||{k:'s'});}catch(_){r='error';}
    clearTimeout(retry);if(r!=='ok')retry=setTimeout(put,1500);
  }
  /* la consola repite la escena y el proyector repite cuál está mostrando (así la consola sabe si la tele está al día) */
  const send=()=>{if(!ch||!online||!mine)return;
    if(mine.k==='d')ch.send({type:'broadcast',event:'d',payload:mine}).catch(()=>{});
    else if(mine.k==='s')ch.send({type:'broadcast',event:'s',payload:{...mine,key}}).catch(()=>{});};
  function join(){
    const c=ch=sb.channel('convos:'+room,{config:{presence:{key},broadcast:{self:false}}});
    /* con la clave 'presenter' se miran todas las conexiones: si alguien se hace pasar por el presentador, su firma no vale y no tapa a la real */
    c.on('presence',{event:'sync'},()=>{if(c===ch)emit();});
    c.on('broadcast',{event:'d'},m=>{const p=m&&m.payload;if(c===ch&&p&&typeof p==='object'&&p.k==='d'){extra=p;emit();}});
    c.on('broadcast',{event:'s'},m=>{const p=m&&m.payload;
      if(c===ch&&p&&typeof p==='object'&&typeof p.key==='string'&&/^v[a-z0-9]{1,12}$/.test(p.key)&&Number.isSafeInteger(p.q)){tvs.set(p.key,{t:Date.now(),p:{k:'s',q:p.q}});emit();}});
    c.subscribe(s=>{
      if(c!==ch)return;   // canal viejo, ya reemplazado
      /* Supabase solo manda la presencia a quien se anuncia: el proyector se anuncia como {k:'s'} (no cuenta como celular) */
      if(s==='SUBSCRIBED'){online=true;downAt=0;status('online');put();send();}
      else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){online=false;downAt=downAt||Date.now();status('offline');
        if(s==='CLOSED')setTimeout(rejoin,1000);}   // con error la librería reintenta sola; si el servidor cerró el canal, no: se arma de nuevo acá
    });
  }
  /* red de seguridad: también si el canal sigue caído después de 20 s (no antes: un celular con red lenta puede tardar en entrar) */
  let busy=false;
  async function rejoin(){
    if(!sb||online||busy)return;busy=true;downAt=Date.now();const old=ch;ch=null;
    if(old)await Promise.race([Promise.resolve().then(()=>sb.removeChannel(old)).catch(()=>{}),new Promise(r=>setTimeout(r,2000))]);
    busy=false;join();
  }
  setInterval(()=>{if(downAt&&!online&&Date.now()-downAt>20000)rejoin();},2000);
  async function start(){
    try{
      status('connecting');
      /* la librería se sirve desde la misma página (si falla, desde el CDN): un bloqueador o una red que corte el CDN no deja a nadie afuera */
      if(!window.supabase)await loadScript('supabase.js',SUPA_SRI).catch(()=>loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',SUPA_SRI));
      sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{
        /* latido cada 5 s: si la conexión quedó muerta sin avisar, en ~10 s se da cuenta y se reconecta sola */
        realtime:{params:{eventsPerSecond:20},heartbeatIntervalMs:5000,reconnectAfterMs:n=>[500,1000,2000,3000][n-1]||3000},
        auth:{persistSession:false,autoRefreshToken:false}});
      downAt=Date.now();join();
    }catch(_){status('offline');setTimeout(start,3000);}   // no cargó la librería: reintenta
  }
  /* cada 3 s se repite: si un celular o la tele se perdió un cambio, se pone al día solo */
  setInterval(send,3000);
  /* el celular que vuelve de la pantalla bloqueada se vuelve a anunciar enseguida */
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')put();});
  addEventListener('online',()=>put());
  return {
    onState:f=>ls.push(f),onStatus:f=>ss.push(f),start,
    async track(_k,payload){mine=payload;await put();send();},
    async leave(){mine=null;clearTimeout(retry);if(ch&&online)try{await ch.untrack();}catch(_){}}
  };
}

const useSupa=()=>CFG.backend==='supabase'&&!!CFG.supabaseUrl&&!!CFG.supabaseKey;
/* las firmas necesitan https (o localhost): por http en la red local los celulares no siguen las escenas */
if(!(window.crypto&&crypto.subtle))console.warn('ConVos: este navegador no puede verificar las escenas firmadas. Abrí la página por https.');

/* role: 'phone' (público) · 'screen' (proyector, solo mira) · 'presenter' (consola, la única que publica escenas) */
function connect(o){
  o=o||{};
  const role=o.role||'screen';
  const key=role==='presenter'?'presenter':(o.key||('v'+Math.random().toString(36).slice(2,10)));
  const be=useSupa()?supaBackend(CFG.room,key):simBackend(CFG.room||'sala-demo',key);
  let people=[],scene=null,lastSeq=0,status='connecting',timer=0;
  let stats={connected:0,answered:0,interacted:0,tally:[0,0,0,0,0,0],screens:[]};
  let mine=role==='phone'?{k:'a',id:key,sid:'',act:0,v:0}:null;
  const pl=[],sl=[],st=[],ss=[],rl=[];const verified=new Map();let gen=0;
  /* "reiniciar todo": quien abrió la página antes de la hora del reinicio vuelve al principio, una sola vez (la hora queda guardada en la pestaña) */
  let since=Date.now();
  if(role!=='presenter')try{const v=+sessionStorage.getItem('convosSince');if(v>0)since=v;else sessionStorage.setItem('convosSince',String(since));}catch(_){}
  async function recompute(m){
    const my=++gen,list=[],marks=[],screens=[];let best=null;
    for(const [k,v0] of m){
      if(k==='presenter'){   // escenas: solo valen las firmadas por la consola
        for(const p of [].concat(v0)){
          if(!p||typeof p!=='object'||p.k!=='d'||JSON.stringify(p).length>420)continue;
          const ck=p.sig+'|'+p.s+'|'+p.st+'|'+p.f+'|'+p.seq+'|'+p.fill+'|'+p.r;let ok=verified.get(ck);
          if(ok===undefined){ok=await verifyScene(p);if(verified.size>500)verified.clear();verified.set(ck,ok);}
          if(ok&&(!best||p.seq>best.seq))best=p;
        }
        continue;
      }
      const p=v0;
      if(!p||typeof p!=='object'||JSON.stringify(p).length>420)continue;
      if(p.k==='p'){const v=validPerson(p);if(v&&k===v.id){list.push(v);marks.push(v);}}
      else if(p.k==='a'){const v=validViewer(p);if(v&&k===v.id)marks.push(v);}
      else if(p.k==='s')screens.push(Number.isSafeInteger(p.q)?p.q:0);   // proyector: qué escena está mostrando
    }
    if(my!==gen)return;   // llegó un estado más nuevo mientras se verificaba una firma: vale ese
    list.sort((a,b)=>a.id<b.id?-1:1);people=list.slice(0,150);pl.forEach(f=>f(people));
    if(best&&best.seq>lastSeq){lastSeq=best.seq;scene={s:best.s,st:best.st,fill:best.fill,f:best.f,seq:best.seq,r:best.r||0};
      if(role!=='presenter'&&scene.r>since){since=scene.r;try{sessionStorage.setItem('convosSince',String(since));}catch(_){}rl.forEach(f=>f());}
      sl.forEach(f=>f(scene));
      if(role==='screen'){mine={k:'s',q:lastSeq};push();}}   // el proyector le avisa a la consola que ya está al día
    const cur=scene?scene.s:'';
    stats={connected:marks.length,answered:list.length,interacted:marks.filter(v=>v.sid===cur&&v.act===1).length,tally:[0,0,0,0,0,0],screens};
    marks.forEach(v=>{if(v.sid===cur&&v.v>=1&&v.v<=6)stats.tally[v.v-1]++;});
    ss.forEach(f=>f(stats));
  }
  be.onState(m=>{clearTimeout(timer);timer=setTimeout(()=>recompute(m),60);});
  be.onStatus(s=>{status=s;st.forEach(f=>f(s));});
  const push=()=>be.track(key,mine);
  return {
    key,role,
    get people(){return people},get scene(){return scene},get status(){return status},get stats(){return stats},
    onPeople(f){pl.push(f);f(people);},onScene(f){sl.push(f);if(scene)f(scene);},onStatus(f){st.push(f);f(status);},onStats(f){ss.push(f);f(stats);},onReset(f){rl.push(f);},
    start(){if(mine)push();return be.start();},
    /* el celular informa quién es (después de contestar la pregunta) */
    track(p){const v=validPerson({k:'p',...p});if(!v||!mine)return false;mine={k:'p',...v,sid:mine.sid,act:mine.act,v:mine.v};push();return true;},
    /* el celular informa que tocó algo en la escena sid (como mucho una vez por escena) */
    ping(sid){if(!mine||!SCENES.includes(sid)||(mine.sid===sid&&mine.act===1))return;mine={...mine,sid,act:1,v:mine.sid===sid?mine.v:0};push();},
    vote(sid,v){if(!mine||!SCENES.includes(sid)||!(v>=1&&v<=6))return;mine={...mine,sid,act:1,v};push();},
    leave(){return be.leave();},
    async publishScene(priv,s,step,fill,f,seq,r){
      fill=Number.isInteger(fill)?Math.max(0,Math.min(FILLERS.length,fill)):0;r=Number.isSafeInteger(r)&&r>0?r:0;
      if(role!=='presenter'||!BYID[s]||!(step>=0&&step<(BYID[s].steps||1))||!(f>=0&&f<=7))return false;
      const sig=await signScene(priv,s,step,fill,f,seq,r);
      be.track('presenter',r?{k:'d',s,st:step,fill,f,seq,r,sig}:{k:'d',s,st:step,fill,f,seq,sig});return true;
    }
  };
}

/* Armado de grupos: cada auto (de más a menos lugares) toma a los vecinos más cercanos, a menos de `radius` km,
   hasta llenar sus lugares. Se prefiere a quien no tiene auto. Es una demostración, no un optimizador real.
   Cada persona de `ps` necesita {id,car,seats,pt}. Devuelve {gid:[grupo por persona o -1], groups:[{id,driver,members}]}. */
function plan(ps,radius){
  radius=radius||4.5;
  const taken=ps.map(()=>false),gid=ps.map(()=>-1),groups=[];
  ps.map((_,i)=>i).filter(i=>ps[i].car).sort((x,y)=>ps[y].seats-ps[x].seats||(ps[x].id<ps[y].id?-1:1)).forEach(i=>{
    if(taken[i])return;
    const cand=ps.map((_,j)=>j).filter(j=>j!==i&&!taken[j]).map(j=>({j,d:hav(ps[i].pt,ps[j].pt)})).filter(c=>c.d<=radius)
      .sort((p,q)=>(ps[p.j].car-ps[q.j].car)||p.d-q.d).slice(0,ps[i].seats);
    if(!cand.length)return;
    const g={id:groups.length,driver:i,members:cand.map(c=>c.j)};groups.push(g);
    taken[i]=true;gid[i]=g.id;g.members.forEach(j=>{taken[j]=true;gid[j]=g.id;});
  });
  return {gid,groups};
}

window.ConvosRoom={connect,plan,FILLERS,SCENES,SHOW,BYID,FLAGS,validPerson,pointOf,hav,clean,hash,rng,cfg:CFG,backendName:()=>useSupa()?'supabase':'sim'};
})();
