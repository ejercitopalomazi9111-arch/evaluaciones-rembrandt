"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type Subject = { id: string; name: string; icon: string; position: number };
type Question = {
  id: string;
  subject_id: string;
  position: number;
  text: string;
  options: string[];
  correct: number;
};
type Student = {
  id: string;
  code: string;
  full_name: string;
  origin: string;
  contact_email: string;
  status: string;
};
type Per = Record<string, { hits: number; total: number }>;
type Result = {
  id: string;
  folio: string;
  student_name: string;
  origin: string;
  contact_email: string;
  hits: number;
  total: number;
  pct: number;
  grade: number;
  level: string;
  per: Per;
  created_at: string;
};
type Config = {
  id: number;
  school: string;
  subtitle: string;
  period: string;
  director: string;
  director_title: string;
  pass: number;
  escala: number;
  logo_url: string;
  shuffle: boolean;
  time_limit: number;
};

const SUBJ_NAME: Record<string, string> = {
  matematicas: "Matemáticas",
  lectura: "Lectura y Redacción",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biología",
};

function nivelColor(pct: number, pass: number) {
  if (pct >= 90) return "var(--verde)";
  if (pct >= 70) return "var(--azul2)";
  if (pct >= pass) return "var(--naranja)";
  return "var(--rojo)";
}

export default function CoordinacionPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [confirmBox, setConfirmBox] = useState<{ msg: string; onYes: () => void } | null>(null);

  const [tab, setTab] = useState<"res" | "stud" | "bank" | "cfg">("res");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cfg, setCfg] = useState<Config | null>(null);

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const loadAll = useCallback(async () => {
    const [s, r, st, q, c] = await Promise.all([
      supabase.from("subjects").select("*").order("position"),
      supabase.from("results").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("full_name"),
      supabase.from("questions").select("*").order("subject_id").order("position"),
      supabase.from("config").select("*").eq("id", 1).single(),
    ]);
    if (s.data) setSubjects(s.data as Subject[]);
    if (r.data) setResults(r.data as Result[]);
    if (st.data) setStudents(st.data as Student[]);
    if (q.data) setQuestions(q.data as Question[]);
    if (c.data) setCfg(c.data as Config);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const ok = Boolean(data.session);
      setAuthed(ok);
      if (ok) void loadAll();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const ok = Boolean(session);
      setAuthed(ok);
      if (ok) void loadAll();
    });
    return () => sub.subscription.unsubscribe();
  }, [loadAll]);

  const login = async () => {
    setBusy(true);
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    setBusy(false);
    if (error) setLoginErr("Correo o contraseña incorrectos.");
  };
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  // ---------- pantalla de carga ----------
  if (authed === null) {
    return (
      <div className="wrap">
        <p className="muted center" style={{ padding: 40 }}>
          Cargando…
        </p>
      </div>
    );
  }

  // ---------- login ----------
  if (!authed) {
    return (
      <div className="wrap">
        <header className="top">
          <div className="logo-box">R</div>
          <div>
            <h1>Instituto Rembrandt de Querétaro</h1>
            <p className="muted">Acceso de Coordinación</p>
          </div>
        </header>
        <Link className="backlink" href="/">
          ← Volver al inicio
        </Link>
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Acceso de Coordinación</h2>
          <p className="muted">Área exclusiva del personal del instituto.</p>
          {!supabaseConfigured && (
            <div className="hint">
              ⚠️ Falta configurar la conexión a la base de datos
              (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).
            </div>
          )}
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="coordinacion@correo.com"
          />
          <label className="mt">Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            autoComplete="current-password"
          />
          {loginErr && (
            <p className="muted" style={{ color: "var(--rojo)" }}>
              {loginErr}
            </p>
          )}
          <div className="mt">
            <button className="btn" style={{ width: "100%" }} disabled={busy} onClick={login}>
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </div>
        {toast && (
          <div className="toast-wrap">
            <div className={"toast " + toast.type}>{toast.msg}</div>
          </div>
        )}
      </div>
    );
  }

  // ---------- panel ----------
  return (
    <div className="wrap">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-brand">
            <div className="logo-box">R</div>
            <div>
              <b>{cfg?.school || "Instituto Rembrandt"}</b>
              <small>Coordinación</small>
            </div>
          </div>
          <nav className="admin-nav">
            <button className={tab === "res" ? "on" : ""} onClick={() => setTab("res")}>
              📊 Resultados
            </button>
            <button className={tab === "stud" ? "on" : ""} onClick={() => setTab("stud")}>
              🎟️ Aspirantes
            </button>
            <button className={tab === "bank" ? "on" : ""} onClick={() => setTab("bank")}>
              📝 Preguntas
            </button>
            <button className={tab === "cfg" ? "on" : ""} onClick={() => setTab("cfg")}>
              ⚙️ Configuración
            </button>
          </nav>
          <button className="admin-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </aside>

        <div className="admin-main">
          {tab === "res" && (
            <ResultsTab results={results} students={students} subjects={subjects} cfg={cfg} onRefresh={loadAll} />
          )}
          {tab === "stud" && (
            <StudentsTab
              students={students}
              notify={notify}
              reload={loadAll}
              ask={(msg, onYes) => setConfirmBox({ msg, onYes })}
            />
          )}
          {tab === "bank" && (
            <BankTab
              subjects={subjects}
              questions={questions}
              setQuestions={setQuestions}
              notify={notify}
              reload={loadAll}
              ask={(msg, onYes) => setConfirmBox({ msg, onYes })}
            />
          )}
          {tab === "cfg" && cfg && <ConfigTab cfg={cfg} setCfg={setCfg} notify={notify} />}
        </div>
      </div>

      {toast && (
        <div className="toast-wrap">
          <div className={"toast " + toast.type}>{toast.msg}</div>
        </div>
      )}
      {confirmBox && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(18,28,58,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div className="card" style={{ maxWidth: 420 }}>
            <p style={{ marginTop: 0 }}>{confirmBox.msg}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn sec sm" onClick={() => setConfirmBox(null)}>
                Cancelar
              </button>
              <button
                className="btn danger sm"
                onClick={() => {
                  confirmBox.onYes();
                  setConfirmBox(null);
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================= RESULTADOS ======================= */
function ResultsTab({
  results,
  students,
  subjects,
  cfg,
  onRefresh,
}: {
  results: Result[];
  students: Student[];
  subjects: Subject[];
  cfg: Config | null;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [fstatus, setFstatus] = useState("");
  const [cert, setCert] = useState<Result | null>(null);
  const pass = cfg?.pass ?? 60;
  const escala = cfg?.escala ?? 10;

  const n = results.length;
  const suf = results.filter((r) => r.pct >= pass).length;
  const avg = n ? results.reduce((a, r) => a + Number(r.grade), 0) / n : 0;
  const pend = students.filter((s) => s.status !== "completed").length;

  const list = results
    .filter((r) => !search || r.student_name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !fstatus || (fstatus === "suf" ? r.pct >= pass : r.pct < pass));

  const exportCSV = () => {
    if (!results.length) return;
    const head = ["Folio", "Aspirante", "Escuela", "Aciertos", "Total", "Porcentaje", "Calificacion", "Nivel", "Fecha", "Correo"];
    let csv = "﻿" + head.join(",") + "\n";
    results.forEach((r) => {
      csv +=
        [r.folio, r.student_name, r.origin, r.hits, r.total, r.pct + "%", r.grade, r.level, new Date(r.created_at).toLocaleString("es-MX"), r.contact_email]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",") + "\n";
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "resultados_admision.csv";
    a.click();
  };

  if (cert) {
    return (
      <div>
        <div className="cert">
          <div className="cert-head">
            <div className="logo-box">R</div>
            <div>
              <h2>{cfg?.school}</h2>
              <p>{cfg?.subtitle}</p>
            </div>
          </div>
          <div className="cert-title">
            <h1>Reporte de Calificaciones</h1>
            <div className="line" />
          </div>
          <div className="cert-body">
            Se hace constar que el/la aspirante
            <div className="cert-name">{cert.student_name}</div>
            <div className="muted">
              {cert.origin ? "Procedente de: " + cert.origin + " · " : ""}Folio: {cert.folio}
            </div>
            presentó el examen de admisión a Bachillerato, obteniendo:
            <div style={{ margin: "12px 0" }}>
              <span style={{ fontSize: 21, fontWeight: 800 }}>Calificación: </span>
              <span className="cert-grade">{Number(cert.grade)}</span>
              <span className="muted"> / {escala}</span>
            </div>
            <div>
              nivel de desempeño <b>{cert.level}</b> ({cert.pct}% de aciertos, {cert.hits}/{cert.total}{" "}
              correctas).
            </div>
          </div>
          <table className="bd-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Aciertos</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {subjects
                .filter((s) => cert.per?.[s.id])
                .map((s) => {
                  const d = cert.per[s.id];
                  return (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>
                        {d.hits}/{d.total}
                      </td>
                      <td>{d.total ? Math.round((d.hits / d.total) * 100) : 0}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="cert-foot">
            <div className="cert-sign">
              <div className="ln" />
              <b>{cfg?.director}</b>
              <small>{cfg?.director_title}</small>
            </div>
            <div className="cert-sign">
              <div className="ln" />
              <b>&nbsp;</b>
              <small>Control Escolar</small>
            </div>
          </div>
          <div className="cert-meta">
            <span>{new Date(cert.created_at).toLocaleString("es-MX")}</span>
            <span>Folio: {cert.folio}</span>
          </div>
        </div>
        <div className="toolbar no-print">
          <button className="btn" onClick={() => window.print()}>
            🖨️ Imprimir / Guardar PDF
          </button>
          <button className="btn sec" onClick={() => setCert(null)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-top">
        <h2>Resultados del examen</h2>
        <div className="spacer" />
        <button className="btn-ghost no-print" onClick={onRefresh}>
          ↻ Recargar
        </button>
      </div>
      <div className="card">
        <div className="cal-stats">
          <div className="stat">
            <b>{n}</b>
            <small>Exámenes presentados</small>
          </div>
          <div className="stat">
            <b>{n ? Math.round(avg * 10) / 10 : "—"}</b>
            <small>Promedio (de {escala})</small>
          </div>
          <div className="stat">
            <b>{n ? Math.round((suf / n) * 100) + "%" : "—"}</b>
            <small>Suficientes</small>
          </div>
          <div className="stat">
            <b>{pend}</b>
            <small>Códigos sin usar</small>
          </div>
        </div>
        <div className="row mt" style={{ alignItems: "flex-end" }}>
          <div>
            <label>Buscar</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre del aspirante" />
          </div>
          <div>
            <label>Estado</label>
            <select value={fstatus} onChange={(e) => setFstatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="suf">Suficientes</option>
              <option value="ins">Insuficientes</option>
            </select>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <button className="btn sec" onClick={exportCSV}>
              ⬇️ Exportar (CSV)
            </button>
          </div>
        </div>
        <div className="mt">
          {!list.length ? (
            <p className="muted center" style={{ padding: 24 }}>
              Aún no hay exámenes presentados.
            </p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>Aspirante</th>
                  <th>Escuela</th>
                  <th>Aciertos</th>
                  <th>Calif.</th>
                  <th>Nivel</th>
                  <th>Fecha</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.student_name}</b>
                    </td>
                    <td>{r.origin || "—"}</td>
                    <td>
                      {r.hits}/{r.total} ({r.pct}%)
                    </td>
                    <td>
                      <b>{Number(r.grade)}</b>
                    </td>
                    <td>
                      <span className="lvl-tag" style={{ background: nivelColor(r.pct, pass) }}>
                        {r.level}
                      </span>
                    </td>
                    <td className="muted">{new Date(r.created_at).toLocaleDateString("es-MX")}</td>
                    <td>
                      <button className="btn sec sm" onClick={() => setCert(r)}>
                        Ver constancia
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ======================= ASPIRANTES ======================= */
function StudentsTab({
  students,
  notify,
  reload,
  ask,
}: {
  students: Student[];
  notify: (m: string, t?: string) => void;
  reload: () => void;
  ask: (msg: string, onYes: () => void) => void;
}) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [cmail, setCmail] = useState("");
  const [search, setSearch] = useState("");
  const [fstatus, setFstatus] = useState("");

  const add = async () => {
    if (!name.trim()) {
      notify("Escribe el nombre del aspirante.", "warn");
      return;
    }
    const { data, error } = await supabase
      .from("students")
      .insert({ full_name: name.trim(), origin: origin.trim(), contact_email: cmail.trim() })
      .select()
      .single();
    if (error) {
      notify(error.message, "err");
      return;
    }
    setName("");
    setOrigin("");
    setCmail("");
    reload();
    notify("Aspirante registrado. Código: " + (data as Student).code, "ok");
  };

  const del = (s: Student) =>
    ask(`¿Quitar a ${s.full_name} del listado?`, async () => {
      await supabase.from("students").delete().eq("id", s.id);
      reload();
    });

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    notify("Código copiado: " + code, "ok");
  };

  const exportCSV = () => {
    if (!students.length) return;
    const head = ["Codigo", "Aspirante", "EscuelaProcedencia", "Estado", "CorreoContacto"];
    let csv = "﻿" + head.join(",") + "\n";
    students.forEach((s) => {
      csv +=
        [s.code, s.full_name, s.origin, s.status === "completed" ? "Contestado" : "Pendiente", s.contact_email]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",") + "\n";
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "aspirantes_codigos.csv";
    a.click();
  };

  const list = students
    .filter((s) => !fstatus || s.status === fstatus)
    .filter(
      (s) =>
        !search ||
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <>
      <div className="admin-top">
        <h2>Aspirantes y códigos</h2>
      </div>
      <div className="card">
        <div className="hint">
          Registra a cada aspirante para generarle un <b>código de un solo uso</b>. El código deja de
          servir cuando termina el examen.
        </div>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div>
            <label>Nombre del aspirante</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
          </div>
          <div>
            <label>Escuela de procedencia</label>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Secundaria de origen" />
          </div>
          <div>
            <label>Correo de contacto</label>
            <input value={cmail} onChange={(e) => setCmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <button className="btn" onClick={add}>
              + Registrar
            </button>
          </div>
        </div>
        <div className="row mt">
          <div style={{ flex: "0 0 auto" }}>
            <button className="btn sec sm" onClick={exportCSV}>
              ⬇️ Exportar lista + códigos (CSV)
            </button>
          </div>
        </div>
        <div className="row mt" style={{ alignItems: "flex-end" }}>
          <div>
            <label>Buscar</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre o código" />
          </div>
          <div>
            <label>Estado</label>
            <select value={fstatus} onChange={(e) => setFstatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Contestados</option>
            </select>
          </div>
        </div>
        <div className="mt">
          {!list.length ? (
            <p className="muted center" style={{ padding: 20 }}>
              {students.length ? "Ningún aspirante coincide." : "Aún no hay aspirantes registrados."}
            </p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Aspirante</th>
                  <th>Escuela de procedencia</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <b style={{ letterSpacing: 1 }}>{s.code}</b>
                    </td>
                    <td>{s.full_name}</td>
                    <td>{s.origin || "—"}</td>
                    <td>
                      <span className={"badge " + (s.status === "completed" ? "ok" : "no")}>
                        {s.status === "completed" ? "✓ Contestado" : "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <button className="btn sec sm" onClick={() => copy(s.code)}>
                        Copiar
                      </button>{" "}
                      <button className="btn sec sm" onClick={() => del(s)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ======================= BANCO DE PREGUNTAS ======================= */
function BankTab({
  subjects,
  questions,
  setQuestions,
  notify,
  reload,
  ask,
}: {
  subjects: Subject[];
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  notify: (m: string, t?: string) => void;
  reload: () => void;
  ask: (msg: string, onYes: () => void) => void;
}) {
  const [sel, setSel] = useState(subjects[0]?.id || "matematicas");
  const list = questions.filter((q) => q.subject_id === sel);

  const setField = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const setOpt = (id: string, oi: number, val: string) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, options: q.options.map((o, i) => (i === oi ? val : o)) } : q)),
    );

  const add = async () => {
    const maxPos = list.reduce((m, q) => Math.max(m, q.position), 0);
    const { error } = await supabase
      .from("questions")
      .insert({ subject_id: sel, position: maxPos + 1, text: "Nueva pregunta", options: ["", "", "", ""], correct: 0 });
    if (error) {
      notify(error.message, "err");
      return;
    }
    reload();
    notify("Pregunta agregada.", "ok");
  };

  const del = (q: Question) =>
    ask("¿Eliminar esta pregunta?", async () => {
      await supabase.from("questions").delete().eq("id", q.id);
      reload();
    });

  const save = async () => {
    const rows = list.map((q) => ({
      id: q.id,
      subject_id: q.subject_id,
      position: q.position,
      text: q.text,
      options: q.options,
      correct: q.correct,
    }));
    const { error } = await supabase.from("questions").upsert(rows);
    if (error) notify(error.message, "err");
    else notify("Banco de preguntas guardado.", "ok");
  };

  return (
    <>
      <div className="admin-top">
        <h2>Banco de preguntas</h2>
      </div>
      <div className="card">
        <div className="hint">
          Marca con ✓ la respuesta correcta. Recuerda <b>Guardar</b> al terminar.
        </div>
        <div className="chips">
          {subjects.map((s) => (
            <span
              key={s.id}
              className={"chip-x" + (s.id === sel ? " act" : "")}
              onClick={() => setSel(s.id)}
            >
              {s.icon} {s.name}{" "}
              <b style={{ color: "var(--azul)" }}>{questions.filter((q) => q.subject_id === s.id).length}</b>
            </span>
          ))}
        </div>
        <div className="row" style={{ alignItems: "center" }}>
          <div className="muted" style={{ flex: 1 }}>
            {list.length} pregunta(s) en {SUBJ_NAME[sel] || sel}
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <button className="btn sec sm" onClick={add}>
              + Pregunta
            </button>
          </div>
        </div>
        <div className="mt">
          {!list.length ? (
            <p className="muted center" style={{ padding: 20 }}>
              No hay preguntas en esta materia.
            </p>
          ) : (
            list.map((q, qi) => (
              <div className="qedit" key={q.id}>
                <div className="qtop">
                  <b>Pregunta {qi + 1}</b>
                  <button className="btn danger sm" onClick={() => del(q)}>
                    Eliminar
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={q.text}
                  style={{ marginTop: 8 }}
                  onChange={(e) => setField(q.id, { text: e.target.value })}
                />
                <div className="opts4">
                  {["A", "B", "C", "D"].map((k, oi) => (
                    <label className="optline" key={oi}>
                      <input
                        type="radio"
                        name={"c_" + q.id}
                        checked={q.correct === oi}
                        onChange={() => setField(q.id, { correct: oi })}
                      />
                      <span className="key" style={{ width: 24, height: 24, fontSize: 12 }}>
                        {k}
                      </span>
                      <input
                        type="text"
                        value={q.options[oi] ?? ""}
                        onChange={(e) => setOpt(q.id, oi, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt">
          <button className="btn" onClick={save}>
            💾 Guardar cambios
          </button>
        </div>
      </div>
    </>
  );
}

/* ======================= CONFIGURACIÓN ======================= */
function ConfigTab({
  cfg,
  setCfg,
  notify,
}: {
  cfg: Config;
  setCfg: React.Dispatch<React.SetStateAction<Config | null>>;
  notify: (m: string, t?: string) => void;
}) {
  const set = (patch: Partial<Config>) => setCfg((c) => (c ? { ...c, ...patch } : c));

  const save = async () => {
    const { error } = await supabase
      .from("config")
      .update({
        school: cfg.school,
        subtitle: cfg.subtitle,
        period: cfg.period,
        director: cfg.director,
        director_title: cfg.director_title,
        pass: cfg.pass,
        escala: cfg.escala,
        shuffle: cfg.shuffle,
        time_limit: cfg.time_limit,
      })
      .eq("id", 1);
    if (error) notify(error.message, "err");
    else notify("Configuración guardada.", "ok");
  };

  return (
    <>
      <div className="admin-top">
        <h2>Configuración</h2>
      </div>
      <div className="card">
        <div className="grid2">
          <div>
            <label>Nombre del instituto</label>
            <input value={cfg.school} onChange={(e) => set({ school: e.target.value })} />
          </div>
          <div>
            <label>Subtítulo del examen</label>
            <input value={cfg.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
          </div>
          <div>
            <label>Periodo / ciclo</label>
            <input value={cfg.period} onChange={(e) => set({ period: e.target.value })} />
          </div>
          <div>
            <label>Calificación mínima para suficiente (%)</label>
            <input
              type="number"
              value={cfg.pass}
              onChange={(e) => set({ pass: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label>Escala de calificación (ej. 10)</label>
            <input
              type="number"
              value={cfg.escala}
              onChange={(e) => set({ escala: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label>Tiempo límite (minutos · 0 = sin límite)</label>
            <input
              type="number"
              value={cfg.time_limit}
              onChange={(e) => set({ time_limit: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label>¿Barajar el orden de las preguntas?</label>
            <select
              value={cfg.shuffle ? "1" : "0"}
              onChange={(e) => set({ shuffle: e.target.value === "1" })}
            >
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>
          <div>
            <label>Firmante (Dirección)</label>
            <input value={cfg.director} onChange={(e) => set({ director: e.target.value })} />
          </div>
          <div>
            <label>Cargo del firmante</label>
            <input value={cfg.director_title} onChange={(e) => set({ director_title: e.target.value })} />
          </div>
        </div>
        <div className="mt">
          <button className="btn" onClick={save}>
            💾 Guardar configuración
          </button>
        </div>
      </div>
    </>
  );
}
