/* ConVos · sala en vivo.
   Une los celulares del público con la pantalla grande. No guarda nada en ninguna base:
   usa "presencia" (quién está conectado ahora) y se borra solo cuando cierran la página.
   Backends: 'supabase' (Realtime) o 'sim' (pestañas de un mismo navegador, para ensayar y como plan B).
   Todo lo que llega de otros se trata como no confiable: se valida y nunca se pega como HTML. */
(function(){
'use strict';
const CFG=window.CONVOS_CFG||{};
const LOCS=window.CONVOS_LOCS||[];
const LOCMAP=new Map(LOCS.map(l=>[l.name,l]));

const SCENES=['bienvenida','cerca','swipe','grupo','viaje','semana','red','empresa'];
const SCENE_LABEL={bienvenida:'Bienvenida',cerca:'Cerca mío',swipe:'Swipe',grupo:'Grupo',viaje:'Viaje',semana:'Semana',red:'Tu red',empresa:'Empresa'};

/* compañeros simulados: para que el mapa no quede vacío si entra poca gente. Siempre se marcan como simulados. */
const FILLERS=[
  ['Mica','Olivos',0],['Lucho','Pilar',3],['Sofi','San Isidro',0],['Nico','Martínez',2],['Cande','Tigre',0],
  ['Fede','Castelar',3],['Vero','Morón',0],['Tobi','Ramos Mejía',0],['Juli','Haedo',2],['Agus','Adrogué',3],
  ['Lu','Lomas de Zamora',0],['Santi','Quilmes',0],['Flor','Bernal',2],['Rama','La Plata',4],['Pau','Belgrano',0],
  ['Gabi','Palermo',0],['Dani','Caballito',1],['Mati','Villa Urquiza',0]
].map(([n,loc,seats],i)=>({id:'sim'+String(i+1).padStart(2,'0'),n,loc,car:seats>0,seats:seats||3,sim:true}));

const clean=(s,max)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,max);
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hav=(a,b)=>{const R=6371,t=Math.PI/180,dA=(b[0]-a[0])*t,dO=(b[1]-a[1])*t;const x=Math.sin(dA/2)**2+Math.cos(a[0]*t)*Math.cos(b[0]*t)*Math.sin(dO/2)**2;return 2*R*Math.asin(Math.sqrt(x))};

/* Una persona llega de la red: se aceptan solo estos campos y la localidad tiene que existir en la lista.
   La ubicación nunca viene del otro lado: se calcula acá a partir de la localidad (con un corrimiento para no marcar una casa). */
function validPerson(p){
  if(!p||typeof p!=='object'||p.k!=='p')return null;
  const id=String(p.id||'');if(!/^[a-z0-9]{6,16}$/.test(id))return null;
  const n=clean(p.n,14);if(!n)return null;
  if(!LOCMAP.has(p.loc))return null;
  const seats=Math.min(4,Math.max(1,parseInt(p.seats,10)||3));
  return {id,n,loc:p.loc,car:p.car===true,seats};
}
function pointOf(p){
  const l=LOCMAP.get(p.loc);if(!l)return null;const r=rng(hash(p.id));
  return [l.pt[0]+(r()-.5)*0.012,l.pt[1]+(r()-.5)*0.014];
}

/* ---- firma del presentador (ECDSA P-256). Los celulares solo guardan la clave pública. ---- */
const u8=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const b64u8=a=>btoa(String.fromCharCode(...new Uint8Array(a)));
const msgOf=(s,fill,seq)=>new TextEncoder().encode(s+'|'+(fill?1:0)+'|'+seq);
const ALG={name:'ECDSA',hash:'SHA-256'};
let pubKeyP=null;
const pubKey=()=>pubKeyP||(pubKeyP=crypto.subtle.importKey('spki',u8(CFG.publicKey),{name:'ECDSA',namedCurve:'P-256'},false,['verify']));
async function verifyScene(d){
  try{
    if(!d||d.k!=='d'||!SCENES.includes(d.s)||!Number.isSafeInteger(d.seq)||typeof d.sig!=='string'||d.sig.length>200||!CFG.publicKey)return false;
    return await crypto.subtle.verify(ALG,await pubKey(),u8(d.sig),msgOf(d.s,d.fill===true,d.seq));
  }catch(_){return false;}
}
async function signScene(privB64,s,fill,seq){
  const k=await crypto.subtle.importKey('pkcs8',u8(privB64),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  return b64u8(await crypto.subtle.sign(ALG,k,msgOf(s,fill,seq)));
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
function supaBackend(room,key){
  const ls=[],ss=[];let ch=null,mine=null,online=false;
  const status=v=>ss.forEach(f=>f(v));
  return {
    onState:f=>ls.push(f),onStatus:f=>ss.push(f),
    async start(){
      try{
        status('connecting');
        if(!window.supabase)await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js','sha256-hZaWX+kY5lZgChtWjToWj1wNPSKmAIhrtvRKZVXbAec=');
        const sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{realtime:{params:{eventsPerSecond:5}},auth:{persistSession:false,autoRefreshToken:false}});
        ch=sb.channel('convos:'+room,{config:{presence:{key}}});
        ch.on('presence',{event:'sync'},()=>{const st=ch.presenceState(),m=new Map();for(const k in st){const a=st[k];if(a&&a.length)m.set(k,a[a.length-1]);}ls.forEach(f=>f(m));});
        ch.subscribe(async s=>{
          if(s==='SUBSCRIBED'){online=true;status('online');if(mine)try{await ch.track(mine);}catch(_){}}
          else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){online=false;status('offline');}
        });
      }catch(_){status('offline');}
    },
    async track(_k,payload){mine=payload;if(ch&&online)try{await ch.track(payload);}catch(_){}},
    async leave(){mine=null;if(ch&&online)try{await ch.untrack();}catch(_){}}
  };
}

function connect(o){
  o=o||{};
  const key=o.key||('v'+Math.random().toString(36).slice(2,10));
  const be=(CFG.backend==='supabase'&&CFG.supabaseUrl&&CFG.supabaseKey)?supaBackend(CFG.room,key):simBackend(CFG.room||'sala-demo',key);
  let people=[],scene=null,lastSeq=0,status='connecting',timer=0;
  const pl=[],sl=[],st=[];
  const verified=new Map();
  async function recompute(m){
    const list=[];let best=null;
    for(const [k,p] of m){
      if(!p||typeof p!=='object'||JSON.stringify(p).length>400)continue;
      if(p.k==='p'){const v=validPerson(p);if(v&&k===v.id)list.push(v);}
      else if(p.k==='d'&&k==='presenter'){
        const ck=p.sig+'|'+p.s+'|'+p.seq+'|'+(p.fill===true);let ok=verified.get(ck);
        if(ok===undefined){ok=await verifyScene(p);verified.set(ck,ok);}
        if(ok&&(!best||p.seq>best.seq))best=p;
      }
    }
    list.sort((a,b)=>a.id<b.id?-1:1);people=list.slice(0,150);pl.forEach(f=>f(people));
    if(best&&best.seq>lastSeq){lastSeq=best.seq;scene={s:best.s,fill:best.fill===true,seq:best.seq};sl.forEach(f=>f(scene));}
  }
  be.onState(m=>{clearTimeout(timer);timer=setTimeout(()=>recompute(m),60);});
  be.onStatus(s=>{status=s;st.forEach(f=>f(s));});
  return {
    key,
    get people(){return people},get scene(){return scene},get status(){return status},
    onPeople(f){pl.push(f);f(people);},onScene(f){sl.push(f);if(scene)f(scene);},onStatus(f){st.push(f);f(status);},
    start(){return be.start();},
    track(p){const v=validPerson({k:'p',...p});if(!v)return false;be.track(key,{k:'p',...v});return true;},
    leave(){return be.leave();},
    async publishScene(priv,s,fill,seq){
      if(!SCENES.includes(s))return false;
      const sig=await signScene(priv,s,fill===true,seq);
      be.track('presenter',{k:'d',s,fill:fill===true,seq,sig});return true;
    }
  };
}

window.ConvosRoom={connect,FILLERS,SCENES,SCENE_LABEL,validPerson,pointOf,hav,clean,hash,rng,cfg:CFG,backendName:()=>(CFG.backend==='supabase'&&CFG.supabaseUrl&&CFG.supabaseKey)?'supabase':'sim'};
})();
