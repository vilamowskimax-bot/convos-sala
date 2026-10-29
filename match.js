/* ConVos · HAY MATCH en la ruta (solo proyector).
   Una ruta vista desde arriba y de costado, en perspectiva. Los autos andan; uno nuevo entra por la banquina y se mete
   acelerando. Cuando alguien se suma, el auto frena junto a la vereda, la persona salta adentro y el auto vuelve a acelerar.
   Todo se mide en unidades del mundo (más o menos metros) y una cámara sigue a los autos y se aleja cuando hay más.
   Uso: const m=ConvosMatch.create(elemento,{onChange}) · m.addCar(i,[conductor,...pasajeros],{pickup|delay|instant})
        · m.board(i,persona) · m.busy() · m.shown() · m.destroy() */
(function(){
'use strict';
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const first=n=>(Array.from(String(n||'').trim())[0]||'?').toUpperCase();
const smooth=s=>s<=0?0:s>=1?1:s*s*(3-2*s);

/* ---------- personajes: ilustración plana, cuerpo entero o busto (para las ventanillas) ----------
   Todo sale del id de cada persona: siempre se ve igual en todas las pantallas. */
const SKIN=['#F9D7BD','#F0BE98','#DCA077','#BC7C52','#8F5A37','#663F27'];
const HAIR=['#1F1A2E','#2F1F16','#5B3824','#8C4A26','#C99A5B','#40302A'];
const SHIRT=['#4285F4','#34A853','#FBBC05','#EA4335','#F1F3F4','#A142F4','#12B5CB','#FF7043'];
const PANTS=['#2B4C9C','#1F3A6E','#36415E','#3F5FD8','#5B4A3A'];
const STYLE=['short','curly','long','bun','bob','pony','buzz','wavy'];
function look(id){const h=hash('look'+id);return {skin:SKIN[h%6],hair:HAIR[(h>>>3)%6],shirt:SHIRT[(h>>>6)%8],pants:PANTS[(h>>>9)%5],style:STYLE[(h>>>12)%8],sole:SHIRT[(h>>>15)%8]};}
function hairBack(l){
  const c=' fill="'+l.hair+'"';
  switch(l.style){
    case 'long':return '<path d="M38 58Q36 33 60 31Q84 33 82 58L87 114Q60 124 33 114Z"'+c+'/>';
    case 'bob':return '<path d="M37 60Q36 34 60 32Q84 34 83 60L83 86Q60 93 37 86Z"'+c+'/>';
    case 'wavy':return '<path d="M38 60Q33 34 59 32Q86 33 83 60Q88 78 80 96Q60 104 40 96Q32 78 38 60Z"'+c+'/>';
    case 'pony':return '<path d="M73 44Q100 50 94 98Q87 84 76 70Z"'+c+'/>';
    case 'bun':return '<circle cx="60" cy="29" r="10.5"'+c+'/>';
    case 'curly':return '<circle cx="42" cy="54" r="10"'+c+'/><circle cx="78" cy="54" r="10"'+c+'/>';
  }
  return '';
}
function hairFront(l){
  const c=' fill="'+l.hair+'"';
  switch(l.style){
    case 'curly':return [[45,45,8.5],[53,38,9],[63,36.5,9.5],[72,40,8.5],[78,48,7],[41,53,6.5],[79,57,5.5]].map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"'+c+'/>').join('');
    case 'buzz':return '<path d="M41 54Q41 36 60 36Q79 36 79 54Q71 45 60 45Q49 45 41 54Z"'+c+' opacity=".92"/>';
    case 'long':case 'bob':return '<path d="M40 60Q37 34 60 34Q83 34 80 60Q73 43 57 45Q46 47 40 60Z"'+c+'/>';
    case 'wavy':return '<path d="M40 60Q36 35 59 34Q83 33 81 58Q75 46 65 47Q66 53 57 50Q48 48 40 60Z"'+c+'/>';
  }
  return '<path d="M40 57Q38 34 60 34Q82 34 80 57Q78 46 70 44Q60 51 46 50Q42 52 40 57Z"'+c+'/>';   // corto, rodete y cola
}
function head(l){   // cuello, cabeza, cara y pelo de adelante
  return '<rect x="54" y="74" width="12" height="17" rx="5" fill="'+l.skin+'"/><rect x="54" y="80" width="12" height="5" fill="#000" opacity=".1"/>'+
    '<circle cx="41.5" cy="60" r="4" fill="'+l.skin+'"/><circle cx="78.5" cy="60" r="4" fill="'+l.skin+'"/>'+
    '<ellipse cx="60" cy="57" rx="19" ry="21" fill="'+l.skin+'"/>'+
    '<circle cx="48.5" cy="66" r="3.2" fill="#F28B82" opacity=".35"/><circle cx="71.5" cy="66" r="3.2" fill="#F28B82" opacity=".35"/>'+
    '<ellipse cx="53" cy="59" rx="2.1" ry="2.7" fill="#1E1B2E"/><ellipse cx="67" cy="59" rx="2.1" ry="2.7" fill="#1E1B2E"/>'+
    '<path d="M49.5 52.5q3.5-2 7 0M63.5 52.5q3.5-2 7 0" stroke="'+l.hair+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
    '<path d="M60.5 60q-2.2 4.6.8 5.8" stroke="#000" stroke-opacity=".18" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+
    '<path d="M54 69.5q6 5 12 0" stroke="#1E1B2E" stroke-width="2" fill="none" stroke-linecap="round"/>'+hairFront(l);
}
function torso(l,n){   // remera con la inicial en el pecho
  const ink=l.shirt==='#F1F3F4'?'#4285F4':l.shirt==='#FBBC05'?'#B26A00':l.shirt;
  return '<path d="M36 104Q36 89 52 87L68 87Q84 89 84 104L86 156Q60 164 34 156Z" fill="'+l.shirt+'"/>'+
    '<path d="M71 89Q84 91 84 104L86 156Q79 159 73 160Z" fill="#000" opacity=".08"/><path d="M52 87L60 96L68 87Z" fill="'+l.skin+'"/>'+
    '<circle cx="60" cy="121" r="11.5" fill="#fff"/><text x="60" y="126.5" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-size="15" font-weight="700" fill="'+ink+'">'+esc(first(n))+'</text>';
}
function arms(l){
  const s=' stroke="'+l.shirt+'" stroke-width="13" stroke-linecap="round"',k=' stroke="'+l.skin+'" stroke-width="10" stroke-linecap="round"',h=' r="6" fill="'+l.skin+'"';
  return '<g class="al"><path d="M40 95L33 127"'+s+'/><path d="M33 125L30 149"'+k+'/><circle cx="30" cy="152"'+h+'/></g>'+
    '<g class="ar dn"><path d="M80 95L87 127"'+s+'/><path d="M87 125L90 149"'+k+'/><circle cx="90" cy="152"'+h+'/></g>'+
    '<g class="ar up"><path d="M80 95L91 74"'+s+'/><path d="M91 76L97 54"'+k+'/><circle cx="98" cy="50"'+h+'/></g>';
}
function legs(l){
  const leg=x=>'<g class="lg"><rect x="'+x+'" y="146" width="14" height="94" rx="7" fill="'+l.pants+'"/><path d="M'+(x-2)+' 236h18q9 0 9 7v3H'+(x-2)+'z" fill="#fff"/><rect x="'+(x-2)+'" y="244" width="27" height="4" rx="2" fill="'+l.sole+'"/></g>';
  return leg(45)+leg(61);
}
function figure(p){
  const l=look(p.id);
  return '<svg class="fig" viewBox="0 0 120 260" aria-hidden="true"><ellipse cx="60" cy="250" rx="27" ry="5" fill="#000" opacity=".28"/>'+hairBack(l)+legs(l)+torso(l,p.n)+arms(l)+head(l)+'</svg>';
}
function bust(p,x,y,w){
  const l=look(p.id);
  return '<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+(w*96/72).toFixed(1)+'" viewBox="24 22 72 96" overflow="hidden">'+hairBack(l)+torso(l,p.n)+head(l)+'</svg>';
}

/* ---------- el auto: de costado, un poco desde arriba (se ve el techo). Adelante a la derecha ---------- */
const CARC=[['#F97316','#FDBA74','#C2410C'],['#4285F4','#8AB4F8','#1A57C9'],['#34A853','#81C995','#1E7E38'],['#FBBC05','#FDE293','#B98900'],['#EA4335','#F28B82','#B3261E'],['#A142F4','#D7AEFB','#7627BB']];
const WIN=['M344 80H402Q413 80 419 89L455 146H344Z','M262 88Q262 80 270 80H326Q334 80 334 88V146H262Z','M182 88Q182 80 190 80H244Q252 80 252 88V146H182Z','M121 146L135 92Q138 80 151 80H172V146Z'];
const SEATX=[382,298,217,150];   // centro de cada ventanilla: el conductor adelante, los pasajeros atrás
function carSVG(uid,ci){
  const [b,l,d]=CARC[ci%CARC.length];
  const wheel=x=>'<path d="M'+(x-52)+' 252A52 52 0 0 1 '+(x+52)+' 252Z" fill="#150B33" opacity=".5"/><g transform="translate('+x+' 252)"><circle r="40" fill="#1A1033"/><circle r="19" fill="#DCD6F2"/><g class="sp"><path d="M0-16V16M-14-8L14 8M-14 8L14-8" stroke="#8E86B5" stroke-width="4" stroke-linecap="round"/></g><circle r="5" fill="#8E86B5"/></g>';
  return '<svg class="carsvg" viewBox="0 0 560 300" aria-hidden="true"><defs>'+WIN.map((p,k)=>'<clipPath id="'+uid+'w'+k+'"><path d="'+p+'"/></clipPath>').join('')+'</defs>'+
    '<ellipse cx="282" cy="289" rx="258" ry="12" fill="#000" opacity=".32"/>'+
    '<path d="M133 68L150 41Q155 33 167 33H395Q407 33 413 41L433 68Z" fill="'+l+'"/>'+                                   // techo, visto desde arriba
    '<path d="M98 156L123 82Q128 68 143 68H411Q425 68 433 80L490 156Z" fill="'+b+'"/>'+                                 // cabina
    WIN.map(p=>'<path d="'+p+'" fill="#1B1240"/>').join('')+
    [0,1,2,3].map(k=>'<g clip-path="url(#'+uid+'w'+k+')"><g class="seat" data-k="'+k+'"></g></g>').join('')+
    '<path d="M352 80H368L346 118H344ZM262 80H277L262 106Z" fill="#fff" opacity=".13"/>'+                              // brillo de los vidrios
    '<path d="M22 198Q22 160 58 156H502Q538 160 542 194V236Q542 250 528 250H36Q22 250 22 236Z" fill="'+b+'"/>'+         // carrocería
    '<path d="M28 174Q34 160 58 158H502Q530 161 538 176Z" fill="'+l+'" opacity=".6"/>'+                                 // capó y baúl, desde arriba
    '<path d="M22 224H542V236Q542 250 528 250H36Q22 250 22 236Z" fill="'+d+'" opacity=".55"/>'+
    '<path d="M258 162V230M338 162V230" stroke="'+d+'" stroke-width="3" opacity=".6"/>'+
    '<rect x="298" y="174" width="24" height="6" rx="3" fill="'+d+'" opacity=".7"/><rect x="218" y="174" width="24" height="6" rx="3" fill="'+d+'" opacity=".7"/>'+
    '<path d="M518 178H532Q542 178 542 188V198H518Z" fill="#FFE58A"/><rect x="22" y="178" width="12" height="20" rx="4" fill="#F43F5E"/>'+
    wheel(150)+wheel(430)+'</svg>';
}

/* ---------- el mundo ---------- */
const V=9;                                // velocidad de crucero (unidades por segundo)
const CW=7,CH=CW*300/560;                 // largo y alto del auto
const PH=3.3,PW=PH*120/260;               // alto y ancho de una persona
const PHI=31*Math.PI/180,CS=Math.cos(PHI),SN=Math.sin(PHI),HY=.58;   // la cámara mira 31° hacia abajo
const SHOULDER=-1.6,LANE=[2.4,6.4,10.4],WALK=-5.3;                   // banquina, tres carriles y la vereda de este lado
const SLOT=[[0,0],[11,2],[-11,1],[22,1],[-22,2],[33,0]];             // lugar de cada auto en la caravana: [x, carril]; columnas separadas para que no se pisen los nombres
const DIST=[16,23,29,35,41,46],ZC=[-.8,2.6,3.2,3.6,3.8,4];           // la cámara se aleja con cada auto
const SEATOFF=SEATX.map(x=>(x/560-.5)*CW),WAIT=[0,1.9,0,-1.9];      // ventanillas y dónde espera cada pasajero

function create(root,o){
  o=o||{};
  const cv=document.createElement('canvas'),sp=document.createElement('div');cv.className='mcv';sp.className='msp';
  root.appendChild(cv);root.appendChild(sp);
  const g=cv.getContext('2d');
  let W=1,H=1,DPR=1,F=1;
  function fit(){W=Math.max(1,root.clientWidth);H=Math.max(1,root.clientHeight);DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);F=Math.min(W,H*1.78)*.62;}
  fit();addEventListener('resize',fit);
  const cam={x:0,v:V,d:DIST[0],zc:ZC[0]};
  let A=0,sA=V,T=0,prev=0,raf=0,alive=true,uid=0;
  const cars=new Map(),order=[];let peds=[];
  const changed=()=>{if(o.onChange)o.onChange();};

  /* proyección: punto del mundo (x a lo largo de la ruta, y altura, z profundidad) a la pantalla */
  function P(x,y,z){const zz=cam.d-y*SN+(z-cam.zc)*CS,yy=y*CS+(z-cam.zc)*SN,s=F/zz;return {x:W/2+(x-cam.x)*s,y:H*HY-yy*s,s};}
  const gy=z=>P(cam.x,0,z).y,gs=z=>P(cam.x,0,z).s,hw=z=>W/2/gs(z);
  const visible=()=>order.filter(c=>c.mode!=='wait');

  /* ---- autos ---- */
  function addCar(gi,members,op){
    if(cars.has(gi))return;op=op||{};
    const c={gi,members:members.slice(0,4),on:[false,false,false,false],slot:SLOT[gi%SLOT.length],x:0,v:0,a:0,z:SHOULDER,zv:0,
      mode:'wait',at:T+(op.delay||0)/1000,op,wheel:0,seg:null,stop:null,ph:(hash('c'+gi)%600)/100};
    cars.set(gi,c);order.push(c);
  }
  function build(c){
    const el=document.createElement('div');el.className='mo mcar';
    el.innerHTML='<div class="mb"><i class="trail"><u></u><u></u><u></u></i>'+carSVG('mc'+(++uid)+'_',c.gi)+'</div>'+
      '<div class="ccard"></div>';
    sp.appendChild(el);
    c.el=el;c.mb=el.firstChild;c.trail=el.querySelector('.trail');c.spk=[...el.querySelectorAll('.sp')];
    c.seats=[...el.querySelectorAll('.seat')];c.card=el.querySelector('.ccard');
    c.members.forEach((_,k)=>fillSeat(c,k));
  }
  function fillSeat(c,k){
    const p=c.members[k];if(!p||k>3||!c.el)return;
    c.seats[k].innerHTML=bust(p,SEATX[k]-29,74,58);
  }
  function showSeat(c,k,pop){   // se ve su cabeza en la ventanilla; si recién se sube, su nombre sale flotando
    c.on[k]=true;c.seats[k].classList.add('on');
    const ps=c.members.filter((_,j)=>c.on[j]),nm=p=>'<i'+(p.sim?' class="sim"':'')+'>'+esc(p.n)+'</i>';
    c.card.innerHTML='<b>'+nm(ps[0])+'</b>'+(ps.length>1?'<span>'+ps.slice(1).map(nm).join(' · ')+'</span>':'');
    if(pop&&c.members[k]){const t=document.createElement('div');t.className='cpop';t.style.left=(SEATX[k]/5.6).toFixed(1)+'%';t.innerHTML='<b>+'+esc(c.members[k].n)+'</b>';c.el.appendChild(t);setTimeout(()=>t.remove(),1700);}
  }
  function spawn(c){
    build(c);
    const lz=LANE[c.slot[1]];
    if(c.op.instant){c.x=A+c.slot[0];c.v=sA;c.z=lz;c.mode='cruise';c.members.forEach((_,k)=>showSeat(c,k));return;}
    showSeat(c,0);
    const x0=cam.x-hw(SHOULDER)-CW-5;
    if(c.op.pickup&&c.members.length>1){   // el primer auto: frena donde lo esperan sus vecinos
      const stop=cam.x+20;c.stop={x:stop,q:c.members.slice(1).map((p,j)=>addPed(p,c,j+1,stop))};
      const Tp=2.8;c.seg={t0:T,T:Tp,p0:x0,v0:2*(stop-x0)/Tp,p1:stop,v1:0,z0:SHOULDER,z1:SHOULDER,za:0,zb:1};c.mode='arrive';
    }else{   // los demás llegan llenos: entran por la banquina y se meten acelerando
      c.members.forEach((_,k)=>showSeat(c,k));
      const Tm=2.6,p1=A+sA*Tm+c.slot[0];
      c.seg={t0:T,T:Tm,p0:x0,v0:Math.max(sA+4,2*(p1-x0)/Tm-sA),p1,v1:sA,z0:SHOULDER,z1:lz,za:.3,zb:.92};c.mode='merge';
    }
    c.x=x0;c.z=SHOULDER;c.v=c.seg.v0;
  }
  function herm(s,q){   // curva suave entre (posición, velocidad) de salida y de llegada
    const s2=s*s,s3=s2*s,D=q.T;
    return [(2*s3-3*s2+1)*q.p0+(s3-2*s2+s)*D*q.v0+(-2*s3+3*s2)*q.p1+(s3-s2)*D*q.v1,
      ((6*s2-6*s)*q.p0+(3*s2-4*s+1)*D*q.v0+(-6*s2+6*s)*q.p1+(3*s2-2*s)*D*q.v1)/D];
  }
  function leave(c){   // después de subir a todos, vuelve a la ruta acelerando
    const Tl=2.6,solo=visible().length===1;let p1,v1=sA;
    if(solo){p1=c.x+16;v1=V;A=p1-c.slot[0]-V*Tl;sA=V;}   // va solo: la caravana arranca con él
    else p1=Math.max(c.x+6,A+sA*Tl+c.slot[0]);
    c.seg={t0:T,T:Tl,p0:c.x,v0:0,p1,v1,z0:c.z,z1:LANE[c.slot[1]],za:.12,zb:.85};c.mode='leave';c.stop=null;changed();
  }
  function stepCar(c,dt){
    if(c.mode==='wait'){if(T<c.at)return;spawn(c);changed();}
    const v0=c.v;
    if(c.seg){
      const q=c.seg,s=Math.min(1,(T-q.t0)/q.T),r=herm(s,q);c.x=r[0];c.v=r[1];c.z=q.z0+(q.z1-q.z0)*smooth((s-q.za)/(q.zb-q.za));
      if(s>=1){c.seg=null;if(c.mode==='arrive'){c.mode='board';c.v=0;}else{c.mode='cruise';changed();}}
    }else if(c.mode==='cruise'){
      const xt=A+c.slot[0]+Math.sin(T*.5+c.ph)*.7,w=1.6;let a=w*w*(xt-c.x)+2*w*(sA-c.v);a=Math.max(-25,Math.min(25,a));
      c.v+=a*dt;c.x+=c.v*dt;c.zv+=(9*(LANE[c.slot[1]]-c.z)-6*c.zv)*dt;c.z+=c.zv*dt;
    }else if(c.mode==='board'){   // parado: suben de a uno
      c.v=0;const q=c.stop.q;let nx=Math.max(T+.2,c.stop.next||0);
      q.forEach(pd=>{if(pd.mode==='wait'&&pd.hopAt==null){pd.hopAt=nx;nx+=.5;}});c.stop.next=nx;
      if(q.every(pd=>pd.mode==='gone')&&T>=(c.stop.doneAt||0)+.35)leave(c);
    }
    c.a=c.a*.85+(c.v-v0)/Math.max(dt,1e-3)*.15;c.wheel+=c.v*dt/.72*57.3;
  }
  /* alguien se suma a un auto: si ya anda, frena más adelante junto a la vereda */
  function board(gi,p){
    const c=cars.get(gi);if(!c||c.members.length>3)return;
    const k=c.members.length;c.members.push(p);
    if(c.mode==='wait')return;   // todavía no salió: llega con todos adentro
    fillSeat(c,k);
    if((c.mode==='arrive'||c.mode==='board')&&c.stop){c.stop.q.push(addPed(p,c,k,c.stop.x));return;}
    const Ta=2.4,v0=Math.max(c.v,2),stop=c.x+v0*Ta/2;
    c.stop={x:stop,q:[addPed(p,c,k,stop)]};
    c.seg={t0:T,T:Ta,p0:c.x,v0,p1:stop,v1:0,z0:c.z,z1:SHOULDER,za:0,zb:.6};c.mode='arrive';changed();
  }

  /* ---- personas que esperan en la vereda y saltan al auto ---- */
  function addPed(p,c,k,sx){
    const el=document.createElement('div');el.className='mo mp wave';
    el.innerHTML='<div class="wtag'+(k===2?' lo':'')+'"><b>'+esc(p.n)+'</b>'+(p.sim?'<small>ejemplo</small>':'')+'</div>'+figure(p);
    sp.appendChild(el);
    const pd={p,c,k,el,x:sx+WAIT[k],z:WALK,y:0,mode:'wait',hopAt:null,sc:1,op:1};peds.push(pd);return pd;
  }
  function stepPed(pd){
    if(pd.mode==='wait'){if(pd.hopAt!=null&&T>=pd.hopAt){pd.mode='hop';pd.t0=T;pd.fx=pd.x;pd.fz=pd.z;pd.el.classList.remove('wave');pd.el.classList.add('hop');}return;}
    const c=pd.c,s=Math.min(1,(T-pd.t0)/.8),e=smooth(s);
    pd.x=pd.fx+(c.x+SEATOFF[pd.k]-pd.fx)*e;pd.z=pd.fz+(c.z-.9-pd.fz)*e;pd.y=CH*.18*e+Math.sin(Math.PI*s)*1.7;
    pd.sc=1-.4*e;pd.op=s<.7?1:1-(s-.7)/.3;
    if(s>=.62&&!c.on[pd.k]){showSeat(c,pd.k,true);}
    if(s>=1){pd.mode='gone';pd.el.remove();if(c.stop)c.stop.doneAt=T;changed();}
  }

  /* ---- cámara y caravana ---- */
  function stepWorld(dt){
    const vis=visible(),n=vis.length,busy=vis.some(c=>c.mode==='arrive'||c.mode==='board');
    sA+=((n>1&&busy?V*.45:V)-sA)*(1-Math.exp(-1.4*dt));A+=sA*dt;   // si alguien se está subiendo, la caravana baja un cambio
    if(!n){cam.v=V;cam.x+=V*dt;}
    else{
      let fx,fv;
      if(n===1){const c=vis[0];if((c.mode==='arrive'||c.mode==='board')&&c.stop){fx=c.stop.x+1;fv=0;}else{fx=c.x+2.5;fv=c.v;}}
      else{fx=A+vis.reduce((t,c)=>t+c.slot[0],0)/n;fv=sA;}
      const w=1.5;let a=w*w*(fx-cam.x)+2*w*(fv-cam.v);a=Math.max(-30,Math.min(30,a));cam.v+=a*dt;cam.x+=cam.v*dt;
    }
    const i=Math.max(0,Math.min(DIST.length-1,n-1)),k=1-Math.exp(-1.1*dt);cam.d+=(DIST[i]-cam.d)*k;cam.zc+=(ZC[i]-cam.zc)*k;
  }

  /* ---- dibujo: el piso, la ruta y el paisaje van en un canvas; autos y personas, encima ---- */
  function band(z0,z1,col){z0=Math.max(z0,cam.zc-cam.d*.9/CS);const y0=Math.min(H,gy(z0)),y1=Math.max(0,gy(z1));if(y0>y1){g.fillStyle=col;g.fillRect(0,y1,W,y0-y1);}}
  function line(z,w,col){const a=gy(z-w/2),b=gy(z+w/2);g.fillStyle=col;g.fillRect(0,b,W,Math.max(1,a-b));}
  function dashes(z){
    const s=gs(z),h=hw(z),L=7,a=gy(z-.09),b=gy(z+.09);g.fillStyle='rgba(245,235,221,.5)';
    for(let x=Math.floor((cam.x-h)/L)*L;x<cam.x+h+L;x+=L)g.fillRect(W/2+(x-cam.x)*s,b,3.2*s,Math.max(1,a-b));
  }
  function seams(z0,z1,step,col){   // juntas de las baldosas: en perspectiva y pasan rápido
    z0=Math.max(z0,cam.zc-cam.d*.72/CS);const h=hw(z0)+step;g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();
    for(let x=Math.floor((cam.x-h)/step)*step;x<cam.x+h;x+=step){const a=P(x,0,z0),b=P(x,0,z1);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);}
    g.stroke();
  }
  function buildings(z,step,front,top,lit){
    const h0=hw(z)+step;
    for(let i=Math.floor((cam.x-h0)/step);i<=Math.ceil((cam.x+h0)/step);i++){
      const h=hash('b'+z+'_'+i),bw=step*(.62+(h%25)/100),bh=6+(h>>>5)%11,x0=i*step+((h>>>9)%10)/10*(step-bw),x1=x0+bw;
      const a=P(x0,0,z),b=P(x1,bh,z),c=P(x0,bh,z+3),d=P(x1,bh,z+3);
      g.fillStyle=top;g.beginPath();g.moveTo(a.x,b.y);g.lineTo(b.x,b.y);g.lineTo(d.x,d.y);g.lineTo(c.x,c.y);g.closePath();g.fill();
      g.fillStyle=front;g.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);
      const cols=Math.max(1,Math.floor(bw/1.9)),rows=Math.max(1,Math.floor((bh-1)/2.2));g.fillStyle=lit;
      for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){
        if(((h^Math.imul(r+1,73856093)^Math.imul(k+1,19349663))>>>0)%4)continue;
        const wx=x0+(k+.5)*bw/cols,p=P(wx-.45,1.2+r*2.2+1.1,z),q=P(wx+.45,1.2+r*2.2,z);g.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);
      }
    }
  }
  function lamps(z){
    const st=17,h0=hw(z)+st;
    for(let i=Math.floor((cam.x-h0)/st);i<=Math.ceil((cam.x+h0)/st);i++){
      const x=i*st+5,b=P(x,0,z),t=P(x,5.4,z),hd=P(x+.9,5.4,z),r=1.9*b.s;
      g.strokeStyle='#4B3E8A';g.lineWidth=Math.max(1,.14*b.s);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(t.x,t.y);g.lineTo(hd.x,hd.y);g.stroke();
      const gr=g.createRadialGradient(hd.x,hd.y,0,hd.x,hd.y,r);gr.addColorStop(0,'rgba(253,230,138,.5)');gr.addColorStop(1,'rgba(253,230,138,0)');
      g.fillStyle=gr;g.fillRect(hd.x-r,hd.y-r,2*r,2*r);g.fillStyle='#FDE68A';g.beginPath();g.arc(hd.x,hd.y+.1*b.s,.22*b.s,0,7);g.fill();
    }
  }
  function trees(z){
    const st=8.5,h0=hw(z)+st;
    for(let i=Math.floor((cam.x-h0)/st);i<=Math.ceil((cam.x+h0)/st);i++){
      const h=hash('t'+i),x=i*st+(h%30)/10,k=1+((h>>>6)%4)/10,b=P(x,0,z),t=P(x,1.7*k,z),c=P(x,2.9*k,z);
      g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(b.x,b.y,1.3*b.s,.35*b.s,0,0,7);g.fill();
      g.fillStyle='#5B3A66';g.fillRect(b.x-.16*b.s,t.y,.32*b.s,b.y-t.y);
      g.fillStyle=h&1?'#2FB37E':'#27A06F';g.beginPath();g.arc(c.x,c.y,1.45*k*c.s,0,7);g.fill();
      g.fillStyle='rgba(255,255,255,.09)';g.beginPath();g.arc(c.x-.4*c.s,c.y-.45*c.s,.7*k*c.s,0,7);g.fill();
    }
  }
  function ground(){
    g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
    band(16.5,120,'#1B1145');band(12.4,16.5,'#2D2066');band(-3.6,12.4,'#211650');band(-60,-3.6,'#2D2066');
    seams(-60,-3.6,2.6,'rgba(245,235,221,.07)');seams(12.4,16.5,2.6,'rgba(245,235,221,.06)');
    line(-3.6,.22,'rgba(251,146,60,.6)');line(.4,.14,'rgba(245,235,221,.42)');dashes(4.4);dashes(8.4);line(12.4,.16,'rgba(245,235,221,.3)');
    buildings(34,15,'#1F1550','#2A1E62','rgba(253,230,138,.32)');buildings(25,12,'#2B1F63','#3A2C7C','rgba(253,230,138,.55)');
    lamps(12.9);trees(14.7);
    const f=g.createLinearGradient(0,0,0,H*.36);f.addColorStop(0,'rgba(21,11,51,1)');f.addColorStop(1,'rgba(21,11,51,0)');g.fillStyle=f;g.fillRect(0,0,W,H*.36);
  }
  function place(el,x,y,z,w,h,foot){
    el.style.width=w.toFixed(1)+'px';
    el.style.transform='translate('+(x-w/2).toFixed(1)+'px,'+(y-h*foot).toFixed(1)+'px)';
    el.style.zIndex=String(600-Math.round(z*10));
  }
  function fs(el,obj,s){const f=Math.max(15,Math.min(30,s*.5));if(Math.abs(f-(obj.fs||0))>.4){obj.fs=f;el.style.setProperty('--fs',f.toFixed(1)+'px');}}
  function drawCar(c){
    const p=P(c.x,0,c.z),w=CW*p.s,h=w*300/560;place(c.el,p.x,p.y,c.z,w,h,.973);fs(c.el,c,p.s);
    const tilt=Math.max(-4,Math.min(4,-c.a*.12)),bob=c.v>.5?Math.sin(T*11+c.ph)*h*.006:0;
    c.mb.style.transform='translateY('+bob.toFixed(2)+'px) rotate('+tilt.toFixed(2)+'deg)';
    c.trail.style.opacity=Math.max(0,Math.min(1,(c.v-cam.v-5)/14)).toFixed(2);
    const r='rotate('+(c.wheel%360).toFixed(1)+')';c.spk.forEach(e=>e.setAttribute('transform',r));
  }
  function drawPed(pd){
    const p=P(pd.x,pd.y,pd.z),w=PW*p.s*pd.sc;place(pd.el,p.x,p.y,pd.z,w,w*260/120,.954);fs(pd.el,pd,p.s);pd.el.style.opacity=pd.op.toFixed(2);
  }
  function frame(now){
    if(!alive)return;
    if(W<=1)fit();
    const dt=Math.min(.05,Math.max(0,(now-(prev||now))/1000));prev=now;T+=dt;
    order.forEach(c=>stepCar(c,dt));peds.forEach(stepPed);peds=peds.filter(pd=>pd.mode!=='gone');
    stepWorld(dt);ground();
    order.forEach(c=>{if(c.el)drawCar(c);});peds.forEach(drawPed);
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return {
    addCar,board,
    has:gi=>cars.has(gi),count:()=>cars.size,
    busy:()=>peds.length>0||order.some(c=>c.mode==='wait'||c.mode==='merge'||c.mode==='arrive'||c.mode==='board'),
    shown:()=>visible().map(c=>c.members.filter((_,k)=>c.on[k])),
    destroy(){alive=false;cancelAnimationFrame(raf);removeEventListener('resize',fit);root.innerHTML='';}
  };
}

window.ConvosMatch={create,figure,look};
})();
