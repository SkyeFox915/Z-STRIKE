(async()=>{
const D=window.__ZS__,$=s=>document.querySelector(s);
const get=async p=>{if(D)return D[p];const r=await fetch(p,{cache:'no-cache'});if(!r.ok)throw new Error(p);return r.json()};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FULL={weekday:'long',day:'numeric',month:'long',year:'numeric'};
const fmt=(d,o)=>new Date(d.slice(0,10)+'T12:00:00').toLocaleDateString('es',o||{day:'numeric',month:'long',year:'numeric'});
const num=n=>'#'+String(+n).padStart(3,'0');
const BL={
 titulo:b=>`<h3>${esc(b.texto)}</h3>`,
 parrafo:b=>`<p>${esc(b.texto)}</p>`,
 alerta:b=>`<div class="k-al">⚠ ${esc(b.texto)}</div>`,
 transmision:b=>`<div class="k-tx">${b.lineas.map(l=>`<p>&gt; ${esc(l)}</p>`).join('')}</div>`,
 clasificado:b=>`<div class="k-cl"><h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p></div>`,
 datos:b=>`<dl class="k-d">${b.items.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`,
 imagen:b=>`<img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy">`,
 fin:b=>`<p class="fin">${esc(b.texto)}</p>`
};
try{
const cfg=await get('data/config.json'),list=(await get('boletines/index.json')).sort((a,b)=>b.id-a.id);
const C=cfg.contador||{},T=new Date(C.fecha).getTime(),cd=$('#cd');
if(cfg.alerta)$('#top').innerHTML='<i class="dot"></i>'+esc(cfg.alerta);
const tick=()=>{
 const s=Math.floor((T-Date.now())/1e3);
 if(s<=0){cd.innerHTML=`<p class="go">${esc(C.textoFin||'Transmisión en curso')}</p>`;return false}
 [Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60].forEach((v,i)=>$('#cd-'+'dhms'[i]).textContent=String(v).padStart(2,'0'));
 return true};
if(C.fecha&&!isNaN(T)){
  $('#cd-l').textContent=C.etiqueta||'';
  $('#cdw').hidden=false;
  if(tick()){
    const iv=setInterval(()=>tick()||clearInterval(iv),1e3);
  }
}else{
  $('#cdw').hidden=false;
  $('#cd-l').textContent='FECHA DE LANZAMIENTO';
  $('#cd').innerHTML='<p class="go">FECHA DESCONOCIDA</p>';
                                  }
$('#arch').innerHTML=list.map(m=>`<a class="card it" href="#boletin-${esc(m.id)}"><b>${num(m.id)}</b><span>${esc(m.titulo)}<small>${fmt(m.fecha)}${m.resumen?' · '+esc(m.resumen):''}</small></span></a>`).join('')||'<p class="sub">Aún no hay boletines.</p>';
const an=cfg.anuncios||[];
$('#prox').innerHTML=an.map(p=>`<li class="card"><b>${esc(p.titulo)}</b><small>${esc(p.detalle||'')}</small></li>`).join('');
$('#proximos').hidden=$('#nav-p').hidden=!an.length;
$('#desc').textContent=cfg.info.descripcion;
$('#datos').innerHTML=cfg.info.datos.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
$('#links').innerHTML=(cfg.enlaces||[]).map(l=>`<a class="btn o" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.texto)}</a>`).join('');
$('#nota').textContent=cfg.info.nota||'';
const show=async id=>{
 const m=list.find(x=>+x.id===+id)||list[0],box=$('#b');
 if(!m){box.textContent='Aún no hay boletines publicados.';return}
 const last=m===list[0];
 $('#b-h').textContent=last?'Último boletín':'Boletín archivado';
 let bl;try{bl=(await get(`boletines/${m.id}.json`)).bloques}catch{bl=[{tipo:'alerta',texto:'Transmisión no disponible'}]}
 box.innerHTML=`<p class="sub">Boletín ${num(m.id)} · ${fmt(m.fecha,FULL)}</p><h3 class="bt">${esc(m.titulo)}</h3>`+bl.map(b=>(BL[b.tipo]||(()=>''))(b)).join('')+(last?'':'<p><a class="btn o" href="#boletin">Ir al último boletín</a></p>');
};
const route=()=>{
 const h=location.hash,m=h.match(/^#boletin-(\d+)$/);
 if(m)return show(m[1]).then(()=>$('#boletin').scrollIntoView());
 if(h==='#boletin')return show();
};
addEventListener('hashchange',route);
$('#arch').addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.hash===location.hash){e.preventDefault();route()}});
await show();await route();
const t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView();
}catch(e){
 $('#b').innerHTML='<div class="k-al">Señal perdida</div><p>No se pudo cargar el contenido. Recarga la página en unos segundos.</p>';
}
})();
