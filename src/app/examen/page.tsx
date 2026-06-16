"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase, rpcMessage } from "@/lib/supabase";

type Q = { id: string; subject_id: string; text: string; options: string[] };
type ExamData = {
  student_name: string;
  school: string;
  subtitle: string;
  shuffle: boolean;
  time_limit: number;
  questions: Q[];
};

const KEYS = ["A", "B", "C", "D"];
const SUBJ: Record<string, string> = {
  matematicas: "Matemáticas",
  lectura: "Lectura y Redacción",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biología",
};

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function ExamenPage() {
  const [phase, setPhase] = useState<"code" | "exam" | "thanks">("code");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [data, setData] = useState<ExamData | null>(null);
  const [items, setItems] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [secsLeft, setSecsLeft] = useState(0);
  const [locks, setLocks] = useState(0);
  const [showLock, setShowLock] = useState(false);
  const [askFinish, setAskFinish] = useState(false);
  const submittedRef = useRef(false);

  const start = async () => {
    const c = code.trim().toUpperCase();
    if (!c) {
      setErr("Escribe tu código.");
      return;
    }
    setBusy(true);
    setErr("");
    const { data: res, error } = await supabase.rpc("start_exam", { p_code: c });
    setBusy(false);
    if (error) {
      setErr(rpcMessage(error));
      return;
    }
    const d = res as ExamData;
    if (!d.questions?.length) {
      setErr("Aún no hay preguntas configuradas. Avisa a Coordinación.");
      return;
    }
    setData(d);
    setItems(d.shuffle ? shuffle(d.questions) : d.questions);
    setAnswers({});
    setIdx(0);
    setSecsLeft(d.time_limit > 0 ? d.time_limit * 60 : 0);
    setPhase("exam");
  };

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setBusy(true);
    const { error } = await supabase.rpc("submit_exam", {
      p_code: code.trim().toUpperCase(),
      p_answers: answers,
    });
    setBusy(false);
    if (error) {
      submittedRef.current = false;
      setErr(rpcMessage(error));
      return;
    }
    setPhase("thanks");
  }, [answers, code]);

  // cronómetro
  useEffect(() => {
    if (phase !== "exam" || !data || data.time_limit <= 0) return;
    if (secsLeft <= 0) {
      void submit();
      return;
    }
    const t = setTimeout(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secsLeft, data, submit]);

  // anti-trampa: cambio de ventana/pestaña
  useEffect(() => {
    if (phase !== "exam") return;
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        setLocks((n) => n + 1);
        setShowLock(true);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase]);

  // ---- pantalla: código ----
  if (phase === "code") {
    return (
      <div className="wrap">
        <Header />
        <Link className="backlink" href="/">
          ← Volver al inicio
        </Link>
        <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Ingresa tu código</h2>
          <p className="muted">
            Coordinación te entregó un <b>código de un solo uso</b>. Escríbelo
            para abrir tu examen de admisión.
          </p>
          <label>Código de acceso</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && start()}
            maxLength={6}
            placeholder="Ej. ABC234"
            autoComplete="off"
            style={{
              textTransform: "uppercase",
              letterSpacing: 4,
              fontSize: 22,
              fontWeight: 800,
              textAlign: "center",
            }}
          />
          {err && (
            <p className="muted" style={{ color: "var(--rojo)" }}>
              {err}
            </p>
          )}
          <div className="mt">
            <button className="btn" style={{ width: "100%" }} disabled={busy} onClick={start}>
              {busy ? "Verificando…" : "Abrir mi examen →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- pantalla: gracias ----
  if (phase === "thanks") {
    return (
      <div className="wrap">
        <Header />
        <div className="card center" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="thanks-ico">
            <svg viewBox="0 0 60 60">
              <path d="M14 31l11 11 21-23" />
            </svg>
          </div>
          <h2 style={{ margin: "0 0 6px" }}>¡Examen enviado!</h2>
          <p className="muted">
            Tus respuestas se registraron correctamente. La Coordinación del
            Instituto Rembrandt revisará tu evaluación y se pondrá en contacto
            contigo.
          </p>
          <p className="muted">¡Te deseamos mucho éxito!</p>
          <div className="mt">
            <Link className="btn" href="/">
              Finalizar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- pantalla: examen ----
  const q = items[idx];
  const n = items.length;
  const answered = Object.keys(answers).length;
  const mins = Math.floor(secsLeft / 60);
  const ss = secsLeft % 60;

  return (
    <div className="wrap">
      <Header school={data?.school} />
      <div className="card">
        <div className="quiz-nav" style={{ marginBottom: 14 }}>
          <span className="muted">{data?.student_name}</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {data && data.time_limit > 0 && (
              <span className="pill">
                ⏱️ {String(mins).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </span>
            )}
            <span className="pill">{SUBJ[q.subject_id] || q.subject_id}</span>
            <span className="pill">
              {idx + 1} / {n}
            </span>
          </div>
        </div>
        <div className="progress">
          <i style={{ width: `${(idx / n) * 100}%` }} />
        </div>
        <div className="qtext">{q.text}</div>
        <div>
          {q.options.map((o, i) => (
            <button
              key={i}
              className={"opt" + (answers[q.id] === i ? " sel" : "")}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
            >
              <span className="key">{KEYS[i]}</span>
              <span>{o}</span>
            </button>
          ))}
        </div>
        <div className="quiz-nav">
          <button
            className="btn sec"
            style={{ visibility: idx === 0 ? "hidden" : "visible" }}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            ← Anterior
          </button>
          {idx < n - 1 ? (
            <button className="btn" onClick={() => setIdx((i) => i + 1)}>
              Siguiente →
            </button>
          ) : (
            <button
              className="btn"
              disabled={busy}
              onClick={() => {
                if (answered < n) setAskFinish(true);
                else void submit();
              }}
            >
              {busy ? "Enviando…" : "Terminar ✓"}
            </button>
          )}
        </div>
        {err && (
          <p className="muted center" style={{ color: "var(--rojo)" }}>
            {err}
          </p>
        )}
      </div>

      {askFinish && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99991,
            background: "rgba(18,28,58,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div className="card center" style={{ maxWidth: 440 }}>
            <h2 style={{ marginTop: 0 }}>Te faltan preguntas</h2>
            <p className="muted">
              Tienes {n - answered} pregunta(s) sin responder. ¿Enviar tu examen
              así? No podrás cambiarlo después.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn sec" onClick={() => setAskFinish(false)}>
                Seguir contestando
              </button>
              <button
                className="btn"
                disabled={busy}
                onClick={() => {
                  setAskFinish(false);
                  void submit();
                }}
              >
                Enviar así
              </button>
            </div>
          </div>
        </div>
      )}

      {showLock && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99990,
            background: "linear-gradient(135deg,#4a1020,#3a0d1a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div className="card center" style={{ maxWidth: 460 }}>
            <div style={{ fontSize: 54 }}>🔒</div>
            <h2 style={{ color: "var(--rojo)", margin: "10px 0 6px" }}>Examen pausado</h2>
            <p className="muted">
              Saliste de la ventana del examen. Por seguridad se registró este
              evento ({locks}). Vuelve para continuar.
            </p>
            <button className="btn" onClick={() => setShowLock(false)}>
              Reanudar examen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ school }: { school?: string }) {
  return (
    <header className="top">
      <div className="logo-box">R</div>
      <div>
        <h1>{school || "Instituto Rembrandt de Querétaro"}</h1>
        <p className="muted">Examen de Admisión · Bachillerato</p>
      </div>
    </header>
  );
}
