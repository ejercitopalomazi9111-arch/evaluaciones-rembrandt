import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const LITE = pathToFileURL('C:/Users/ejerc/OneDrive/Desktop/Evaluacion Lite/index.html').href;
const FULL = pathToFileURL('C:/Users/ejerc/OneDrive/Desktop/Evaluaciones Diagnostico/index.html').href;
const results = [];
let browser;
function record(n,ok,info=''){results.push({n,ok});console.log(`${ok?'✅':'❌'} ${n}${info?'  — '+info:''}`)}
async function ctx(seed={}){const c=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});if(Object.keys(seed).length)await c.addInitScript(s=>{for(const k in s)localStorage.setItem(k,s[k])},seed);const page=await c.newPage();const errs=[],ign=[];page.on('console',m=>{if(m.type()==='error'){/ERR_FILE_NOT_FOUND/.test(m.text())?ign.push(m.text()):errs.push(m.text())}});page.on('pageerror',e=>errs.push(e.message));return{c,page,errs,ign}}
async function readyAt(page,url){await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>typeof window.goHub==='function',{timeout:8000});await page.waitForFunction(()=>!document.getElementById('splash'),{timeout:8000}).catch(()=>{})}
const LS=(page,k)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);

async function main(){
  browser=await chromium.launch();

  // L1: carga limpia sin 404 ni errores
  { const {c,page,errs,ign}=await ctx(); await readyAt(page,LITE);
    const hub=await page.isVisible('#vHub'); record('L1 carga limpia (sin 404/errores)', hub&&errs.length===0&&ign.length===0, `errs=${errs.length} 404=${ign.length}`); await c.close(); }

  // L2: código inválido
  { const {c,page}=await ctx(); await readyAt(page,LITE); await page.click('text=Comenzar ahora'); await page.fill('#inCode','ZZZZZZ'); await page.click('text=Comenzar →'); const t=await page.textContent('.ui-toast').catch(()=>''); record('L2 código inválido', /no válid/i.test(t||''), `toast="${t}"`); await c.close(); }

  // L3: login coordinación (mal/bien) + 4 tabs
  { const {c,page}=await ctx(); await readyAt(page,LITE); await page.evaluate(()=>goLogin()); await page.fill('#loginPass','xxx'); await page.click('#vLogin >> text=Entrar'); const bad=await page.textContent('.ui-toast').catch(()=>''); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar'); await page.waitForSelector('#vAdmin:not(.hidden)'); const tabs=await page.$$eval('#adminTabs .tab',e=>e.map(x=>x.dataset.tab)); record('L3 login coordinación = 4 tabs', /incorrecta/i.test(bad)&&tabs.join(',')==='cal,alum,preg,cfg', `bad="${bad}" tabs=${tabs.join(',')}`); await c.close(); }

  // L4: registrar alumno → código → examen completo → guarda + bloquea
  { const {c,page,errs}=await ctx(); await readyAt(page,LITE);
    await page.evaluate(()=>goLogin()); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="alum"]'); await page.fill('#sName','Pedro Lite'); await page.evaluate(()=>addStudent());
    await page.waitForSelector('.ui-ov.on'); await page.click('#uiOk');
    const code=(await LS(page,'ev_students')).find(s=>s.name==='Pedro Lite').code;
    await page.evaluate(()=>goHub()); await page.click('text=Comenzar ahora'); await page.fill('#inCode',code); await page.click('text=Comenzar →');
    await page.waitForSelector('#vQuiz:not(.hidden)');
    let g=0; while(g++<130){ if(await page.isVisible('#vThanks'))break; await page.click('#qOpts .opt >> nth=0'); await page.click('#qNext'); await page.waitForTimeout(6); }
    const thanks=await page.isVisible('#vThanks'); const rec=(await LS(page,'ev_res')).find(r=>r.name==='Pedro Lite');
    const counter='(100)'; const okShape=rec&&rec.mode==='__all__'&&rec.subject==='Examen completo'&&rec.total===100&&Object.keys(rec.per).length===5;
    const blocked=(await LS(page,'ev_students')).find(s=>s.code===code).status==='completed';
    record('L4 examen completo 100q → guarda+bloquea', thanks&&okShape&&blocked&&errs.length===0, `thanks=${thanks} total=${rec?.total} materias=${rec?Object.keys(rec.per).length:0} blocked=${blocked}`);
    await c.close(); }

  // L5: constancia regla de tres
  { const res=[{id:'L5',folio:'F',date:'01/01/2026',ts:Date.now(),name:'Cert Lite',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits:75,total:100,pct:75,grade:75,level_perf:'x',per:{matematicas:{hits:15,total:20}},printed:false,emailed:false}];
    const {c,page}=await ctx({ev_res:JSON.stringify(res)}); await readyAt(page,LITE);
    await page.evaluate(()=>goLogin()); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar');
    await page.evaluate(()=>abrirConstancia('L5')); const g=await page.textContent('#certGrade');
    await page.evaluate(()=>{window.print=()=>{};imprimirConstancia()}); const printed=(await LS(page,'ev_res'))[0].printed;
    record('L5 constancia 75/100→7.5/10 + printed', /7\.5\s*\/\s*10/.test(g)&&printed===true, `grade="${g}" printed=${printed}`); await c.close(); }

  // L6: editor guarda
  { const {c,page}=await ctx(); await readyAt(page,LITE);
    await page.evaluate(()=>goLogin()); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="preg"]'); await page.evaluate(()=>saveBank());
    const before=(await LS(page,'ev_bank')).preparatoria.matematicas.length; await page.evaluate(()=>{addQuestion();saveBank()}); const after=(await LS(page,'ev_bank')).preparatoria.matematicas.length;
    record('L6 editor agrega+guarda', after===before+1, `${before}→${after}`); await c.close(); }

  // L7: config escala afecta constancia
  { const res=[{id:'L7',folio:'F',date:'01/01/2026',ts:Date.now(),name:'Escala',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits:50,total:100,pct:50,grade:50,level_perf:'x',per:{matematicas:{hits:10,total:20}},printed:false,emailed:false}];
    const {c,page}=await ctx({ev_res:JSON.stringify(res)}); await readyAt(page,LITE);
    await page.evaluate(()=>goLogin()); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar');
    await page.click('#adminTabs .tab[data-tab="cfg"]'); await page.fill('#cfgEscala','100'); await page.evaluate(()=>saveConfig());
    await page.evaluate(()=>abrirConstancia('L7')); const g=await page.textContent('#certGrade');
    record('L7 config escala=100 → 50/100', /50\s*\/\s*100/.test(g), `grade="${g}"`); await c.close(); }

  // L8: tabla SIN debug ✏️ y SIN columna Desempeño (igual que premium pedido)
  { const res=[{id:'L8',folio:'F',date:'01/01/2026',ts:Date.now(),name:'X',group:'1.1',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits:50,total:100,pct:50,grade:50,level_perf:'x',per:{matematicas:{hits:10,total:20}},printed:false,emailed:false}];
    const {c,page}=await ctx({ev_res:JSON.stringify(res)}); await readyAt(page,LITE);
    await page.evaluate(()=>goLogin()); await page.fill('#loginPass','coord2026'); await page.click('#vLogin >> text=Entrar');
    await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:8000});
    const headers=await page.$$eval('#calList thead th',th=>th.map(x=>x.textContent.trim()));
    const hasEdit=await page.$$eval('#calList button',b=>b.some(x=>x.textContent.includes('✏️')));
    record('L8 tabla sin Desempeño/sin debug', !headers.includes('Desempeño')&&headers.includes('Resultado')&&!hasEdit, `headers=[${headers.join('|')}] edit=${hasEdit}`); await c.close(); }

  // L9 (CLAVE): datos enlazan — resultado creado en LITE se ve en la COMPLETA (mismo contexto/origin)
  { const {c,page,errs}=await ctx(); await readyAt(page,LITE);
    // crear un alumno+resultado conocido en la LITE
    await page.evaluate(()=>{
      const STUD=JSON.parse(localStorage.getItem('ev_students')||'[]');
      const RES=JSON.parse(localStorage.getItem('ev_res')||'[]');
      const code='LINK01'; STUD.push({code,name:'ENLACE PRUEBA',group:'2.2',level:'secundaria',mode:'all',origin:'x',originGroup:'',tEmail:'',sEmail:'',status:'completed',resultId:'RLINK',ciclo:'2026-2027'});
      RES.push({id:'RLINK',folio:'FL',date:'01/01/2026',ts:Date.now(),name:'ENLACE PRUEBA',group:'2.2',ciclo:'2026-2027',level:'secundaria',sEmail:'',tEmail:'',mode:'__all__',subject:'Examen completo',hits:80,total:100,pct:80,grade:80,level_perf:'Satisfactorio',per:{matematicas:{hits:16,total:20}},printed:false,emailed:false});
      localStorage.setItem('ev_students',JSON.stringify(STUD)); localStorage.setItem('ev_res',JSON.stringify(RES));
    });
    const liteOrigin = await page.evaluate(()=>location.origin);
    // navegar a la COMPLETA en el MISMO contexto
    await readyAt(page,FULL);
    const fullOrigin = await page.evaluate(()=>location.origin);
    const sharedRes = await LS(page,'ev_res');
    const seen = Array.isArray(sharedRes) && sharedRes.some(r=>r.id==='RLINK' && r.name==='ENLACE PRUEBA');
    // y que el DEBUG de la premium lo lista en calificaciones
    let dbgSees=false;
    if(seen){ await page.evaluate(()=>goLogin()); await page.fill('#loginUser','debug'); await page.fill('#loginPass','debug2026'); await page.click('#vLogin >> text=Entrar'); await page.waitForFunction(()=>document.querySelectorAll('#calList table').length>0,{timeout:8000}); dbgSees=await page.evaluate(()=>{return document.getElementById('calList').textContent.includes('ENLACE PRUEBA')}); }
    record('L9 ENLACE Lite→Completa (mismo origin file://)', seen&&dbgSees, `liteOrigin=${liteOrigin} fullOrigin=${fullOrigin} vistoEnFull=${seen} debugLoVe=${dbgSees}`);
    await c.close(); }

  await browser.close();
  const ok=results.filter(r=>r.ok).length;
  console.log('\n=== RESUMEN LITE ===');
  console.log(`Pruebas: ${results.length} | OK: ${ok} | Fallos: ${results.length-ok}`);
}
main().catch(e=>{console.error('FATAL',e);process.exit(1)});
