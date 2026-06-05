import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const URL = pathToFileURL('C:/Users/ejerc/OneDrive/Desktop/Evaluaciones Diagnostico/index.html').href;
const results=[]; let browser;
function record(n,ok,info=''){results.push({n,ok});console.log(`${ok?'✅':'❌'} ${n}${info?'  — '+info:''}`)}
async function ctx(){const c=await browser.newContext({reducedMotion:'reduce'});const page=await c.newPage();const errs=[];page.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text())});page.on('pageerror',e=>errs.push(e.message));return{c,page,errs}}
async function ready(page){await page.goto(URL,{waitUntil:'load'});await page.waitForFunction(()=>typeof window.goHub==='function',{timeout:8000});await page.waitForFunction(()=>!document.getElementById('splash'),{timeout:8000}).catch(()=>{})}
const LS=(page,k)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
async function loginCoord(page){await page.evaluate(()=>goLogin());await page.fill('#loginUser','coordinacion');await page.fill('#loginPass','coord2026');await page.click('#vLogin >> text=Entrar');await page.waitForSelector('#vAdmin:not(.hidden)')}

async function main(){
  browser=await chromium.launch();

  // EX1: crear examen parcial (MC + abierta auto + abierta manual) y tomarlo + revisar
  { const {c,page,errs}=await ctx(); await ready(page);
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.evaluate(()=>{
      nuevoExamen();
      document.getElementById('exTitle').value='Examen de prueba';
      document.getElementById('exShuffle').value='0'; // sin barajar para test determinista
      addExQ('mc'); exSetQ(0,'2+2?'); exSetOpt(0,0,'3'); exSetOpt(0,1,'4'); exSetOpt(0,2,'5'); exSetOpt(0,3,'6'); exSetCorrect(0,1,true);
      addExQ('short'); exSetQ(1,'Capital de Francia'); exSetAns(1,'París'); exSetPrec(1,80);
      addExQ('para'); exSetQ(2,'Explica el proceso'); exSetManual(2,true);
    });
    const pin = await page.evaluate(()=>document.getElementById('exPin').value);
    await page.evaluate(()=>guardarExamen());
    const exams = await LS(page,'ev_exams');
    const okCreate = exams.length===1 && exams[0].questions.length===3 && exams[0].pin===pin;
    record('EX1a crear examen parcial (3 preguntas + PIN)', okCreate, `pin=${pin} preguntas=${exams[0]?.questions.length}`);

    // alumno toma el examen por PIN
    await page.evaluate(()=>logout());
    await page.click('text=Comenzar ahora');
    await page.fill('#inCode', pin);
    await page.click('text=Comenzar →');
    await page.waitForSelector('.ui-ov.on'); // modal nombre+grupo
    await page.fill('#exStName','Juan Prueba');
    await page.click('#exStOk');
    await page.waitForSelector('#vExam:not(.hidden)');
    // Q1 MC: elegir "4"
    await page.click('#exQBody .opt:has-text("4")');
    await page.click('#exQNext');
    // Q2 abierta: "paris" en minúscula sin acento (precisión 80 debe darla válida)
    await page.fill('#exQBody textarea','paris');
    await page.click('#exQNext');
    // Q3 párrafo manual
    await page.fill('#exQBody textarea','Una explicación cualquiera.');
    await page.click('#exQNext'); // Terminar
    await page.waitForSelector('#vThanks:not(.hidden)');
    const res = (await LS(page,'ev_res')).find(r=>r.type==='parcial');
    const okTake = res && res.pendingCount===1 && res.items[0].correct===true && res.items[1].correct===true && res.pct===67;
    record('EX1b alumno toma examen (MC ok, abierta precisión ok, 1 pendiente)', okTake, `pct=${res?.pct} pending=${res?.pendingCount} q0=${res?.items[0].correct} q1=${res?.items[1].correct}`);

    // revisión manual
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.click('#revBtn'); // Revisión ahora se entra desde Exámenes
    await page.waitForSelector('#revList .qedit');
    const resId = res.id;
    await page.evaluate(id=>reviewAns(id,2,1), resId);
    const res2 = (await LS(page,'ev_res')).find(r=>r.id===resId);
    record('EX1c revisión manual recalcula (3/3 → 100%)', res2.pendingCount===0 && res2.pct===100 && errs.length===0, `pct=${res2.pct} pending=${res2.pendingCount} errs=${errs.length}`);
    await c.close();
  }

  // EX2: disponibilidad (examen vencido no se puede tomar)
  { const {c,page}=await ctx(); await ready(page);
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.evaluate(()=>{ nuevoExamen(); document.getElementById('exTitle').value='Vencido'; document.getElementById('exTo').value='2020-01-01T00:00'; addExQ('mc'); exSetQ(0,'x'); exSetOpt(0,0,'a'); exSetOpt(0,1,'b'); exSetCorrect(0,0,true); });
    const pin=await page.evaluate(()=>document.getElementById('exPin').value);
    await page.evaluate(()=>guardarExamen());
    await page.evaluate(()=>logout());
    await page.click('text=Comenzar ahora'); await page.fill('#inCode',pin); await page.click('text=Comenzar →');
    await page.waitForSelector('.ui-ov.on');
    const txt=await page.textContent('.ui-modal');
    record('EX2 examen vencido rechazado', /venció|no disponible/i.test(txt), `modal="${txt.slice(0,40)}"`);
    await c.close();
  }

  // EX3: toggle de función apaga exámenes
  { const {c,page}=await ctx(); await ready(page);
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="cfg"]');
    await page.evaluate(()=>toggleFeature('examenes',false));
    await page.evaluate(()=>logout());
    await loginCoord(page);
    const tabs=await page.$$eval('#adminTabs .tab',e=>e.map(x=>x.dataset.tab));
    record('EX3 toggle OFF oculta Exámenes/Revisión', !tabs.includes('examenes')&&!tabs.includes('revision'), `tabs=${tabs.join(',')}`);
    await c.close();
  }

  // EX4: selector de tipo por pregunta (crear con botón + cambiar con dropdown)
  { const {c,page,errs}=await ctx(); await ready(page);
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.click('#examListView >> text=Crear examen');
    await page.waitForSelector('#examBuilder:not(.hidden)');
    await page.click('#examBuilder >> text=Opción múltiple'); // agregar por botón
    const selects1 = await page.locator('#exQuestions select').count();
    await page.selectOption('#exQuestions select >> nth=0','short'); // cambiar tipo
    const t = await page.evaluate(()=>bldQs[0].type);
    const hasAns = await page.isVisible('#exQuestions input[placeholder*="París"]');
    record('EX4 selector de tipo por pregunta (crear+editar)', selects1>=1 && t==='short' && hasAns && errs.length===0, `selects=${selects1} tipo=${t} editorAbierta=${hasAns}`);
    await c.close();
  }

  // EX5: el diagnóstico aparece en la sección Exámenes como ya creado
  { const {c,page}=await ctx(); await ready(page);
    await loginCoord(page);
    await page.click('#adminTabs .tab[data-tab="examenes"]');
    await page.waitForSelector('#examList');
    const txt = await page.textContent('#examList');
    const hasDiagBtn = await page.isVisible('#examList >> text=Editar preguntas');
    const noPregTab = (await page.$$eval('#adminTabs .tab',e=>e.map(x=>x.dataset.tab))).indexOf('preg')===-1;
    // clic en "Editar preguntas" del diagnóstico → abre el editor + backlink
    await page.click('#examList >> text=Editar preguntas');
    await page.waitForSelector('#tabPreg:not(.hidden)');
    const editorOpen = await page.isVisible('#editorList');
    const backVisible = await page.isVisible('#pregBack');
    record('EX5 diagnóstico en Exámenes (sin pestaña suelta + editar desde tarjeta)', /Examen Diagnóstico/i.test(txt) && hasDiagBtn && noPregTab && editorOpen && backVisible, `diagBtn=${hasDiagBtn} sinTabPreg=${noPregTab} editor=${editorOpen} back=${backVisible}`);
    await c.close();
  }

  // EX6: anti-trampa — cambiar de pestaña bloquea; solo personal libera con código+justificación
  { const {c,page}=await ctx(); await ready(page);
    const code = await page.evaluate(()=>JSON.parse(localStorage.getItem('ev_students')).find(s=>s.status==='pending').code);
    await page.click('text=Comenzar ahora'); await page.fill('#inCode',code); await page.click('text=Comenzar →');
    await page.waitForSelector('#vQuiz:not(.hidden)');
    // simular cambio de pestaña
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))});
    const locked = await page.isVisible('#examLock');
    // código incorrecto → sigue bloqueado
    await page.fill('#lkCode','xxxx'); await page.fill('#lkJust','intento'); await page.click('#examLock >> text=Liberar examen');
    const stillLocked = await page.isVisible('#examLock');
    // código correcto + justificación → libera
    await page.fill('#lkCode','coord2026'); await page.fill('#lkJust','El alumno fue al baño con permiso');
    await page.click('#examLock >> text=Liberar examen');
    await page.waitForTimeout(150);
    const unlocked = !(await page.isVisible('#examLock')) && (await page.isVisible('#vQuiz'));
    record('EX6 anti-trampa: bloquea al cambiar de pestaña + libera con código', locked&&stillLocked&&unlocked, `locked=${locked} trasCódigoMalo=${stillLocked} liberado=${unlocked}`);
    await c.close();
  }

  await browser.close();
  const ok=results.filter(r=>r.ok).length;
  console.log(`\n=== RESUMEN EXÁMENES === ${results.length} | OK: ${ok} | Fallos: ${results.length-ok}`);
}
main().catch(e=>{console.error('FATAL',e);process.exit(1)});
