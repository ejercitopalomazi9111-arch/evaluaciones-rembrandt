/**
 * Plano vivo — animación de fondo del Instituto Rembrandt.
 *
 * Un solo archivo sin dependencias, compartido por el sitio Next y por la
 * versión empaquetada en un archivo. Anima en <canvas> lo que antes eran SVG
 * estáticos: las cuñas diagonales del membrete y los trazos del circuito.
 *
 * Reglas de rendimiento, deliberadas:
 *  - Un único requestAnimationFrame para TODOS los lienzos de la página.
 *  - Cada lienzo se pausa cuando sale de pantalla (IntersectionObserver).
 *  - DPR tapado a 1.5: en pantallas 3x el coste se triplica sin verse mejor.
 *  - Presupuesto de ~30 fps para el ambiente; el ojo no distingue más en un
 *    fondo que se mueve lento, y deja la mitad del hilo libre para el scroll.
 *  - Con prefers-reduced-motion se dibuja UN fotograma y se detiene todo.
 */
(function () {
  'use strict';

  var AZUL = '#1b2a8f';
  var AZUL_VIVO = '#2e42c8';
  var ROJO = '#d0202e';
  var HUESO = '#f4f3ef';

  var quieto =
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lienzos = [];
  var corriendo = false;
  var ultimo = 0;
  var PASO = 1000 / 30;

  function rng(semilla) {
    var a = semilla >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Cuñas diagonales: el gesto del membrete, ahora con entrada ───────── */
  function crearCunas(L) {
    var r = rng(20260817);
    var bandas = [];
    for (var i = 0; i < 5; i++) {
      bandas.push({
        x: 1 - i * (0.09 + r() * 0.05) - 0.04,
        w: 0.04 + r() * 0.11,
        sesgo: 0.16 + r() * 0.1,
        color: i % 2 ? AZUL_VIVO : AZUL,
        alpha: 0.5 - i * 0.07,
        deriva: 0.2 + r() * 0.5,
        retraso: i * 90,
      });
    }
    bandas.push({
      x: 0.45 + r() * 0.16,
      w: 0.016,
      sesgo: 0.2,
      color: ROJO,
      alpha: 0.92,
      deriva: 0.9,
      retraso: 460,
      filo: true,
    });
    L.bandas = bandas;
    L.marcas = [];
    for (var m = 0; m < 4; m++) L.marcas.push({ x: 0.08 + r() * 0.8, y: 0.1 + r() * 0.8 });
  }

  function pintarCunas(L, ctx, w, h, t) {
    for (var i = 0; i < L.bandas.length; i++) {
      var b = L.bandas[i];
      // entrada: cada banda entra deslizando desde la derecha
      var e = Math.min(1, Math.max(0, (t - b.retraso) / 900));
      e = 1 - Math.pow(1 - e, 3);
      if (e <= 0) continue;
      var vaiven = Math.sin((t / 1000) * 0.18 + i) * b.deriva * 0.006;
      var x = (b.x + vaiven + (1 - e) * 0.35) * w;
      var bw = b.w * w;
      var s = b.sesgo * w;
      ctx.globalAlpha = b.alpha * e;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + bw, 0);
      ctx.lineTo(x + bw - s, h);
      ctx.lineTo(x - s, h);
      ctx.closePath();
      ctx.fill();
    }
    // marcas de registro que aparecen al final
    var em = Math.min(1, Math.max(0, (t - 900) / 700));
    ctx.globalAlpha = 0.45 * em;
    ctx.strokeStyle = HUESO;
    ctx.lineWidth = 1;
    for (var k = 0; k < L.marcas.length; k++) {
      var mx = L.marcas[k].x * w;
      var my = L.marcas[k].y * h;
      var l = 13;
      ctx.beginPath();
      ctx.moveTo(mx - l, my); ctx.lineTo(mx + l, my);
      ctx.moveTo(mx, my - l); ctx.lineTo(mx, my + l);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ── Circuito: trazos ortogonales con pulsos que viajan ───────────────── */
  function crearCircuito(L) {
    var r = rng(771);
    var trazos = [];
    for (var i = 0; i < 18; i++) {
      var x = 1 - r() * 0.12;
      var y = Math.round(r() * 16) / 16;
      var pts = [[x, y]];
      var n = 3 + Math.floor(r() * 4);
      for (var t = 0; t < n; t++) {
        if (t % 2 === 0) x -= (1 + Math.floor(r() * 4)) * 0.045;
        else y += (r() > 0.5 ? 1 : -1) * (1 + Math.floor(r() * 3)) * 0.055;
        y = Math.max(0.02, Math.min(0.98, y));
        pts.push([x, y]);
        if (x < 0.04) break;
      }
      trazos.push({
        pts: pts,
        rojo: r() > 0.82,
        alpha: 0.3 + r() * 0.45,
        fase: r(),
        vel: 0.06 + r() * 0.1,
      });
    }
    L.trazos = trazos;
  }

  function pintarCircuito(L, ctx, w, h, t) {
    var seg = t / 1000;
    for (var i = 0; i < L.trazos.length; i++) {
      var tr = L.trazos[i];
      var col = tr.rojo ? ROJO : AZUL_VIVO;
      // el trazo se dibuja progresivamente al entrar
      var e = Math.min(1, Math.max(0, (t - i * 45) / 800));
      if (e <= 0) continue;
      var total = tr.pts.length - 1;
      var hasta = e * total;

      ctx.globalAlpha = tr.alpha;
      ctx.strokeStyle = col;
      ctx.lineWidth = tr.rojo ? 2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(tr.pts[0][0] * w, tr.pts[0][1] * h);
      for (var s = 1; s <= total; s++) {
        var f = Math.min(1, Math.max(0, hasta - (s - 1)));
        if (f <= 0) break;
        var a = tr.pts[s - 1], b = tr.pts[s];
        ctx.lineTo((a[0] + (b[0] - a[0]) * f) * w, (a[1] + (b[1] - a[1]) * f) * h);
      }
      ctx.stroke();

      if (e < 1) continue;

      // nodo terminal
      var fin = tr.pts[total];
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = col;
      ctx.fillRect(fin[0] * w - 4, fin[1] * h - 4, 8, 8);

      // pulso que recorre el trazo — el detalle que lo hace estar vivo
      var u = ((seg * tr.vel + tr.fase) % 1) * total;
      var idx = Math.floor(u);
      var fr = u - idx;
      var pa = tr.pts[Math.min(idx, total - 1)];
      var pb = tr.pts[Math.min(idx + 1, total)];
      var px = (pa[0] + (pb[0] - pa[0]) * fr) * w;
      var py = (pa[1] + (pb[1] - pa[1]) * fr) * h;
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = tr.rojo ? ROJO : HUESO;
      ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    }
    ctx.globalAlpha = 1;
  }

  var TIPOS = {
    cunas: { crear: crearCunas, pintar: pintarCunas },
    circuito: { crear: crearCircuito, pintar: pintarCircuito },
  };

  function medir(L) {
    var caja = L.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(caja.width));
    var h = Math.max(1, Math.round(caja.height));
    if (w === L.w && h === L.h && dpr === L.dpr) return;
    L.w = w; L.h = h; L.dpr = dpr;
    L.el.width = Math.round(w * dpr);
    L.el.height = Math.round(h * dpr);
    L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L.sucio = true;
  }

  function pintar(L, ahora) {
    medir(L);
    if (!L.visible && !L.sucio) return;
    var t = ahora - L.nacido;
    var terminado = t > 2200;
    if (terminado && !L.animado && !L.sucio) return;
    L.ctx.clearRect(0, 0, L.w, L.h);
    L.tipo.pintar(L, L.ctx, L.w, L.h, quieto ? 3000 : t);
    L.sucio = false;
  }

  function bucle(ahora) {
    if (ahora - ultimo >= PASO) {
      ultimo = ahora;
      for (var i = 0; i < lienzos.length; i++) {
        var L = lienzos[i];
        if (L.visible) pintar(L, ahora);
      }
    }
    requestAnimationFrame(bucle);
  }

  function iniciar() {
    var nodos = document.querySelectorAll('canvas[data-lienzo]');
    if (!nodos.length) return;

    var io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            function (es) {
              es.forEach(function (e) {
                var L = e.target.__L;
                if (!L) return;
                L.visible = e.isIntersecting;
                if (L.visible) L.sucio = true;
              });
            },
            { rootMargin: '120px' },
          )
        : null;

    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      var tipo = TIPOS[el.dataset.lienzo];
      if (!tipo || el.__L) continue;
      var L = {
        el: el,
        ctx: el.getContext('2d'),
        tipo: tipo,
        nacido: performance.now(),
        visible: !io,
        animado: el.dataset.lienzo === 'circuito',
        sucio: true,
        w: 0, h: 0, dpr: 0,
      };
      tipo.crear(L);
      el.__L = L;
      lienzos.push(L);
      if (io) io.observe(el);
    }

    if (quieto) {
      // un solo fotograma, sin bucle
      requestAnimationFrame(function (t) {
        lienzos.forEach(function (L) { L.visible = true; pintar(L, t + 3000); });
      });
      return;
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); }
    addEventListener('resize', function () {
      lienzos.forEach(function (L) { L.dpr = 0; L.sucio = true; });
    }, { passive: true });
  }


  /* ── Contadores: las cifras suben al entrar en pantalla ───────────────── */
  function contadores() {
    var nodos = document.querySelectorAll('[data-contador]');
    if (!nodos.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var fin = parseFloat(el.dataset.contador);
        var sufijo = el.dataset.sufijo || '';
        if (quieto || !isFinite(fin)) { el.textContent = fin + sufijo; return; }
        var t0 = performance.now();
        var dur = 900;
        (function paso(t) {
          var k = Math.min(1, (t - t0) / dur);
          k = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(fin * k) + sufijo;
          if (k < 1) requestAnimationFrame(paso);
        })(t0);
      });
    }, { threshold: 0.5 });
    for (var i = 0; i < nodos.length; i++) io.observe(nodos[i]);
  }

  /* ── Revelado al hacer scroll ─────────────────────────────────────────── */
  function revelados(raiz) {
    var nodos = (raiz || document).querySelectorAll('.revelar:not([data-visible])');
    if (!nodos.length) return;
    if (quieto || !('IntersectionObserver' in window)) {
      for (var i = 0; i < nodos.length; i++) nodos[i].dataset.visible = 'true';
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.dataset.visible = 'true';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var j = 0; j < nodos.length; j++) io.observe(nodos[j]);
  }

  function arrancarTodo() {
    iniciar();
    contadores();
    revelados();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancarTodo);
  } else {
    arrancarTodo();
  }
  window.__motor = { lienzos: iniciar, contadores: contadores, revelados: revelados };
})();
