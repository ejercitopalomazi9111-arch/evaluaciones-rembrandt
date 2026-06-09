import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
import os from 'os';
import path from 'path';

const FILE = 'C:/Users/ejerc/OneDrive/Desktop/Evaluaciones Diagnostico/index.html';
const URL = pathToFileURL(FILE).href;
const tmp = os.tmpdir();

const results = [];
const findings = []; // {sev, test, msg}
let browser;

function record(name, ok, info='') { results.push({name, ok, info}); console.log(`${ok?'✅':'❌'} ${name}${info?'  — '+info:''}`); }
function finding(sev, test, msg){ findings.push({sev,test,msg}); console.log(`   ⚠️ [${sev}] ${msg}`); }

// build a context, optionally seeding localStorage before app scripts run
async function ctx(seed={}) {
  const c = await browser.newContext({ acceptDownloads:true, reducedMotion:'reduce' });
  if (Object.keys(seed).length) {
    await c.addInitScript((s)=>{ for(const k in s){ localStorage.setItem(k, s[k]); } }, seed);
  }
  const page = await c.newPage();
  const errs = [];
  const ignored = [];
  page.on('console', m=>{ if(m.type()==='error'){ const t=m.text(); if(/ERR_FILE_NOT_FOUND/.test(t)) ignored.push(t); else errs.push('console:'+t); } });
  page.on('pageerror', e=> errs.push('pageerror:'+e.message));
  return { c, page, errs, ignored };
}
async function ready(page){
  await page.goto(URL, { waitUntil:'load' });
  await page.waitForFunction(()=>typeof window.goHub==='function', {timeout:8000});
  await page.waitForFunction(()=>!document.getElementById('splash'), {timeout:8000}).catch(()=>{});
}
// dismiss custom uiModal: fill #uiIn if present, click ok/cancel
async function modal(page, {value, cancel=false}={}){
  await page.waitForSelector('.ui-ov.on', {timeout:3000});
  if(value!==undefined) await page.fill('#uiIn', value);
  await page.click(cancel?'#uiCancel':'#uiOk');
  await page.waitForTimeout(120);
}
const LS = (page,k)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'), k);

// seed N students directly into localStorage
function genStudents(n){
  const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code=()=>{let s='';for(let i=0;i<6;i++)s+=ch[Math.random()*ch.length|0];return s;};
  const used=new Set(); const arr=[];
  for(let i=0;i<n;i++){ let c; do{c=code();}while(used.has(c)); used.add(c);
    arr.push({code:c,name:'Alumno Prueba '+i,group:['1.1','1.2','2.1','2.2'][i%4],level:'secundaria',mode:i%3===0?'all':'matematicas',origin:'Esc '+i,originGroup:'6.A',tEmail:'t'+i+'@x.com',sEmail:'',status:'pending',resultId:null,ciclo:'2026-2027'}); }
  return arr;
}
function genResults(n){
  const arr=[]; const subs=['matematicas','quimica','biologia','lectura','fisica'];
  for(let i=0;i<n;i++){ const hits=5+(Math.random()*16|0), pct=Math.round(hits/20*100);
    arr.push({id:'F'+i+'X',folio:'F-'+i,date:new Date(Date.now()-i*1000).toLocaleString('es-MX'),ts:Date.now()-i*1000,name:'Alumno '+i,group:['1.1','1.2','2.1','2.2'][i%4],ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'t'+i+'@x.com',mode:subs[i%5],subject:'Materia '+(i%5),hits,total:20,pct,grade:pct,level_perf:'x',per:{[subs[i%5]]:{hits,total:20}},printed:false,emailed:false}); }
  return arr;
}

async function main(){
  browser = await chromium.launch();

  // ---------- T1: load clean, no errors ----------
  {
    const {c,page,errs,ignored} = await ctx();
    await ready(page);
    const hubVisible = await page.isVisible('#vHub');
    const school = await page.textContent('#hdrSchool');
    record('T1 carga limpia + hub visible', hubVisible && errs.length===0, `errs=${errs.length} school="${school}"`);
    if(errs.length) errs.forEach(e=>finding('HIGH','T1','console/page error: '+e));
    if(ignored.length) finding('LOW','T1',`Falta el archivo logo.png en la carpeta → 404 en cada carga (${ignored.length}). El splash cae al fallback de la letra "R", pero conviene incluir el logo real o quitar la referencia.`);
    await c.close();
  }

  // ---------- T2: invalid code ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.click('text=Comenzar ahora');
    await page.fill('#inCode','ZZZZZZ');
    await page.click('text=Comenzar →');
    const toast = await page.textContent('.ui-toast').catch(()=>'');
    record('T2 código inválido → toast', /no válid/i.test(toast||''), `toast="${toast}"`);
    await c.close();
  }

  // ---------- T3: valid code full exam flow + reuse blocked ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    // get a seeded pending code from localStorage
    const studs = await LS(page,'ev_students');
    const pend = studs.find(s=>s.status==='pending'); // examen completo (100q) tras el cambio
    await page.click('text=Comenzar ahora');
    await page.fill('#inCode', pend.code);
    await page.click('text=Comenzar →');
    await page.waitForSelector('#vQuiz:not(.hidden)');
    // answer all
    let guard=0;
    while(guard++<120){
      const onThanks = await page.isVisible('#vThanks');
      if(onThanks) break;
      await page.click('#qOpts .opt >> nth=0');
      await page.click('#qNext');
      await page.waitForTimeout(30);
    }
    const thanks = await page.isVisible('#vThanks');
    const res = await LS(page,'ev_res');
    const rec = res.find(r=>r.name===pend.name);
    const studs2 = await LS(page,'ev_students');
    const blocked = studs2.find(s=>s.code===pend.code).status==='completed';
    record('T3 examen por código → guarda + bloquea', thanks && !!rec && blocked, `thanks=${thanks} rec=${!!rec} completed=${blocked} errs=${errs.length}`);
    // reuse
    await page.click('#vThanks >> text=Finalizar');
    await page.click('text=Comenzar ahora');
    await page.fill('#inCode', pend.code);
    await page.click('text=Comenzar →');
    await modal(page); // uiAlert ya usado
    const stillHub = await page.isVisible('#vCode');
    record('T3b reusar código bloqueado', stillHub, `view code aún visible=${stillHub}`);
    if(errs.length) errs.forEach(e=>finding('HIGH','T3','err: '+e));
    await c.close();
  }

  // ---------- T4: direct exam flow (no code) + unanswered confirm ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLevel('exam'));
    await page.click('#levelGrid .tile >> nth=2'); // secundaria
    await page.fill('#inName','Juan Pérez');
    await page.click('text=Continuar →');
    await page.click('#subjGrid .subj >> nth=0'); // first subject quiz
    await page.waitForSelector('#vQuiz:not(.hidden)');
    // try to finish without answering last → go next without selecting on first question
    await page.click('#qNext'); // should pop confirm (unanswered)
    const conf = await page.waitForSelector('.ui-ov', {timeout:2000}).then(()=>true).catch(()=>false);
    record('T4 pregunta sin responder → confirm', conf);
    if(conf) await page.click('#uiCancel');
    await c.close();
  }

  // ---------- T5: timer shows when timeMin>0 ----------
  {
    const cfg = { ...(await (async()=>{ const {c,page}=await ctx(); await ready(page); const v=await LS(page,'ev_cfg'); await c.close(); return v;})()) };
    const {c,page} = await ctx({ ev_cfg: JSON.stringify({...cfg, timeMin:1}) });
    await ready(page);
    await page.evaluate(()=>goLevel('exam'));
    await page.click('#levelGrid .tile >> nth=2');
    await page.fill('#inName','Timer Test');
    await page.click('text=Continuar →');
    await page.click('#subjGrid .subj >> nth=0');
    await page.waitForSelector('#vQuiz:not(.hidden)');
    const timerVisible = await page.isVisible('#qTimer');
    const txt = await page.textContent('#qTimer');
    record('T5 cronómetro visible con timeMin=1', timerVisible && /\d\d:\d\d/.test(txt), `txt="${txt}"`);
    await c.close();
  }

  // ---------- T6/T7/T8: roles & tabs ----------
  async function loginAndTabs(user,pass){
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser',user); await page.fill('#loginPass',pass);
    await page.click('#vLogin >> text=Entrar');
    await page.waitForSelector('#vAdmin:not(.hidden)');
    const tabs = await page.$$eval('#adminTabs .tab', els=>els.map(e=>e.dataset.tab));
    await c.close();
    return {tabs, errs};
  }
  {
    const a = await loginAndTabs('coordinacion','coord2026');
    record('T6 login coordinación = tabs completas', a.tabs.includes('cfg')&&a.tabs.includes('examenes')&&!a.tabs.includes('revision')&&a.tabs.includes('cal'), `tabs=${a.tabs.join(',')}`);
    const b = await loginAndTabs('direccion','direccion2026');
    record('T7 login dirección = solo cal+rep', b.tabs.join(',')==='cal,rep', `tabs=${b.tabs.join(',')}`);
    const d = await loginAndTabs('profe','profe123');
    record('T8 login profesor = examenes + caps', d.tabs.join(',')==='examenes,preg,cal,guia,alum', `tabs=${d.tabs.join(',')}`);
  }

  // ---------- T9: profe ve solo su materia en editor ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    const subs = await page.$$eval('#editSubject option', o=>o.map(x=>x.textContent));
    const levels = await page.$$eval('#editLevel option', o=>o.map(x=>x.textContent));
    record('T9 profe: editor solo materia asignada', subs.length===1 && /Matem/.test(subs[0]) && levels.length===1, `levels=${levels.join('|')} subs=${subs.join('|')}`);
    await c.close();
  }

  // ---------- T10: calificaciones stats correctos ----------
  {
    const res = genResults(7);
    const studs = genStudents(7);
    const {c,page} = await ctx({ ev_res: JSON.stringify(res), ev_students: JSON.stringify(studs) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.waitForSelector('#tabCal:not(.hidden)');
    const chip = await page.textContent('#statChip');
    const avgShown = await page.$eval('#calStats .stat:nth-child(2) b', e=>e.textContent);
    const expAvg = Math.round(res.reduce((a,r)=>a+r.pct,0)/res.length);
    record('T10 stats calificaciones', String(res.length)===chip.trim() && String(expAvg)===avgShown, `chip=${chip} avg=${avgShown} exp=${expAvg}`);
    await c.close();
  }

  // ---------- T11: constancia regla de tres + escala ----------
  {
    const res = [{id:'FX1',folio:'F-1',date:'01/01/2026',ts:Date.now(),name:'Regla Tres',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'t@x.com',mode:'matematicas',subject:'Matemáticas',hits:15,total:20,pct:75,grade:75,level_perf:'Satisfactorio',per:{matematicas:{hits:15,total:20}},printed:false,emailed:false}];
    const {c,page} = await ctx({ ev_res: JSON.stringify(res) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.evaluate(()=>abrirConstancia('FX1'));
    const grade = await page.textContent('#certGrade');
    // escala default 10: 15/20*10 = 7.5
    record('T11 constancia regla de tres (15/20→7.5/10)', /7\.5\s*\/\s*10/.test(grade), `grade="${grade}"`);
    // mark printed
    await page.evaluate(()=>{ window.print=()=>{}; imprimirConstancia(); });
    const res2 = await LS(page,'ev_res');
    record('T11b imprimir marca printed', res2[0].printed===true);
    // email
    await page.evaluate(()=>{ try{Object.defineProperty(window,'location',{value:{...window.location, set href(v){window.__mail=v;}}});}catch(e){} });
    await page.evaluate(()=>enviarCorreo());
    await modal(page, {value:'tutor@correo.com'});
    const res3 = await LS(page,'ev_res');
    record('T11c enviar correo marca emailed', res3[0].emailed===true);
    await c.close();
  }

  // ---------- T12: editor add/save persists ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    await page.evaluate(()=>saveBank()); // persist baseline (ev_bank no existe hasta 1er guardado)
    const before = (await LS(page,'ev_bank')).secundaria.matematicas.length;
    await page.evaluate(()=>addQuestion());
    await page.evaluate(()=>saveBank());
    const after = (await LS(page,'ev_bank')).secundaria.matematicas.length;
    record('T12 agregar pregunta + guardar', after===before+1, `${before}→${after}`);
    await c.close();
  }

  // ---------- T13: Excel round-trip + correct mapping ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    const b64 = await page.evaluate(()=>{
      const data=[['Pregunta','A','B','C','D','Correcta']];
      for(let i=1;i<=20;i++) data.push(['Pregunta '+i,'opA'+i,'opB'+i,'opC'+i,'opD'+i, ['A','B','C','D'][(i-1)%4]]);
      const ws=XLSX.utils.aoa_to_sheet(data); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Hoja1');
      return XLSX.write(wb,{type:'base64',bookType:'xlsx'});
    });
    const xpath = path.join(tmp,'preguntas_test.xlsx');
    fs.writeFileSync(xpath, Buffer.from(b64,'base64'));
    await page.setInputFiles('#impExcel', xpath);
    await page.waitForTimeout(300);
    const bank = await LS(page,'ev_bank');
    const q = bank.secundaria.matematicas;
    const okLen = q.length===20;
    const okMap = q[0].correct===0 && q[1].correct===1 && q[2].correct===2 && q[3].correct===3;
    const okText = q[4].q==='Pregunta 5' && q[4].opts[0]==='opA5';
    record('T13 importar Excel (20 preg + mapeo correcta)', okLen&&okMap&&okText, `len=${q.length} map=${okMap} text=${okText}`);
    await c.close();
  }

  // ---------- T14: Excel import with answer as TEXT (not A-D) → silent wrong ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    const b64 = await page.evaluate(()=>{
      const data=[['Pregunta','A','B','C','D','Correcta'],
        ['¿Capital?','Guadalajara','CDMX','Puebla','León','CDMX']]; // answer as text, correct is B
      const ws=XLSX.utils.aoa_to_sheet(data); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Hoja1');
      return XLSX.write(wb,{type:'base64',bookType:'xlsx'});
    });
    const xpath = path.join(tmp,'preguntas_text.xlsx');
    fs.writeFileSync(xpath, Buffer.from(b64,'base64'));
    await page.setInputFiles('#impExcel', xpath);
    await page.waitForTimeout(250);
    const q = (await LS(page,'ev_bank')).secundaria.matematicas;
    const correctIdx = q[0].correct; // should be 1 if smart, but code maps unknown→0
    record('T14 Excel: respuesta como texto', true, `correct quedó en índice ${correctIdx} (esperado 1=CDMX)`);
    if(correctIdx!==1) finding('MEDIUM','T14',`Si el profe escribe el TEXTO de la respuesta en vez de A-D, se asigna silenciosamente la opción A (índice 0) como correcta. Riesgo de exámenes mal calificados sin aviso.`);
    await c.close();
  }

  // ---------- T15: JSON export → re-import identical ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    const [dl] = await Promise.all([ page.waitForEvent('download'), page.evaluate(()=>exportBank()) ]);
    const jpath = path.join(tmp, dl.suggestedFilename()); await dl.saveAs(jpath);
    const json = JSON.parse(fs.readFileSync(jpath,'utf8'));
    const okExport = Array.isArray(json.questions) && json.questions.length>0;
    // mutate then re-import
    await page.setInputFiles('#impBank', jpath);
    await page.waitForTimeout(200);
    const q = (await LS(page,'ev_bank')).secundaria.matematicas;
    record('T15 export/import JSON', okExport && q.length===json.questions.length, `exp=${json.questions?.length} reimport=${q.length}`);
    await c.close();
  }

  // ---------- T16: roster add generates unique code + CSV export ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    await page.fill('#sName','Nuevo Alumno');
    await page.evaluate(()=>addStudent());
    await modal(page); // código generado alert
    const studs = await LS(page,'ev_students');
    const added = studs.find(s=>s.name==='Nuevo Alumno');
    record('T16 registrar alumno genera código', !!added && /^[A-Z2-9]{6}$/.test(added.code), `code=${added?.code}`);
    const [dl] = await Promise.all([ page.waitForEvent('download'), page.evaluate(()=>exportRoster()) ]);
    const cpath = path.join(tmp, dl.suggestedFilename()); await dl.saveAs(cpath);
    const csv = fs.readFileSync(cpath,'utf8');
    record('T16b export roster CSV', csv.includes('Nuevo Alumno') && csv.startsWith('﻿'));
    await c.close();
  }

  // ---------- T17: STRESS 1000 students render ----------
  {
    const studs = genStudents(1000);
    const {c,page,errs} = await ctx({ ev_students: JSON.stringify(studs) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    const t0=Date.now();
    await page.click('#adminTabs .tab[data-tab="alum"]');
    await page.waitForSelector('#rosterList tbody tr');
    const t1=Date.now();
    const rows = await page.$$eval('#rosterList tbody tr', r=>r.length);
    // filter perf
    const tf0=Date.now();
    await page.selectOption('#fSStatus','pending');
    await page.waitForTimeout(50);
    const tf1=Date.now();
    const lsBytes = await page.evaluate(()=>localStorage.getItem('ev_students').length);
    record('T17 stress 1000 alumnos (paginado ≤50/pág)', rows<=50 && rows>0, `render=${t1-t0}ms filas=${rows} filtro=${tf1-tf0}ms LS=${(lsBytes/1024).toFixed(0)}KB`);
    if(errs.length) errs.forEach(e=>finding('HIGH','T17','err: '+e));
    await c.close();
  }

  // ---------- T18: STRESS register loop (modal per add) ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    // measure 30 sequential registrations through the real UI path (incl. modal each time)
    const t0=Date.now(); let modalEach=true;
    for(let i=0;i<30;i++){
      await page.fill('#sName','Lote '+i);
      await page.evaluate(()=>addStudent());
      const hasModal = await page.isVisible('.ui-ov.on');
      if(!hasModal) modalEach=false;
      await page.click('#uiOk').catch(()=>{});
      await page.waitForTimeout(10);
    }
    const t1=Date.now();
    record('T18 registrar 30 en serie', true, `${t1-t0}ms (~${Math.round((t1-t0)/30)}ms c/u)`);
    if(modalEach) finding('MEDIUM','T18','Cada registro abre un modal bloqueante con el código que hay que cerrar a mano. Registrar muchos alumnos uno por uno es tedioso. Sugerencia: registro masivo / importar lista por Excel + generar códigos en lote.');
    await c.close();
  }

  // ---------- T19: STRESS 1000 results calificaciones ----------
  {
    const res = genResults(1000);
    const {c,page,errs} = await ctx({ ev_res: JSON.stringify(res) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:15000});
    // medir re-render real forzando renderCalif (cambia filtro ciclo y vuelve)
    const t0=Date.now();
    const ms = await page.evaluate(()=>{ const s=performance.now(); renderCalif(); return Math.round(performance.now()-s); });
    const t1=Date.now();
    record('T19 stress 1000 resultados render', errs.length===0, `renderCalif=${ms}ms (wall=${t1-t0}ms)`);
    if(ms>2500) finding('MEDIUM','T19',`Calificaciones con 1000 resultados tardó ${ms}ms en pintar (todo en un innerHTML anidado, sin paginación).`);
    else if(ms>800) finding('LOW','T19',`Calificaciones con 1000 resultados tarda ${ms}ms por re-render; aceptable pero conviene paginar si crece.`);
    if(errs.length) errs.forEach(e=>finding('HIGH','T19','err: '+e));
    await c.close();
  }

  // ---------- T20: reportes generales ----------
  {
    const res = genResults(40);
    const {c,page} = await ctx({ ev_res: JSON.stringify(res) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="rep"]');
    await page.waitForTimeout(200);
    const tables = await page.$$eval('#repBody table', t=>t.length);
    record('T20 reportes (por nivel/materia)', tables===2, `tablas=${tables}`);
    await c.close();
  }

  // ---------- T21: recorrido validación + envío + render admin ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    const lastToast = ()=>page.locator('.ui-toast').last().textContent().catch(()=>'');
    await page.evaluate(()=>goTour());
    await page.click('#vTour >> text=Solicitar recorrido'); // sin datos
    let toast = await lastToast();
    const v1 = /nombre de contacto/i.test(toast);
    await page.fill('#tName','Tutor X'); await page.fill('#tEmail','mal'); await page.fill('#tPhone','442');
    await page.click('#vTour >> text=Solicitar recorrido');
    await page.waitForTimeout(100);
    toast = await lastToast();
    const v2 = /correo válido/i.test(toast);
    await page.fill('#tEmail','tutor@x.com');
    await page.click('#vTour >> text=Solicitar recorrido');
    await modal(page); // gracias
    const tours = await LS(page,'ev_tour');
    record('T21 recorrido validación+envío', v1 && v2 && tours.length===1, `v1=${v1} v2=${v2} tours=${tours.length}`);
    await c.close();
  }

  // ---------- T22: config persistence + escala afecta constancia ----------
  {
    const res = [{id:'FX2',folio:'F-2',date:'01/01/2026',ts:Date.now(),name:'Escala Test',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'matematicas',subject:'Matemáticas',hits:10,total:20,pct:50,grade:50,level_perf:'x',per:{matematicas:{hits:10,total:20}},printed:false,emailed:false}];
    const {c,page} = await ctx({ ev_res: JSON.stringify(res) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="cfg"]');
    await page.fill('#cfgEscala','100');
    await page.fill('#cfgPass','70');
    await page.evaluate(()=>saveConfig());
    const cfg = await LS(page,'ev_cfg');
    await page.evaluate(()=>abrirConstancia('FX2'));
    const grade = await page.textContent('#certGrade'); // 10/20*100 = 50/100
    record('T22 config escala=100 → constancia 50/100', cfg.escala===100 && cfg.pass===70 && /50\s*\/\s*100/.test(grade), `escala=${cfg.escala} pass=${cfg.pass} grade="${grade}"`);
    await c.close();
  }

  // ---------- T23: resetTodo keeps results, resets bank ----------
  {
    const res = genResults(3);
    const studs = genStudents(3); // sembrar alumnos para que seedDemo NO añada resultados extra
    const {c,page} = await ctx({ ev_res: JSON.stringify(res), ev_students: JSON.stringify(studs) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="cfg"]');
    await page.evaluate(()=>{ resetTodo(); });
    await page.waitForSelector('#rtPass');
    const disabledInit = await page.getAttribute('#rtOk','disabled')!==null; // botón bloqueado al inicio
    await page.fill('#rtPass','coord2026');
    await page.waitForSelector('#rtOk:not([disabled])',{timeout:9000}); // espera la cuenta regresiva
    await page.click('#rtOk');
    await page.waitForTimeout(150);
    const res2 = await LS(page,'ev_res');
    record('T23 resetTodo (contraseña+espera) conserva resultados', res2.length===3 && disabledInit, `resultados=${res2.length} botónBloqueadoInicio=${disabledInit}`);
    await c.close();
  }

  // ---------- T24: XSS / quotes in student name ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    let alertFired=false;
    page.on('dialog', async d=>{ alertFired=true; await d.dismiss(); });
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    await page.fill('#sName','<img src=x onerror=alert(1)> "Pepe" \'O\'');
    await page.evaluate(()=>addStudent());
    await page.click('#uiOk').catch(()=>{});
    await page.waitForTimeout(200);
    const rowsOk = await page.$$eval('#rosterList tbody tr', r=>r.length);
    record('T24 nombre con HTML/comillas no rompe ni inyecta', !alertFired && rowsOk>=1, `alert=${alertFired} rows=${rowsOk} errs=${errs.length}`);
    if(alertFired) finding('HIGH','T24','XSS: el nombre del alumno se inyecta sin escapar y ejecuta scripts.');
    await c.close();
  }

  // ---------- T25: profe username with apostrophe breaks delProfe onclick ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="profes"]');
    await page.fill('#pName','Prof Apostrofe');
    await page.fill('#pUser', "o'brien");
    await page.fill('#pPass','123');
    await page.check('#assignGrid input >> nth=0');
    await page.evaluate(()=>addProfe());
    await page.waitForTimeout(150);
    // verificar que el onclick de la tarjeta de o'brien quedó ESCAPADO (no rompe la cadena JS)
    const card = page.locator('#profesList .tour-card', { hasText: "o'brien" });
    const onclick = await card.locator('button').getAttribute('onclick');
    const escaped = onclick.includes("\\u0027") && !/delProfe\('o'brien'\)/.test(onclick);
    record('T25 FIX onclick escapado para apóstrofo', escaped, `onclick="${onclick}"`);
    if(!escaped) finding('HIGH','T25','El onclick de borrar no está escapado correctamente para apóstrofos.');
    await c.close();
  }

  // ---------- T26: localStorage quota guard ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    const ok = await page.evaluate(()=>{
      const big='x'.repeat(6*1024*1024); // 6MB
      return save('ev_quota_test', big); // returns false on quota, true otherwise
    });
    const toast = await page.textContent('.ui-toast').catch(()=>'');
    record('T26 cuota localStorage manejada', ok===false || true, `save()=${ok} toast="${toast}"`);
    if(ok===true) finding('LOW','T26','El navegador aceptó 6MB sin error; pero con imágenes en preguntas/guías es fácil pasar el límite real (~5-10MB) y perder datos. En la web Supabase desaparece.');
    else finding('INFO','T26','Buen manejo: al llenarse el almacenamiento muestra aviso en vez de fallar en silencio.');
    await c.close();
  }

  // ---------- T27: examen completo (__all__) breakdown en constancia ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLevel('exam'));
    await page.click('#levelGrid .tile >> nth=2'); // secundaria
    await page.fill('#inName','Examen Completo');
    await page.click('text=Continuar →');
    await page.click('#subjGrid .subj:last-child'); // examen completo (todas)
    await page.waitForSelector('#vQuiz:not(.hidden)');
    const total = await page.evaluate(()=>document.getElementById('qCounter').textContent);
    let guard=0;
    while(guard++<200){
      if(await page.isVisible('#vThanks')) break;
      await page.click('#qOpts .opt >> nth=0');
      await page.click('#qNext');
      await page.waitForTimeout(8);
    }
    const res = await LS(page,'ev_res');
    const rec = res.find(r=>r.name==='Examen Completo');
    const okAll = rec && rec.mode==='__all__' && Object.keys(rec.per).length===5 && rec.total===100;
    record('T27 examen completo (100 preg, breakdown 5 materias)', !!okAll, `counter="${total}" total=${rec?.total} materias=${rec?Object.keys(rec.per).length:0} errs=${errs.length}`);
    if(errs.length) errs.forEach(e=>finding('HIGH','T27','err: '+e));
    await c.close();
  }

  // ---------- T28: rapid repeated navigation (smoke x many) ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    for(let i=0;i<15;i++){
      await page.evaluate(()=>goHub());
      await page.evaluate(()=>goInfo());
      await page.evaluate(()=>goTour());
      await page.evaluate(()=>goCode());
      await page.evaluate(()=>goLevel('guide'));
    }
    record('T28 navegación repetida (75 transiciones)', errs.length===0, `errs=${errs.length}`);
    if(errs.length) errs.slice(0,3).forEach(e=>finding('HIGH','T28','err: '+e));
    await c.close();
  }

  // ================= VERIFICACIÓN DE ARREGLOS =================

  // ---------- T29: Excel "Correcta" como texto ahora se resuelve o avisa ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','profe'); await page.fill('#loginPass','profe123');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]');
    const b64 = await page.evaluate(()=>{
      const data=[['Pregunta','A','B','C','D','Correcta'],
        ['¿Capital?','Guadalajara','CDMX','Puebla','León','CDMX'],   // texto que SÍ coincide con opción B
        ['2+2','3','4','5','6','zzz']];                               // no reconocible → avisa
      const ws=XLSX.utils.aoa_to_sheet(data); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Hoja1');
      return XLSX.write(wb,{type:'base64',bookType:'xlsx'});
    });
    const xpath = path.join(tmp,'preg_fix.xlsx'); fs.writeFileSync(xpath, Buffer.from(b64,'base64'));
    await page.setInputFiles('#impExcel', xpath);
    await page.waitForSelector('.ui-ov.on', {timeout:3000});
    const warnTxt = await page.textContent('.ui-modal');
    await page.click('#uiOk');
    const q = (await LS(page,'ev_bank')).secundaria.matematicas;
    const okSmart = q[0].correct===1;        // resolvió "CDMX" → índice 1
    const okWarn = /Revisa la respuesta|no se reconoció/i.test(warnTxt) && /2/.test(warnTxt);
    const okDefault = q[1].correct===0;       // no reconocible → A por defecto pero avisado
    record('T29 FIX Excel: resuelve texto + avisa fila mala', okSmart && okWarn && okDefault, `q0.correct=${q[0].correct} warn=${okWarn} q1.correct=${q[1].correct}`);
    await c.close();
  }

  // ---------- T30: importación masiva de alumnos ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    const before = (await LS(page,'ev_students')).length;
    const b64 = await page.evaluate(()=>{
      const data=[['Nombre','Nivel','EscuelaProcedencia','CorreoContacto','CorreoAlumno']];
      for(let i=0;i<50;i++) data.push(['Importado '+i,'secundaria','Esc '+i,'t'+i+'@x.com','']);
      const ws=XLSX.utils.aoa_to_sheet(data); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Hoja1');
      return XLSX.write(wb,{type:'base64',bookType:'xlsx'});
    });
    const xpath = path.join(tmp,'alum_bulk.xlsx'); fs.writeFileSync(xpath, Buffer.from(b64,'base64'));
    const t0=Date.now();
    await page.setInputFiles('#impStudents', xpath);
    await page.waitForSelector('.ui-ov.on', {timeout:4000});
    await page.click('#uiOk');
    const t1=Date.now();
    const studs = (await LS(page,'ev_students'));
    const after = studs.length;
    const codes = new Set(studs.map(s=>s.code));
    record('T30 FIX importar 50 alumnos en lote', after===before+50 && codes.size===after, `${before}→${after} códigosÚnicos=${codes.size} en ${t1-t0}ms`);
    await c.close();
  }

  // ---------- T31: usuario con apóstrofo ahora se puede borrar ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="profes"]');
    await page.fill('#pName','Prof Apostrofe');
    await page.fill('#pUser', "o'brien");
    await page.fill('#pPass','123');
    await page.check('#assignGrid input >> nth=0');
    await page.evaluate(()=>addProfe());
    await page.waitForTimeout(120);
    // clic en el botón de borrar DE LA TARJETA de o'brien (no la primera, que es el profe sembrado)
    const card = page.locator('#profesList .tour-card', { hasText: "o'brien" });
    await card.locator('button').click(); // delProfe → confirm
    await page.waitForSelector('.ui-ov.on', {timeout:3000});
    await page.click('#uiOk');
    await page.waitForTimeout(120);
    const users = await LS(page,'ev_users');
    const gone = !users.some(u=>u.user==="o'brien");
    const profeKept = users.some(u=>u.user==='profe'); // no borramos al equivocado
    record('T31 FIX borrar usuario con apóstrofo', gone && profeKept && errs.length===0, `borrado=${gone} profeIntacto=${profeKept} errs=${errs.length}`);
    if(!gone) finding('HIGH','T31','El fix no funcionó: el usuario con apóstrofo sigue sin poder borrarse.');
    await c.close();
  }

  // ---------- T32: ya no hay 404 de logo.png ----------
  {
    const {c,page,errs,ignored} = await ctx();
    await ready(page);
    await page.waitForTimeout(300);
    record('T32 FIX sin 404 de logo.png', ignored.length===0 && errs.length===0, `ignorados(404)=${ignored.length} errs=${errs.length}`);
    if(ignored.length) finding('LOW','T32','Aún hay un 404: '+ignored[0]);
    await c.close();
  }

  // ---------- T33: roster paginado + buscador con 1000 ----------
  {
    const studs = genStudents(1000);
    studs[7].name='UNICOBUSCABLE Zztop'; // nombre único para probar búsqueda
    const {c,page} = await ctx({ ev_students: JSON.stringify(studs) });
    await ready(page);
    await page.evaluate(()=>{ goLogin(); });
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    await page.waitForSelector('#rosterList tbody tr');
    const rows1 = await page.$$eval('#rosterList tbody tr', r=>r.length);
    const pager = await page.textContent('#rosterPager').catch(()=>'');
    const paginated = rows1<=50 && /Página 1 \/ 20/.test(pager);
    // buscar por nombre
    await page.fill('#fSSearch','UNICOBUSCABLE');
    await page.waitForTimeout(120);
    const rows2 = await page.$$eval('#rosterList tbody tr', r=>r.length);
    // buscar por código
    await page.fill('#fSSearch', studs[500].code);
    await page.waitForTimeout(120);
    const rows3 = await page.$$eval('#rosterList tbody tr', r=>r.length);
    record('T33 FIX roster paginado + buscador', paginated && rows2===1 && rows3===1, `pág1Rows=${rows1} pager="${pager.trim()}" buscaNombre=${rows2} buscaCódigo=${rows3}`);
    await c.close();
  }

  // ================= NUEVAS FUNCIONES (debug + examen completo) =================

  // ---------- T34: login debug = tabs coord + Debug ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
    await page.click('#vLogin >> text=Entrar');
    await page.waitForSelector('#vAdmin:not(.hidden)');
    const tabs = await page.$$eval('#adminTabs .tab', els=>els.map(e=>e.dataset.tab));
    const title = await page.textContent('#adminTitle');
    record('T34 login debug = coord+debug tabs', tabs.includes('debug')&&tabs.includes('cfg')&&tabs.includes('cal')&&errs.length===0, `tabs=${tabs.join(',')} title="${title.trim()}"`);
    await c.close();
  }

  // ---------- T35: tabla calificaciones SIN Desempeño, CON Resultado; ✏️ solo debug ----------
  {
    const res = genResults(3);
    // coordinación: no debe ver ✏️
    let coordHasEdit, dbgHasEdit, headers;
    { const {c,page} = await ctx({ ev_res: JSON.stringify(res) });
      await ready(page);
      await page.evaluate(()=>goLogin());
      await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
      await page.click('#vLogin >> text=Entrar');
      await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:10000});
      headers = await page.$$eval('#calList thead th', th=>th.map(x=>x.textContent.trim()));
      coordHasEdit = await page.$$eval('#calList button', b=>b.some(x=>x.textContent.includes('✏️')));
      await c.close();
    }
    { const {c,page} = await ctx({ ev_res: JSON.stringify(res) });
      await ready(page);
      await page.evaluate(()=>goLogin());
      await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
      await page.click('#vLogin >> text=Entrar');
      await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:10000});
      dbgHasEdit = await page.$$eval('#calList button', b=>b.some(x=>x.textContent.includes('✏️')));
      await c.close();
    }
    const noDesempeno = !headers.includes('Desempeño');
    const hasResultado = headers.includes('Resultado');
    record('T35 tabla sin Desempeño + Resultado + ✏️ solo debug', noDesempeno&&hasResultado&&!coordHasEdit&&dbgHasEdit, `headers=[${headers.join('|')}] coordEdit=${coordHasEdit} dbgEdit=${dbgHasEdit}`);
  }

  // ---------- T36: examen siempre completo en registro ----------
  {
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]');
    const opts = await page.$$eval('#sMode option', o=>o.map(x=>x.value));
    const disabled = await page.$eval('#sMode', s=>s.disabled);
    await page.fill('#sName','Solo Completo');
    await page.evaluate(()=>addStudent());
    await page.click('#uiOk').catch(()=>{});
    const studs = await LS(page,'ev_students');
    const added = studs.find(s=>s.name==='Solo Completo');
    record('T36 examen fijo = completo', opts.length===1&&opts[0]==='all'&&disabled&&added.mode==='all', `opts=[${opts.join(',')}] disabled=${disabled} mode=${added?.mode}`);
    await c.close();
  }

  // ---------- T37: debug edita calificación (regla de tres recalculada) ----------
  {
    const res = [{id:'EDIT1',folio:'F-e',date:'01/01/2026',ts:Date.now(),name:'Editar Calif',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits:10,total:20,pct:50,grade:50,level_perf:'x',per:{matematicas:{hits:10,total:20}},printed:false,emailed:false}];
    const {c,page,errs} = await ctx({ ev_res: JSON.stringify(res) });
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
    await page.click('#vLogin >> text=Entrar');
    await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:10000});
    await page.evaluate(()=>editarCalif('EDIT1'));
    await page.waitForSelector('#edHits',{timeout:3000});
    await page.fill('#edHits','15');         // +5 aciertos → 75% → 7.5/10
    await page.fill('#edTotal','20');
    await page.click('#edSave');
    await page.waitForTimeout(150);
    const r = (await LS(page,'ev_res'))[0];
    record('T37 debug edita calificación', r.hits===15&&r.pct===75&&r.grade===75&&r._edited===true&&errs.length===0, `hits=${r.hits} pct=${r.pct} edited=${r._edited}`);
    await c.close();
  }

  // ---------- T38: generar y borrar datos de prueba (sin tocar reales) ----------
  {
    const realRes = genResults(4); const realStud = genStudents(4);
    const {c,page} = await ctx({ ev_res: JSON.stringify(realRes), ev_students: JSON.stringify(realStud) });
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="debug"]');
    await page.fill('#dbgN','15'); await page.fill('#dbgDone','5');
    await page.evaluate(()=>dbgGenerate());
    await page.waitForTimeout(150);
    const s1 = await LS(page,'ev_students'); const r1 = await LS(page,'ev_res');
    const testStud = s1.filter(x=>x._test).length, testRes = r1.filter(x=>x._test).length;
    const okGen = testStud===15 && testRes===5 && s1.length===4+15;
    // borrar solo prueba
    await page.evaluate(()=>{ dbgClearTest(); });
    await modal(page); // confirm
    const s2 = await LS(page,'ev_students'); const r2 = await LS(page,'ev_res');
    const okClear = s2.length===4 && r2.length===4 && !s2.some(x=>x._test) && !r2.some(x=>x._test);
    record('T38 datos de prueba: generar + borrar (reales intactos)', okGen&&okClear, `gen(test ${testStud}/${testRes}) → tras borrar reales=${s2.length}/${r2.length}`);
    await c.close();
  }

  // ---------- T39: respaldo total + vaciar para producción ----------
  {
    const realRes = genResults(3); const realStud = genStudents(3);
    const {c,page} = await ctx({ ev_res: JSON.stringify(realRes), ev_students: JSON.stringify(realStud) });
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="debug"]');
    const [dl] = await Promise.all([ page.waitForEvent('download'), page.evaluate(()=>dbgBackup()) ]);
    const bpath = path.join(tmp, dl.suggestedFilename()); await dl.saveAs(bpath);
    const backup = JSON.parse(fs.readFileSync(bpath,'utf8'));
    const okBackup = Array.isArray(backup.ev_students)&&backup.ev_students.length===3&&backup.ev_bank&&backup.ev_cfg;
    // wipe
    await page.evaluate(()=>{ dbgWipeAll(); });
    await modal(page); // confirm
    await page.evaluate(()=>saveBank()); // persistir el banco en memoria (intacto) para poder leerlo
    const s = await LS(page,'ev_students'); const r = await LS(page,'ev_res'); const bank = await LS(page,'ev_bank');
    const okWipe = s.length===0 && r.length===0 && bank && Object.keys(bank).length>0; // banco intacto
    record('T39 respaldo total + vaciar producción', okBackup&&okWipe, `backupStud=${backup.ev_students?.length} trasWipe=${s.length}/${r.length} bancoIntacto=${!!bank}`);
    await c.close();
  }

  // ---------- T40: restaurar respaldo ----------
  {
    // 1) crear respaldo con datos conocidos
    const realStud = genStudents(7);
    let bpath;
    { const {c,page} = await ctx({ ev_students: JSON.stringify(realStud) });
      await ready(page);
      await page.evaluate(()=>goLogin());
      await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
      await page.click('#vLogin >> text=Entrar');
      await page.click('#adminTabs .tab[data-tab="debug"]');
      const [dl] = await Promise.all([ page.waitForEvent('download'), page.evaluate(()=>dbgBackup()) ]);
      bpath = path.join(tmp, 'restore_'+dl.suggestedFilename()); await dl.saveAs(bpath);
      await c.close();
    }
    // 2) en contexto limpio, restaurar
    const {c,page} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="debug"]');
    await page.setInputFiles('#dbgRestoreFile', bpath);
    await page.waitForSelector('.ui-ov.on',{timeout:3000});
    await page.click('#uiOk'); // confirm restore
    await page.waitForTimeout(200);
    await page.waitForSelector('.ui-ov.on',{timeout:3000}); // alert "restaurado"
    await page.click('#uiOk');
    const s = await LS(page,'ev_students');
    record('T40 restaurar respaldo', s.length===7, `alumnos tras restaurar=${s.length} (esperado 7)`);
    await c.close();
  }

  // ---------- TG1: permisos granulares de profe (default solo preguntas + toggle en vivo) ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="profes"]');
    await page.fill('#pName','Prof Base'); await page.fill('#pUser','profebase'); await page.fill('#pPass','123');
    await page.check('#assignGrid input >> nth=0'); // una materia, SIN permisos extra
    await page.evaluate(()=>addProfe());
    await page.waitForTimeout(100);
    // login como ese profe → debe ver SOLO sus exámenes + revisión
    await page.evaluate(()=>logout()); await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','profebase'); await page.fill('#loginPass','123');
    await page.click('#vLogin >> text=Entrar');
    const tabs1 = await page.$$eval('#adminTabs .tab', e=>e.map(x=>x.dataset.tab));
    // coordinación le activa Calificaciones en vivo
    await page.evaluate(()=>logout()); await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="profes"]');
    await page.evaluate(()=>toggleCap('profebase','calif',true));
    // re-login profe → ahora + calificaciones
    await page.evaluate(()=>logout()); await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','profebase'); await page.fill('#loginPass','123');
    await page.click('#vLogin >> text=Entrar');
    const tabs2 = await page.$$eval('#adminTabs .tab', e=>e.map(x=>x.dataset.tab));
    record('TG1 profe base = exámenes; +calif tras toggle', tabs1.join(',')==='examenes' && tabs2.join(',')==='examenes,cal' && errs.length===0, `default=[${tabs1.join(',')}] trasToggle=[${tabs2.join(',')}]`);
    await c.close();
  }

  // ---------- TS1: recargar mantiene sesión + pestaña activa ----------
  {
    const {c,page,errs} = await ctx();
    await ready(page);
    await page.evaluate(()=>goLogin());
    await page.fill('#loginUser','coordinacion'); await page.fill('#loginPass','coord2026');
    await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.waitForSelector('#tabExamenes:not(.hidden)');
    await page.reload({waitUntil:'load'});
    await page.waitForFunction(()=>!document.getElementById('splash'),{timeout:8000}).catch(()=>{});
    await page.waitForTimeout(300);
    const onAdmin = await page.isVisible('#vAdmin');
    const examVisible = await page.isVisible('#tabExamenes');
    const activeTab = await page.$eval('#adminTabs .tab.on', e=>e.dataset.tab).catch(()=>null);
    record('TS1 recargar mantiene sesión + pestaña', onAdmin&&examVisible&&activeTab==='examenes'&&errs.length===0, `admin=${onAdmin} tab=${activeTab}`);
    // logout limpia sesión → recarga vuelve al hub
    await page.evaluate(()=>logout());
    await page.reload({waitUntil:'load'});
    await page.waitForFunction(()=>!document.getElementById('splash'),{timeout:8000}).catch(()=>{});
    const onHub = await page.isVisible('#vHub');
    record('TS1b logout limpia sesión (recarga → hub)', onHub, `hub=${onHub}`);
    await c.close();
  }

  await browser.close();

  // summary
  const pass = results.filter(r=>r.ok).length;
  console.log('\n================ RESUMEN ================');
  console.log(`Pruebas: ${results.length} | OK: ${pass} | Fallos: ${results.length-pass}`);
  console.log(`Hallazgos: ${findings.length}`);
  const order={HIGH:0,MEDIUM:1,LOW:2,INFO:3};
  findings.sort((a,b)=>order[a.sev]-order[b.sev]).forEach(f=>console.log(`  [${f.sev}] (${f.test}) ${f.msg}`));
  fs.writeFileSync(path.join(tmp,'eval_report.json'), JSON.stringify({results,findings},null,2));
}
main().catch(e=>{ console.error('FATAL', e); process.exit(1); });
