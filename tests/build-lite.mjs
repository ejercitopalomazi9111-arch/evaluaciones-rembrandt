// Genera la Edición LITE a partir del CSS exacto de la Completa.
// Lite = solo lo necesario para el examen diagnóstico, con UN solo acceso (Coordinación).
// Datos 100% compatibles con la Completa (mismas claves localStorage) para que enlacen
// y el modo debug de la premium pueda ver/alterar lo de la Lite.
import fs from 'fs';
import path from 'path';

const FULL = 'C:/Users/ejerc/OneDrive/Desktop/Evaluaciones Diagnostico/index.html';
const OUTDIR = 'C:/Users/ejerc/OneDrive/Desktop/Evaluacion Lite';
const full = fs.readFileSync(FULL, 'utf8');
const css = (full.match(/<style>([\s\S]*?)<\/style>/) || [,''])[1];
if (!css) { console.error('No se pudo extraer el CSS'); process.exit(1); }

const HEAD = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instituto Rembrandt · Evaluación Diagnóstica (Lite)</title>
<style>${css}
  .lite-badge{position:fixed;left:10px;bottom:10px;z-index:50;background:#27338f;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:99px;opacity:.85;letter-spacing:.5px}
  @media print{.lite-badge{display:none}}
  .upsell{margin-top:18px;background:linear-gradient(135deg,#eef1fb,#fff);border:1px dashed #b9c4ef;border-radius:14px;padding:14px 18px;font-size:13px;color:var(--tinta)}
  .upsell b{color:var(--azul)}
</style>
</head>
<body>
<div class="bgfx" aria-hidden="true"><span class="ln"></span><span class="s1"></span><span class="s2"></span><span class="s3"></span><span class="s4"></span><span class="s5"></span></div>
<div id="splash"><div class="sp-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="sp-logo" id="spLogo"></div></div>
<div class="lite-badge">Edición Lite</div>

<!-- ===== CONSTANCIA ===== -->
<div id="constancia">
  <div class="cert">
    <div class="cert-wm">DIAGNÓSTICO</div>
    <div class="cert-head"><div class="logo-box" id="certLogo">R</div><div><h2 id="certSchool">Instituto Rembrandt</h2><p id="certSub">Evaluación Diagnóstica</p></div></div>
    <div class="cert-title"><h1>Constancia de Resultados</h1><div class="line"></div></div>
    <div class="cert-body">Se hace constar que el alumno(a)
      <div class="cert-name" id="certName">Nombre</div>
      <div id="certGroupLine" class="muted"></div>
      presentó la evaluación diagnóstica de <b id="certSubject">Examen completo</b>, obteniendo una calificación de:
      <div class="cert-grade" id="certGrade">0</div>
      <div>nivel de desempeño <b id="certLevel">—</b> (<span id="certPct">0</span>% de aciertos, <span id="certHits">0/0</span> correctas).</div>
    </div>
    <div id="certBreakdown" class="center"></div>
    <div class="cert-foot"><div class="cert-sign"><div class="ln"></div><b id="certDirector">Dirección</b><small id="certDirectorTitle">Dirección Escolar</small></div>
      <div class="cert-sign"><div class="ln"></div><b>Sello de la institución</b><small>&nbsp;</small></div></div>
    <div class="cert-meta"><span id="certDate">Fecha</span><span id="certFolio">Folio</span></div>
  </div>
  <div class="toolbar no-print">
    <button class="btn" onclick="imprimirConstancia()">🖨️ Imprimir / Guardar PDF</button>
    <button class="btn sec" onclick="cerrarConstancia()">Volver</button>
  </div>
</div>

<div class="wrap" id="app">
  <header class="top">
    <div class="logo-box" id="hdrLogo">R</div>
    <div><h1 id="hdrSchool">Instituto Rembrandt</h1><p id="hdrSub">Evaluación Diagnóstica · Edición Lite</p></div>
    <div class="spacer"></div>
    <button class="btn-ghost" onclick="goHub()">Inicio</button>
    <button class="btn-ghost" onclick="goLogin()">Coordinación</button>
  </header>

  <!-- HUB -->
  <section id="vHub">
    <div class="hero"><div class="hero-txt"><span class="hero-badge">RESPETO · CULTURA · HONOR</span><h2>Evaluación Diagnóstica</h2><p id="hubCiclo">Nuevo Ingreso · Ciclo</p></div><img class="mascota" src="mascota.png" alt="Mascota" onerror="this.remove()"></div>
    <div class="hub-grid">
      <div class="hub-card feat" onclick="goCode()"><span class="bar" style="background:var(--azul2)"></span><div class="big" style="color:var(--azul2)">📝</div><h3>Presentar evaluación</h3><p>Ingresa con tu código y contesta tu examen.</p><button class="btn">Comenzar ahora</button></div>
    </div>
    <div class="staff-bar" onclick="goLogin()"><span>🔒 <b>Acceso de Coordinación</b></span><button class="btn sec sm">Entrar →</button></div>
  </section>

  <!-- CÓDIGO -->
  <section id="vCode" class="hidden">
    <button class="backlink" onclick="goHub()">← Volver al inicio</button>
    <div class="card" style="max-width:480px;margin:0 auto">
      <h2 style="margin-top:0">Presentar evaluación</h2>
      <p class="muted">Escribe el <b>código de acceso</b> que te entregó la escuela. Solo puede usarse una vez.</p>
      <div class="mt"><label>Código de acceso</label>
        <input type="text" id="inCode" autocomplete="off" placeholder="Ej. 7K3Q9A" maxlength="8" onkeydown="if(event.key==='Enter'){event.preventDefault();validateCode()}" style="text-transform:uppercase;font-size:22px;letter-spacing:4px;text-align:center;font-weight:800"></div>
      <div class="mt"><button class="btn" onclick="validateCode()">Comenzar →</button></div>
    </div>
  </section>

  <!-- QUIZ -->
  <section id="vQuiz" class="hidden">
    <div class="card">
      <div class="quiz-nav" style="margin-bottom:10px">
        <span class="pill" id="qSubject">Examen</span>
        <span class="pill" id="qTimer" style="display:none;background:#fdecec;color:var(--rojo)">⏱️ 00:00</span>
        <span class="pill" id="qCounter">1 / 20</span>
      </div>
      <div class="progress"><i id="qBar"></i></div>
      <div id="qImgWrap"></div>
      <div class="qtext" id="qText">Pregunta…</div>
      <div id="qOpts"></div>
      <div class="quiz-nav">
        <button class="btn sec sm" id="qPrev" onclick="prevQ()">← Anterior</button>
        <button class="btn sm" id="qNext" onclick="nextQ()">Siguiente →</button>
      </div>
      <div class="center mt"><button class="btn-ghost" onclick="abortarQuiz()">✕ Salir sin guardar</button></div>
    </div>
  </section>

  <!-- THANKS -->
  <section id="vThanks" class="hidden">
    <div class="card center"><div class="thanks-ico" id="thanksIco"><svg viewBox="0 0 52 52"><path d="M14 27l8 8 16-18"/></svg></div>
      <h2 style="margin-top:0">¡Listo! Tus respuestas se enviaron correctamente</h2>
      <p class="muted">Gracias por presentar tu evaluación. Ya puedes cerrar esta ventana.</p>
      <div class="mt"><button class="btn" onclick="goHub()">Finalizar</button></div></div>
  </section>

  <!-- LOGIN -->
  <section id="vLogin" class="hidden">
    <button class="backlink" onclick="goHub()">← Volver al inicio</button>
    <div class="card" style="max-width:440px;margin:0 auto">
      <h2 style="margin-top:0">🔒 Acceso de Coordinación</h2>
      <p class="muted">Ingresa con la contraseña de Coordinación.</p>
      <div class="mt"><label>Usuario</label><input type="text" id="loginUser" autocomplete="off" value="coordinacion" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('loginPass').focus()}"></div>
      <div class="mt"><label>Contraseña</label><input type="password" id="loginPass" onkeydown="if(event.key==='Enter'){event.preventDefault();doLogin()}"></div>
      <div class="mt"><button class="btn" onclick="doLogin()">Entrar</button></div>
      <p class="muted mt">Demo — Coordinación: <b>coordinacion / coord2026</b></p>
    </div>
  </section>

  <!-- ADMIN -->
  <section id="vAdmin" class="hidden">
    <button class="backlink" onclick="logout()">← Cerrar sesión</button>
    <div class="card">
      <h2 style="margin-top:0" id="adminTitle">Coordinación</h2>
      <div class="tabs" id="adminTabs"></div>

      <div id="tabCal" class="tabpane">
        <details class="acc" open><summary>📈 Estadísticas <span class="chip" id="statChip">0</span></summary><div class="accbody"><div class="cal-stats" id="calStats"></div></div></details>
        <div class="row" style="align-items:flex-end">
          <div><label>Grupo</label><select id="fGroup" onchange="renderCalif()"></select></div>
          <div><label>Ciclo</label><select id="fCiclo" onchange="renderCalif()"></select></div>
          <div><label>Resultado</label><select id="fResult" onchange="renderCalif()"><option value="">Todos</option><option value="apro">Suficiente</option><option value="repro">Insuficiente</option></select></div>
          <div style="flex:2"><label>Buscar alumno</label><input type="text" id="fSearch" oninput="renderCalif()" placeholder="Nombre…"></div>
          <div><button class="btn sm" onclick="exportCSV()">⬇️ Excel</button></div>
        </div>
        <div id="calList" class="mt"></div>
      </div>

      <div id="tabAlumnos" class="tabpane hidden">
        <div class="hint">Registra a los alumnos de nuevo ingreso. Cada uno recibe un <b>código único de un solo uso</b> para presentar el examen diagnóstico completo.</div>
        <div class="grid2">
          <div><label>Nombre del alumno</label><input type="text" id="sName"></div>
          <div><label>Grupo al que ingresa</label><select id="sGroup"></select></div>
          <div><label>Escuela de procedencia</label><input type="text" id="sOrigin"></div>
          <div><label>Correo del tutor</label><input type="email" id="sTEmail"></div>
        </div>
        <div class="toolbar" style="justify-content:flex-start"><button class="btn sm" onclick="addStudent()">➕ Registrar y generar código</button>
          <button class="btn sec sm" onclick="exportRoster()">⬇️ Exportar lista</button></div>
        <div class="row" style="align-items:flex-end">
          <div><label>Filtrar por grupo</label><select id="fSGroup" onchange="renderRoster()"></select></div>
          <div><label>Estado</label><select id="fSStatus" onchange="renderRoster()"><option value="">Todos</option><option value="pending">Pendientes</option><option value="completed">Contestados</option></select></div>
          <div style="flex:2"><label>Buscar (nombre o código)</label><input type="text" id="fSSearch" oninput="renderRoster()" placeholder="Nombre o código…"></div>
        </div>
        <div id="rosterList" class="mt"></div>
      </div>

      <div id="tabPreg" class="tabpane hidden">
        <div class="hint">Edita el banco de preguntas del examen diagnóstico. Marca la respuesta <b>correcta</b>. Guarda al terminar.</div>
        <div class="row" style="align-items:flex-end">
          <div><label>Materia</label><select id="editSubject" onchange="renderEditor()"></select></div>
          <div><button class="btn sm" onclick="saveBank()">💾 Guardar</button></div>
        </div>
        <div id="editorList" class="mt"></div>
        <button class="btn gold" onclick="addQuestion()">➕ Agregar pregunta</button>
      </div>

      <div id="tabCfg" class="tabpane hidden">
        <div class="hint">Datos de la institución y del examen.</div>
        <div class="grid2">
          <div><label>Nombre de la escuela</label><input type="text" id="cfgSchool"></div>
          <div><label>Subtítulo / Ciclo</label><input type="text" id="cfgSub"></div>
          <div><label>Nombre del Director(a)</label><input type="text" id="cfgDirector"></div>
          <div><label>Cargo del firmante</label><input type="text" id="cfgDirectorTitle"></div>
          <div><label>Calificación mínima aprobatoria (%)</label><input type="number" id="cfgPass" min="0" max="100"></div>
          <div><label>Escala de calificación (máx, ej. 10)</label><input type="number" id="cfgEscala" min="1" max="100"></div>
          <div><label>Tiempo del examen (min, 0 = sin límite)</label><input type="number" id="cfgTime" min="0" max="300"></div>
          <div><label>¿Barajar preguntas/respuestas?</label><select id="cfgShuffle"><option value="1">Sí</option><option value="0">No</option></select></div>
        </div>
        <h3 class="mt">Grupos</h3><div class="chips" id="catGrupos"></div>
        <div class="row"><div style="flex:2"><input type="text" id="newGrupo" placeholder="Nuevo grupo, ej. 1.3"></div><div><button class="btn sm" onclick="addGrupo()">Agregar</button></div></div>
        <h3 class="mt">Ciclos</h3><p class="muted" style="margin-top:-4px">★ marca el ciclo activo.</p><div class="chips" id="catCiclos"></div>
        <div class="row"><div style="flex:2"><input type="text" id="newCiclo" placeholder="Nuevo ciclo, ej. 2027-2028"></div><div><button class="btn sm" onclick="addCiclo()">Agregar</button></div></div>
        <div class="toolbar" style="justify-content:flex-start"><button class="btn sm" onclick="saveConfig()">💾 Guardar configuración</button></div>
        <div class="upsell">✨ <b>Esta es la Edición Lite.</b> La <b>Edición Completa</b> añade: niveles Preescolar→Prepa, roles (Dirección y Profesores por materia), guías de estudio, agenda de recorridos, reportes generales, importación masiva por Excel, envío de constancias por correo y la versión web multiusuario en la nube. <i>Tus datos actuales se conservan al actualizar.</i></div>
      </div>
    </div>
  </section>
</div>

<script src="anime.min.js"></script>
<script>
`;

const JS = String.raw`
/* ====== LITE — datos 100% compatibles con la Completa (mismas claves) ====== */
const K_CFG='ev_cfg',K_BANK='ev_bank',K_RES='ev_res',K_STUD='ev_students';
const LEVELS=[{id:'preescolar',name:'Preescolar'},{id:'primaria',name:'Primaria'},{id:'secundaria',name:'Secundaria'},{id:'preparatoria',name:'Preparatoria'}];
const SUBJECTS={
  preescolar:[{id:'lenguaje',name:'Lenguaje y Comunicación',ico:'🗣️'},{id:'pensamiento',name:'Pensamiento Matemático',ico:'🔢'},{id:'mundo',name:'Exploración del Mundo',ico:'🌎'}],
  primaria:[{id:'matematicas',name:'Matemáticas',ico:'📐'},{id:'espanol',name:'Español',ico:'📖'},{id:'ciencias',name:'Ciencias Naturales',ico:'🔬'}],
  secundaria:[{id:'matematicas',name:'Matemáticas',ico:'📐'},{id:'quimica',name:'Química',ico:'⚗️'},{id:'biologia',name:'Biología',ico:'🧬'},{id:'lectura',name:'Lectura y Redacción',ico:'📖'},{id:'fisica',name:'Física',ico:'🔭'}],
  preparatoria:[{id:'matematicas',name:'Matemáticas',ico:'📐'},{id:'quimica',name:'Química',ico:'⚗️'},{id:'biologia',name:'Biología',ico:'🧬'},{id:'lectura',name:'Lectura y Redacción',ico:'📖'},{id:'fisica',name:'Física',ico:'🔭'}]
};
const QPS=20, LV='secundaria'; // Lite: examen diagnóstico fijo de Secundaria (5 materias)
function subjectsOf(lv){return SUBJECTS[lv]||[]}
function levelName(lv){const l=LEVELS.find(x=>x.id===lv);return l?l.name:lv}
function subjName(lv,sid){const s=subjectsOf(lv).find(x=>x.id===sid);return s?s.name:sid}
const DEFAULT_CFG={school:'Instituto Rembrandt de Querétaro',sub:'Evaluación Diagnóstica de Nuevo Ingreso · Ciclo 2026-2027',director:'Nombre del Director(a)',directorTitle:'Dirección Escolar',pass:60,logo:'',shuffle:1,escala:10,timeMin:0,grupos:['1.1','1.2','2.1','2.2','3.1','3.2','4.1','4.2','5.1','5.2','6.1','6.2'],ciclos:['2025-2026','2026-2027'],activeCiclo:'2026-2027',coordPass:'coord2026',infoGeneral:'',contact:{phone:'',email:'',addr:''}};
function load(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){return def}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){toast('Almacenamiento lleno.','err');return false}}
function buildBank(){const b={};LEVELS.forEach(l=>{b[l.id]={};subjectsOf(l.id).forEach(s=>{b[l.id][s.id]=[];for(let i=1;i<=QPS;i++)b[l.id][s.id].push({q:s.name+' — Pregunta '+i+' (placeholder, edítala)',opts:['Opción A','Opción B','Opción C','Opción D'],correct:(i-1)%4,img:''})})});return b}
let CFG=load(K_CFG,DEFAULT_CFG),BANK=load(K_BANK,buildBank()),RES=load(K_RES,[]),STUDENTS=load(K_STUD,[]);
['coordPass','grupos','ciclos','activeCiclo','escala','timeMin','shuffle','pass'].forEach(k=>{if(CFG[k]===undefined)CFG[k]=DEFAULT_CFG[k]});
LEVELS.forEach(l=>{if(!BANK[l.id])BANK[l.id]={};subjectsOf(l.id).forEach(s=>{if(!BANK[l.id][s.id])BANK[l.id][s.id]=buildBank()[l.id][s.id]})});
seedDemo();

/* ====== AVISOS / HELPERS (idénticos a la Completa) ====== */
function toast(msg,type){let w=document.querySelector('.ui-toast-wrap');if(!w){w=document.createElement('div');w.className='ui-toast-wrap';document.body.appendChild(w)}const t=document.createElement('div');t.className='ui-toast'+(type?' '+type:'');t.textContent=msg;w.appendChild(t);requestAnimationFrame(()=>t.classList.add('on'));setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),250)},2800)}
function uiModal(o){return new Promise(res=>{const ov=document.createElement('div');ov.className='ui-ov';const ih=o.input?'<input type="'+(o.itype||'text')+'" id="uiIn" autocomplete="off" placeholder="'+(o.placeholder||'')+'" value="'+((o.value||'')+'').replace(/"/g,'&quot;')+'">':'';const ch=o.cancelText?'<button class="btn sec sm" id="uiCancel">'+o.cancelText+'</button>':'';ov.innerHTML='<div class="ui-modal">'+(o.title?'<h4>'+o.title+'</h4>':'')+'<p>'+o.msg+'</p>'+ih+'<div class="acts">'+ch+'<button class="btn sm'+(o.danger?' danger':'')+'" id="uiOk">'+(o.okText||'Aceptar')+'</button></div></div>';document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('on'));const inEl=ov.querySelector('#uiIn');if(inEl)setTimeout(()=>inEl.select(),60);const close=v=>{ov.classList.remove('on');setTimeout(()=>ov.remove(),200);res(v)};ov.querySelector('#uiOk').onclick=()=>close(o.input?inEl.value:true);const c=ov.querySelector('#uiCancel');if(c)c.onclick=()=>close(o.input?null:false);ov.addEventListener('click',e=>{if(e.target===ov)close(o.input?null:false)});if(inEl)inEl.addEventListener('keydown',e=>{if(e.key==='Enter')close(inEl.value);if(e.key==='Escape')close(null)})})}
function uiAlert(m,t){return uiModal({title:t||'Aviso',msg:m,okText:'Entendido'})}
function uiConfirm(m,t,d){return uiModal({title:t||'Confirmar',msg:m,okText:'Sí',cancelText:'Cancelar',danger:d})}
function esc(s){return String(s==null?'':s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}
function jss(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,'\\u0027').replace(/"/g,'&quot;').replace(/</g,'\\u003C').replace(/\r?\n/g,' ')}
function nivel(p){if(p>=90)return{txt:'Sobresaliente',col:'var(--verde)'};if(p>=70)return{txt:'Satisfactorio',col:'var(--azul2)'};if(p>=CFG.pass)return{txt:'Básico',col:'var(--naranja)'};return{txt:'Insuficiente',col:'var(--rojo)'}}
function downloadFile(content,name,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}

/* ====== NAVEGACIÓN ====== */
const VIEWS=['vHub','vCode','vQuiz','vThanks','vLogin','vAdmin'];
function show(id){VIEWS.forEach(v=>document.getElementById(v).classList.add('hidden'));document.getElementById(id).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});if(window.anime)anime({targets:'#'+id,opacity:[0,1],translateY:[12,0],easing:'easeOutQuad',duration:420})}
function applyBranding(){document.getElementById('hdrSchool').textContent=CFG.school;setLogo('hdrLogo')}
function setLogo(id){const el=document.getElementById(id);if(CFG.logo){const png=/^data:image\/png/i.test(CFG.logo);el.style.background=png?'#fff':'';el.style.padding=png?'4px':'';el.innerHTML='<img src="'+CFG.logo+'" style="object-fit:'+(png?'contain':'cover')+'">'}else{el.style.background='';el.style.padding='';el.textContent=(CFG.school||'R').trim().charAt(0).toUpperCase()}}
function goHub(){stopTimer();applyBranding();document.getElementById('hubCiclo').textContent='Nuevo Ingreso · Ciclo '+CFG.activeCiclo;show('vHub')}
function goCode(){document.getElementById('inCode').value='';show('vCode');setTimeout(()=>document.getElementById('inCode').focus(),120)}

/* ====== ALUMNO / CÓDIGO ====== */
function genCode(){let c;const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';do{c='';for(let i=0;i<6;i++)c+=ch[Math.random()*ch.length|0]}while(STUDENTS.some(s=>s.code===c));return c}
function validateCode(){const code=(document.getElementById('inCode').value||'').trim().toUpperCase();if(!code){toast('Escribe tu código.','warn');return}const st=STUDENTS.find(s=>s.code===code);if(!st){toast('Código no válido.','err');return}if(st.status==='completed'){uiAlert('Este examen ya fue contestado con este código.','Código ya usado');return}launchExam(st);}
let quiz=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function remap(q){const o=CFG.shuffle?shuffle([0,1,2,3]):[0,1,2,3];return{opts:o.map(i=>q.opts[i]),correct:o.indexOf(q.correct)}}
function launchExam(st){const level=st.level||LV;const pack=sid=>BANK[level][sid].map(q=>({subj:sid,q:q.q,img:q.img||'',...remap(q)}));let items=[];subjectsOf(level).forEach(s=>items.push(...pack(s.id)));if(CFG.shuffle)items=shuffle(items);items.forEach(it=>it.ans=null);quiz={items,idx:0,level,name:st.name,group:st.group||'',sEmail:st.sEmail||'',tEmail:st.tEmail||'',ciclo:st.ciclo||CFG.activeCiclo,studentCode:st.code};window.__lastQ=-1;show('vQuiz');renderQ();startTimer()}
function renderQ(){const it=quiz.items[quiz.idx],n=quiz.items.length;document.getElementById('qSubject').textContent=subjName(quiz.level,it.subj);document.getElementById('qCounter').textContent=(quiz.idx+1)+' / '+n;document.getElementById('qBar').style.width=(quiz.idx/n*100)+'%';document.getElementById('qImgWrap').innerHTML=it.img?'<img class="qimg" src="'+it.img+'">':'';document.getElementById('qText').textContent=it.q;const c=document.getElementById('qOpts');c.innerHTML='';const K=['A','B','C','D'];it.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='opt'+(it.ans===i?' sel':'');b.innerHTML='<span class="key">'+K[i]+'</span><span>'+esc(o)+'</span>';b.onclick=()=>{it.ans=i;renderQ()};c.appendChild(b)});document.getElementById('qPrev').style.visibility=quiz.idx===0?'hidden':'visible';document.getElementById('qNext').textContent=quiz.idx===n-1?'Terminar ✓':'Siguiente →';if(window.anime&&window.__lastQ!==quiz.idx){window.__lastQ=quiz.idx;anime({targets:'#qText,#qImgWrap',opacity:[0,1],translateX:[14,0],easing:'easeOutQuad',duration:340});anime({targets:'#qOpts .opt',opacity:[0,1],translateY:[10,0],delay:anime.stagger(45),easing:'easeOutQuad',duration:340})}}
async function nextQ(){const it=quiz.items[quiz.idx];if(it.ans===null){if(!await uiConfirm('No has respondido esta pregunta. ¿Continuar?','Sin responder'))return}if(quiz.idx<quiz.items.length-1){quiz.idx++;renderQ()}else finishQuiz()}
function prevQ(){if(quiz.idx>0){quiz.idx--;renderQ()}}
async function abortarQuiz(){if(await uiConfirm('¿Salir del examen? No se guardará nada.','Salir'))goHub()}
let _tInt=null,_tLeft=0;
function fmtT(s){const m=Math.floor(s/60),x=s%60;return(m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function startTimer(){stopTimer();const el=document.getElementById('qTimer');if(!CFG.timeMin||CFG.timeMin<=0){el.style.display='none';return}_tLeft=CFG.timeMin*60;el.style.display='';el.textContent='⏱️ '+fmtT(_tLeft);_tInt=setInterval(()=>{_tLeft--;el.textContent='⏱️ '+fmtT(Math.max(0,_tLeft));if(_tLeft<=0){stopTimer();toast('Se acabó el tiempo.','warn');finishQuiz()}},1000)}
function stopTimer(){if(_tInt){clearInterval(_tInt);_tInt=null}const el=document.getElementById('qTimer');if(el)el.style.display='none'}
function finishQuiz(){stopTimer();const total=quiz.items.length;let hits=0;const per={};quiz.items.forEach(it=>{const ok=it.ans===it.correct;if(ok)hits++;if(!per[it.subj])per[it.subj]={hits:0,total:0};per[it.subj].total++;if(ok)per[it.subj].hits++});const pct=Math.round(hits/total*100),nv=nivel(pct);const rec={id:'F'+Date.now().toString(36).toUpperCase(),folio:'F'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,7).toUpperCase(),date:new Date().toLocaleString('es-MX'),ts:Date.now(),name:quiz.name,group:quiz.group,ciclo:quiz.ciclo,level:quiz.level,sEmail:quiz.sEmail,tEmail:quiz.tEmail,mode:'__all__',subject:'Examen completo',hits,total,pct,grade:pct,level_perf:nv.txt,per,printed:false,emailed:false};RES.push(rec);if(quiz.studentCode){const st=STUDENTS.find(s=>s.code===quiz.studentCode);if(st){st.status='completed';st.resultId=rec.id;save(K_STUD,STUDENTS)}}save(K_RES,RES);show('vThanks');if(window.anime){anime({targets:'#thanksIco',scale:[0,1],easing:'easeOutElastic(1,.6)',duration:900});anime({targets:'#thanksIco svg path',strokeDashoffset:[anime.setDashoffset,0],easing:'easeOutQuad',duration:700,delay:300})}}

/* ====== LOGIN (solo Coordinación) ====== */
function goLogin(){document.getElementById('loginPass').value='';show('vLogin')}
function doLogin(){const p=document.getElementById('loginPass').value;if(p!==(CFG.coordPass||'coord2026')){toast('Contraseña incorrecta.','err');return}enterPanel()}
function logout(){goHub()}
function enterPanel(){document.getElementById('adminTitle').textContent='👑 Coordinación';const tabs=[['cal','Calificaciones'],['alum','Alumnos'],['preg','Preguntas'],['cfg','Configuración']];document.getElementById('adminTabs').innerHTML=tabs.map((t,i)=>'<button class="tab'+(i===0?' on':'')+'" data-tab="'+t[0]+'" onclick="adminTab(\''+t[0]+'\')">'+t[1]+'</button>').join('');fillCalFilters();renderCalif();fillEditSubjects();fillStudentGroups();show('vAdmin');adminTab('cal')}
function adminTab(t){document.querySelectorAll('#adminTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));document.querySelectorAll('#vAdmin .tabpane').forEach(p=>p.classList.add('hidden'));const map={cal:'tabCal',alum:'tabAlumnos',preg:'tabPreg',cfg:'tabCfg'};document.getElementById(map[t]).classList.remove('hidden');if(t==='cfg'){fillConfigForm();renderCats()}if(t==='alum'){fillStudentGroups();renderRoster()}if(t==='preg')renderEditor()}

/* ====== CALIFICACIONES ====== */
function fillCalFilters(){const fg=document.getElementById('fGroup'),fc=document.getElementById('fCiclo');fg.innerHTML=['(Todos los grupos)',...CFG.grupos].map((g,i)=>'<option value="'+(i===0?'':esc(g))+'">'+esc(g)+'</option>').join('');fc.innerHTML=['(Todos los ciclos)',...CFG.ciclos].map((c,i)=>'<option value="'+(i===0?'':esc(c))+'">'+esc(c)+'</option>').join('')}
function filteredRes(){const fg=document.getElementById('fGroup').value,fc=document.getElementById('fCiclo').value,fr=document.getElementById('fResult').value,q=(document.getElementById('fSearch').value||'').toLowerCase();return RES.filter(r=>(!fg||r.group===fg)&&(!fc||r.ciclo===fc)&&(!q||(r.name||'').toLowerCase().includes(q))).filter(r=>fr==='apro'?r.pct>=CFG.pass:fr==='repro'?r.pct<CFG.pass:true)}
function renderCalif(){const list=filteredRes();const n=list.length,avg=n?Math.round(list.reduce((a,r)=>a+r.pct,0)/n):0,apr=list.filter(r=>r.pct>=CFG.pass).length;document.getElementById('statChip').textContent=n;document.getElementById('calStats').innerHTML='<div class="stat"><b>'+n+'</b><small>Evaluaciones</small></div><div class="stat"><b>'+avg+'</b><small>Promedio</small></div><div class="stat"><b>'+apr+'</b><small>Suficientes</small></div><div class="stat"><b>'+(n?Math.round(apr/n*100):0)+'%</b><small>% Suficiente</small></div>';const cont=document.getElementById('calList');cont.innerHTML='';if(!n){cont.innerHTML='<p class="muted center" style="padding:24px">No hay evaluaciones que coincidan.</p>';return}
  const byCiclo={};list.forEach(r=>{(byCiclo[r.ciclo||'—']=byCiclo[r.ciclo||'—']||[]).push(r)});
  Object.keys(byCiclo).sort().forEach(cy=>{const grupos={};byCiclo[cy].forEach(r=>{(grupos[r.group||'Sin grupo']=grupos[r.group||'Sin grupo']||[]).push(r)});let inner='';Object.keys(grupos).sort().forEach(g=>{const rows=grupos[g].sort((a,b)=>a.ts-b.ts);let t='<details class="acc"><summary>Grupo '+esc(g)+' <span class="chip">'+rows.length+'</span></summary><div class="accbody"><table class="data"><thead><tr><th>Fecha</th><th>Alumno</th><th>Calif.</th><th>Resultado</th><th>Constancia</th><th></th></tr></thead><tbody>';rows.forEach(r=>{t+='<tr><td>'+esc(r.date)+'</td><td>'+esc(r.name)+'</td><td><b>'+r.pct+'</b></td><td><span class="lvl-tag" style="background:'+(r.pct>=CFG.pass?'var(--verde)':'var(--rojo)')+'">'+(r.pct>=CFG.pass?'Suficiente':'Insuficiente')+'</span></td><td><span class="badge '+(r.printed?'ok':'no')+'">'+(r.printed?'🖨️ Impresa':'No impresa')+'</span></td><td><button class="btn sm" onclick="abrirConstancia(\''+jss(r.id)+'\')">Ver</button></td></tr>'});t+='</tbody></table></div></details>';inner+=t});cont.insertAdjacentHTML('beforeend','<details class="acc" open><summary>Ciclo '+esc(cy)+' <span class="chip">'+byCiclo[cy].length+'</span></summary><div class="accbody">'+inner+'</div></details>')})}
function exportCSV(){const list=filteredRes();if(!list.length){toast('No hay resultados para exportar.','warn');return}const head=['Folio','Fecha','Alumno','Grupo','Ciclo','Aciertos','Total','Porcentaje','Resultado'];let csv='﻿'+head.join(',')+'\n';list.forEach(r=>{csv+=[r.folio,r.date,r.name,r.group,r.ciclo,r.hits,r.total,r.pct,(r.pct>=CFG.pass?'Suficiente':'Insuficiente')].map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')+'\n'});downloadFile(csv,'calificaciones.csv','text/csv')}

/* ====== CONSTANCIA ====== */
let certRec=null;
function abrirConstancia(id){const r=RES.find(x=>x.id===id);if(r)renderCert(r)}
function renderCert(rec){certRec=rec;const nv=nivel(rec.pct);document.getElementById('certSchool').textContent=CFG.school;document.getElementById('certSub').textContent=CFG.sub;setLogo('certLogo');document.getElementById('certName').textContent=rec.name;document.getElementById('certGroupLine').textContent=(rec.group?'Grupo: '+rec.group:'')+'  ·  '+levelName(rec.level)+(rec.ciclo?'  ·  Ciclo: '+rec.ciclo:'');document.getElementById('certSubject').textContent=rec.subject;const calif=Math.round(rec.hits/rec.total*(CFG.escala||10)*10)/10;document.getElementById('certGrade').textContent=calif+' / '+(CFG.escala||10);document.getElementById('certGrade').style.color=nv.col;document.getElementById('certLevel').textContent=nv.txt;document.getElementById('certPct').textContent=rec.pct;document.getElementById('certHits').textContent=rec.hits+'/'+rec.total;document.getElementById('certDirector').textContent=CFG.director;document.getElementById('certDirectorTitle').textContent=CFG.directorTitle;document.getElementById('certDate').textContent='Expedida: '+rec.date;document.getElementById('certFolio').textContent='Folio: '+rec.folio;const cb=document.getElementById('certBreakdown');cb.innerHTML='';if(rec.per){let h='<table class="bd-table" style="max-width:540px;margin:6px auto"><tr><th>Materia</th><th>Aciertos</th><th>%</th><th>Nivel</th></tr>';Object.keys(rec.per).forEach(sid=>{const p=rec.per[sid],pp=Math.round(p.hits/p.total*100),n2=nivel(pp);h+='<tr><td>'+subjName(rec.level,sid)+'</td><td>'+p.hits+'/'+p.total+'</td><td>'+pp+'%</td><td style="color:'+n2.col+';font-weight:700">'+n2.txt+'</td></tr>'});h+='</table>';cb.innerHTML=h}document.getElementById('app').style.display='none';document.getElementById('constancia').style.display='block';window.scrollTo({top:0})}
function cerrarConstancia(){document.getElementById('constancia').style.display='none';document.getElementById('app').style.display='block';show('vAdmin');adminTab('cal')}
function imprimirConstancia(){if(certRec){certRec.printed=true;save(K_RES,RES)}window.print()}

/* ====== ALUMNOS / ROSTER ====== */
function fillStudentGroups(){document.getElementById('sGroup').innerHTML=CFG.grupos.map(g=>'<option>'+esc(g)+'</option>').join('');document.getElementById('fSGroup').innerHTML='<option value="">(Todos)</option>'+CFG.grupos.map(g=>'<option>'+esc(g)+'</option>').join('')}
function addStudent(){const name=document.getElementById('sName').value.trim();if(!name){toast('Escribe el nombre del alumno.','warn');return}const code=genCode();STUDENTS.push({code,name,group:document.getElementById('sGroup').value||'',level:LV,mode:'all',origin:document.getElementById('sOrigin').value.trim(),originGroup:'',tEmail:document.getElementById('sTEmail').value.trim(),sEmail:'',status:'pending',resultId:null,ciclo:CFG.activeCiclo});save(K_STUD,STUDENTS);['sName','sOrigin','sTEmail'].forEach(i=>document.getElementById(i).value='');renderRoster();uiAlert('Alumno registrado.\n\nCÓDIGO DE ACCESO:  '+code+'\n\nEntrégaselo al alumno para presentar su examen.','✅ Código generado')}
function renderRoster(){const fg=(document.getElementById('fSGroup')||{}).value||'',fs=(document.getElementById('fSStatus')||{}).value||'',q=((document.getElementById('fSSearch')||{}).value||'').trim().toLowerCase();let list=STUDENTS.filter(s=>(!fg||s.group===fg)&&(!fs||s.status===fs)&&(!q||(s.name||'').toLowerCase().includes(q)||(s.code||'').toLowerCase().includes(q))).sort((a,b)=>(a.group||'').localeCompare(b.group||'')||a.name.localeCompare(b.name));const c=document.getElementById('rosterList');if(!list.length){c.innerHTML='<p class="muted center" style="padding:20px">'+(STUDENTS.length?'Ningún alumno coincide.':'No hay alumnos registrados.')+'</p>';return}c.innerHTML='<p class="muted" style="margin:0 0 8px">'+list.length+' alumno(s)</p><table class="data"><thead><tr><th>Código</th><th>Alumno</th><th>Grupo</th><th>Procedencia</th><th>Estado</th><th></th></tr></thead><tbody>'+list.map(s=>'<tr><td><b style="letter-spacing:1px">'+esc(s.code)+'</b></td><td>'+esc(s.name)+'</td><td>'+esc(s.group)+'</td><td>'+esc(s.origin||'—')+'</td><td><span class="badge '+(s.status==='completed'?'ok':'no')+'">'+(s.status==='completed'?'✓ Contestado':'Pendiente')+'</span></td><td><button class="btn sec sm" onclick="copyCode(\''+jss(s.code)+'\')">Copiar</button> <button class="btn sec sm" onclick="delStudent(\''+jss(s.code)+'\')">🗑️</button></td></tr>').join('')+'</tbody></table>'}
function copyCode(c){try{navigator.clipboard.writeText(c)}catch(e){}toast('Código copiado: '+c,'ok')}
async function delStudent(code){if(await uiConfirm('¿Quitar este alumno del listado?','Quitar',true)){STUDENTS=STUDENTS.filter(s=>s.code!==code);save(K_STUD,STUDENTS);renderRoster()}}
function exportRoster(){if(!STUDENTS.length){toast('No hay alumnos.','warn');return}const head=['Codigo','Alumno','Grupo','EscuelaProcedencia','Estado','CorreoTutor'];let csv='﻿'+head.join(',')+'\n';STUDENTS.forEach(s=>{csv+=[s.code,s.name,s.group,s.origin,s.status,s.tEmail].map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')+'\n'});downloadFile(csv,'alumnos_codigos.csv','text/csv')}

/* ====== EDITOR DE PREGUNTAS (Secundaria) ====== */
function fillEditSubjects(){document.getElementById('editSubject').innerHTML=subjectsOf(LV).map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join('');renderEditor()}
function curSid(){return document.getElementById('editSubject').value||subjectsOf(LV)[0].id}
function renderEditor(){const sid=curSid();const list=document.getElementById('editorList');list.innerHTML='';BANK[LV][sid].forEach((q,qi)=>{const d=document.createElement('div');d.className='qedit';let oh='';['A','B','C','D'].forEach((k,oi)=>{oh+='<div class="optline"><input type="radio" name="c_'+qi+'" '+(q.correct===oi?'checked':'')+' onchange="setCorrect('+qi+','+oi+')"><span class="key" style="width:24px;height:24px;font-size:12px">'+k+'</span><input type="text" value="'+esc(q.opts[oi])+'" oninput="setOpt('+qi+','+oi+',this.value)"></div>'});d.innerHTML='<div class="qtop"><label>Pregunta '+(qi+1)+'</label><button class="btn sec sm" onclick="delQuestion('+qi+')">🗑️</button></div><textarea rows="2" oninput="setQ('+qi+',this.value)">'+esc(q.q)+'</textarea><div class="opts4">'+oh+'</div>';list.appendChild(d)})}
function setQ(i,v){BANK[LV][curSid()][i].q=v}
function setOpt(i,o,v){BANK[LV][curSid()][i].opts[o]=v}
function setCorrect(i,o){BANK[LV][curSid()][i].correct=o}
function addQuestion(){BANK[LV][curSid()].push({q:'Nueva pregunta',opts:['','','',''],correct:0,img:''});renderEditor();const el=document.getElementById('editorList');el.lastElementChild.scrollIntoView({behavior:'smooth',block:'center'});toast('Pregunta agregada (recuerda Guardar).','ok')}
async function delQuestion(i){if(await uiConfirm('¿Borrar esta pregunta?','Borrar',true)){BANK[LV][curSid()].splice(i,1);renderEditor()}}
function saveBank(){save(K_BANK,BANK);toast('Banco guardado.','ok')}

/* ====== CONFIG ====== */
function fillConfigForm(){document.getElementById('cfgSchool').value=CFG.school;document.getElementById('cfgSub').value=CFG.sub;document.getElementById('cfgDirector').value=CFG.director;document.getElementById('cfgDirectorTitle').value=CFG.directorTitle;document.getElementById('cfgPass').value=CFG.pass;document.getElementById('cfgEscala').value=CFG.escala;document.getElementById('cfgTime').value=CFG.timeMin;document.getElementById('cfgShuffle').value=CFG.shuffle?'1':'0'}
function renderCats(){document.getElementById('catGrupos').innerHTML=CFG.grupos.length?CFG.grupos.map(x=>'<span class="chip-x">'+esc(x)+' <button onclick="delGrupo(\''+jss(x)+'\')">✕</button></span>').join(''):'<span class="muted">Sin grupos.</span>';document.getElementById('catCiclos').innerHTML=CFG.ciclos.length?CFG.ciclos.map(x=>'<span class="chip-x'+(x===CFG.activeCiclo?' act':'')+'"><span class="star" onclick="setActiveCiclo(\''+jss(x)+'\')">★</span> '+esc(x)+' <button onclick="delCiclo(\''+jss(x)+'\')">✕</button></span>').join(''):'<span class="muted">Sin ciclos.</span>'}
function addGrupo(){const v=document.getElementById('newGrupo').value.trim();if(!v)return;if(!CFG.grupos.includes(v))CFG.grupos.push(v);save(K_CFG,CFG);document.getElementById('newGrupo').value='';renderCats();fillCalFilters();fillStudentGroups();toast('Grupo agregado.','ok')}
async function delGrupo(g){if(await uiConfirm('¿Quitar el grupo "'+g+'"?','Quitar grupo',true)){CFG.grupos=CFG.grupos.filter(x=>x!==g);save(K_CFG,CFG);renderCats();fillCalFilters();fillStudentGroups()}}
function addCiclo(){const v=document.getElementById('newCiclo').value.trim();if(!v)return;if(!CFG.ciclos.includes(v))CFG.ciclos.push(v);save(K_CFG,CFG);document.getElementById('newCiclo').value='';renderCats();fillCalFilters();toast('Ciclo agregado.','ok')}
async function delCiclo(c){if(CFG.ciclos.length<=1){toast('Debe existir al menos un ciclo.','warn');return}if(await uiConfirm('¿Quitar el ciclo "'+c+'"?','Quitar ciclo',true)){CFG.ciclos=CFG.ciclos.filter(x=>x!==c);if(CFG.activeCiclo===c)CFG.activeCiclo=CFG.ciclos[0];save(K_CFG,CFG);renderCats();fillCalFilters()}}
function setActiveCiclo(c){CFG.activeCiclo=c;save(K_CFG,CFG);renderCats();toast('Ciclo activo: '+c,'ok')}
function saveConfig(){CFG.school=document.getElementById('cfgSchool').value.trim()||DEFAULT_CFG.school;CFG.sub=document.getElementById('cfgSub').value.trim();CFG.director=document.getElementById('cfgDirector').value.trim()||DEFAULT_CFG.director;CFG.directorTitle=document.getElementById('cfgDirectorTitle').value.trim();CFG.pass=Math.min(100,Math.max(0,parseInt(document.getElementById('cfgPass').value)||60));CFG.escala=Math.min(100,Math.max(1,parseInt(document.getElementById('cfgEscala').value)||10));CFG.timeMin=Math.min(300,Math.max(0,parseInt(document.getElementById('cfgTime').value)||0));CFG.shuffle=document.getElementById('cfgShuffle').value==='1'?1:0;save(K_CFG,CFG);applyBranding();toast('Configuración guardada.','ok')}

/* ====== SEED mínimo (demo) ====== */
function demoPer(){const p={};subjectsOf(LV).forEach(s=>{p[s.id]={hits:8+(Math.random()*12|0),total:20}});return p}
function seedDemo(){if(STUDENTS.length)return;const mk=(name,group,origin)=>({code:genCode(),name,group,level:LV,mode:'all',origin,originGroup:'',tEmail:'',sEmail:'',status:'pending',resultId:null,ciclo:CFG.activeCiclo});STUDENTS=[mk('Ana Sofía Ramírez','1.1','Primaria Benito Juárez'),mk('Diego Hernández Cruz','1.1','Colegio del Valle'),mk('María Fernanda López','1.2','Instituto Niños Héroes')];const r0=STUDENTS[0];const hits=16,pct=80,nv=nivel(pct);RES.push({id:'F'+Math.random().toString(36).slice(2,9).toUpperCase(),folio:'FDEMO-'+r0.code,date:new Date().toLocaleString('es-MX'),ts:Date.now(),name:r0.name,group:r0.group,ciclo:r0.ciclo,level:LV,sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits,total:100,pct,grade:pct,level_perf:nv.txt,per:demoPer(),printed:false,emailed:false});r0.status='completed';save(K_STUD,STUDENTS);save(K_RES,RES)}

/* ====== SPLASH ====== */
function splashFallback(img){img.parentNode.innerHTML='<div class="sp-letter">'+((CFG.school||'R').trim().charAt(0).toUpperCase())+'</div>'}
function playSplash(){const sp=document.getElementById('splash');if(!sp)return;const lg=document.getElementById('spLogo');if(CFG.logo){lg.innerHTML='<img src="'+CFG.logo+'" alt="logo" onerror="splashFallback(this)">'}else{lg.innerHTML='<div class="sp-letter">'+((CFG.school||'R').trim().charAt(0).toUpperCase())+'</div>'}const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;if(!window.anime||reduce){setTimeout(()=>{sp.style.transition='opacity .4s';sp.style.opacity='0';setTimeout(()=>sp.remove(),420)},800);return}
  anime.timeline({easing:'easeOutQuad'})
   .add({targets:'.sp-lines i',translateX:['-160%','0%'],delay:anime.stagger(80),duration:650})
   .add({targets:'#spLogo',scale:[0.5,1],opacity:[0,1],duration:600,easing:'easeOutBack'},'-=350')
   .add({targets:'#spLogo',translateX:-Math.round(window.innerWidth*0.62),rotate:'-4deg',duration:720,easing:'easeInCubic'},'+=420')
   .add({targets:'.sp-lines i',translateX:'160%',delay:anime.stagger(55),duration:600,easing:'easeInQuad'},'-=680')
   .add({targets:'#splash',opacity:0,duration:450,complete:()=>sp.remove()},'-=180')}
goHub();playSplash();
`;

const out = HEAD + JS + '\n</script>\n</body>\n</html>\n';
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), out, 'utf8');
// copiar assets
for (const a of ['anime.min.js','mascota.png']) {
  const src = path.join(path.dirname(FULL), a);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUTDIR, a));
}
console.log('LITE generada en', OUTDIR, '·', (out.length/1024).toFixed(0)+'KB');
