import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap">
      <header className="top">
        <div className="logo-box">R</div>
        <div>
          <h1>Instituto Rembrandt de Querétaro</h1>
          <p className="muted">Examen de Admisión · Bachillerato</p>
        </div>
        <div className="spacer" />
        <Link className="btn-ghost" href="/coordinacion">
          Coordinación
        </Link>
      </header>

      <section className="hero">
        <span className="hero-badge">RESPETO · CULTURA · HONOR</span>
        <h2>Examen de Admisión</h2>
        <p>Bachillerato · Nuevo ingreso</p>
      </section>

      <div className="hub-grid">
        <Link
          href="/examen"
          className="hub-card"
          style={{ textDecoration: "none" }}
        >
          <div className="big">📝</div>
          <h3>Presentar mi examen</h3>
          <p>
            Soy aspirante. Entro con el código que me dio la escuela y contesto
            mi examen de admisión.
          </p>
          <span className="btn">Comenzar examen</span>
        </Link>

        <Link
          href="/coordinacion"
          className="hub-card"
          style={{ textDecoration: "none" }}
        >
          <div className="big">🔐</div>
          <h3>Coordinación</h3>
          <p>
            Acceso del personal. Revisa resultados, gestiona aspirantes, códigos
            y el banco de preguntas.
          </p>
          <span className="btn sec">Entrar</span>
        </Link>
      </div>
    </div>
  );
}
