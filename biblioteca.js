/* Biblioteca jurídica gratuita - Legalis Click Perú
   Los PDF van en la carpeta /libros del repositorio. Para agregar un libro nuevo,
   copia uno de los bloques de LIBROS, cambia los datos y sube el PDF. */
(function () {
  var LIBROS = [
    { t: 'Constitución Política del Perú', s: '1993', f: 'constitucion-politica-1993.pdf', i: '🇵🇪', c: ['#7f1d1d', '#d91023'], d: 'La norma suprema: derechos fundamentales, organización del Estado y garantías constitucionales.', k: 'Constitucional' },
    { t: 'Código Civil', s: 'D. Leg. 295', f: 'codigo-civil.pdf', i: '⚖️', c: ['#14397a', '#3b82f6'], d: 'Personas, familia, sucesiones, derechos reales, contratos y obligaciones. Vigente desde 1984.', k: 'Civil' },
    { t: 'Código Procesal Civil', s: 'D. Leg. 768', f: 'codigo-procesal-civil.pdf', i: '📜', c: ['#14397a', '#60a5fa'], d: 'Reglas del proceso civil: demanda, plazos, pruebas, sentencias y recursos.', k: 'Civil' },
    { t: 'Código Penal', s: 'D. Leg. 635', f: 'codigo-penal.pdf', i: '🔨', c: ['#3b0d0d', '#b45309'], d: 'Delitos y penas en el Perú. Parte general, delitos en particular y faltas.', k: 'Penal' },
    { t: 'Nuevo Código Procesal Penal', s: 'D. Leg. 957', f: 'nuevo-codigo-procesal-penal.pdf', i: '🛡️', c: ['#3b0d0d', '#e8b04a'], d: 'El proceso penal acusatorio: investigación, juzgamiento, medidas cautelares e impugnación.', k: 'Penal' },
    { t: 'Código de los Niños y Adolescentes', s: 'Ley 27337', f: 'codigo-ninos-adolescentes.pdf', i: '👨‍👩‍👧', c: ['#065f46', '#34d399'], d: 'Derechos de la niñez, régimen de familia, alimentos, tenencia y régimen de visitas.', k: 'Familia' },
    { t: 'Código de Protección y Defensa del Consumidor', s: 'Ley 29571', f: 'codigo-consumidor.pdf', i: '🛒', c: ['#6b21a8', '#c084fc'], d: 'Derechos del consumidor, reclamos, libro de reclamaciones y sanciones.', k: 'Consumidor' },
    { t: 'Nueva Ley Procesal del Trabajo', s: 'Ley 29497', f: 'nueva-ley-procesal-trabajo.pdf', i: '👷', c: ['#9a3412', '#fb923c'], d: 'Proceso laboral oral: demanda, audiencias, despido, beneficios sociales y plazos.', k: 'Laboral' },
    { t: 'Ley del Procedimiento Administrativo General', s: 'TUO Ley 27444', f: 'tuo-ley-27444.pdf', i: '🏛️', c: ['#1e3a5f', '#38bdf8'], d: 'Trámites ante entidades públicas: silencio administrativo, recursos y plazos.', k: 'Administrativo' },
    { t: 'Código Tributario', s: 'TUO D.S. 133-2013-EF', f: 'codigo-tributario.pdf', i: '🧾', c: ['#115e59', '#2dd4bf'], d: 'Obligaciones tributarias, SUNAT, infracciones, sanciones y procedimientos.', k: 'Tributario' }
  ];
  var BASE = 'libros/';
  var FUENTE = 'https://spij.minjus.gob.pe/';

  var css = '' +
    '.bib-bar{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 22px}.bib-bar input{max-width:420px}' +
    '.bib{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}' +
    '.bk2{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:transform .25s,border-color .25s}' +
    '.bk2:hover{transform:translateY(-5px);border-color:var(--gold)}' +
    '.cv{position:relative;aspect-ratio:3/4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px;text-align:center;color:#fff;border-bottom:4px solid var(--gold)}' +
    '.cv::before{content:"";position:absolute;inset:10px;border:1px solid rgba(255,255,255,.35);border-radius:8px}' +
    '.cv .ico{font-size:3.4rem;line-height:1;position:relative}.cv b{font-size:.95rem;line-height:1.25;position:relative}.cv small{position:relative;opacity:.85;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}' +
    '.cv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.bk2 .in{padding:14px;display:flex;flex-direction:column;gap:10px;flex:1}.bk2 .tag{font-size:.7rem;color:var(--gold);font-weight:700;letter-spacing:.08em;text-transform:uppercase}' +
    '.bk2 p{margin:0;font-size:.85rem;color:var(--mut);flex:1}.bk2 .btn{padding:10px 16px;font-size:.88rem}' +
    '#bibM{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.85);display:none;flex-direction:column}#bibM.on{display:flex}' +
    '#bibM .hd{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px;background:#0f1524;border-bottom:1px solid var(--line)}' +
    '#bibM .hd b{flex:1;min-width:160px}#bibM .btn{padding:8px 16px;font-size:.85rem}' +
    '#bibM iframe{flex:1;width:100%;border:0;background:#fff}#bibM .er{flex:1;display:none;place-items:center;text-align:center;padding:30px;color:var(--mut)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var grid = document.getElementById('bibGrid'), q = document.getElementById('bibQ');
  if (!grid) return;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  function card(b) {
    var a = el('article', 'bk2');
    var cv = el('div', 'cv');
    cv.style.background = 'linear-gradient(160deg,' + b.c[0] + ',' + b.c[1] + ')';
    if (b.img) { var im = el('img'); im.src = b.img; im.alt = 'Portada de ' + b.t; im.loading = 'lazy'; cv.appendChild(im); }
    else { cv.append(el('div', 'ico', b.i), el('b', '', b.t), el('small', '', b.s)); }
    var inn = el('div', 'in');
    var rd = el('button', 'btn', '📖 Leer ahora'); rd.type = 'button'; rd.onclick = function () { openBook(b); };
    var fu = el('a', 'btn alt', 'Fuente oficial'); fu.href = FUENTE; fu.target = '_blank'; fu.rel = 'noopener noreferrer';
    inn.append(el('span', 'tag', b.k), el('h3', '', b.t), el('p', '', b.d), rd, fu);
    a.append(cv, inn);
    return a;
  }

  function draw() {
    var t = (q && q.value || '').toLowerCase().trim();
    grid.innerHTML = '';
    var list = LIBROS.filter(function (b) { return !t || (b.t + ' ' + b.k + ' ' + b.s + ' ' + b.d).toLowerCase().indexOf(t) > -1; });
    if (!list.length) { grid.appendChild(el('p', 'sub', 'No encontramos libros con esa búsqueda.')); return; }
    list.forEach(function (b) { grid.appendChild(card(b)); });
  }
  if (q) q.addEventListener('input', draw);
  draw();

  /* Visor integrado */
  var m = el('div'); m.id = 'bibM'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Lector de libros');
  var hd = el('div', 'hd'), ttl = el('b');
  var op = el('a', 'btn alt', 'Abrir en pestaña'); op.target = '_blank'; op.rel = 'noopener noreferrer';
  var dl = el('a', 'btn alt', '⬇ Descargar'); dl.setAttribute('download', '');
  var cl = el('button', 'btn', '✕ Cerrar'); cl.type = 'button';
  hd.append(ttl, op, dl, cl);
  var fr = el('iframe'); fr.title = 'Visor PDF';
  var er = el('div', 'er'); er.textContent = 'Este libro todavía no está disponible. Inténtalo más tarde.';
  m.append(hd, fr, er); document.body.appendChild(m);

  function closeBook() { m.classList.remove('on'); fr.src = 'about:blank'; document.body.style.overflow = ''; }
  cl.onclick = closeBook;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('on')) closeBook(); });

  function openBook(b) {
    var url = BASE + b.f;
    ttl.textContent = b.t;
    op.href = url; dl.href = url;
    fr.style.display = 'block'; er.style.display = 'none';
    m.classList.add('on'); document.body.style.overflow = 'hidden';
    fetch(url, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      fr.src = url + '#toolbar=1&navpanes=0';
    }).catch(function () { fr.style.display = 'none'; er.style.display = 'grid'; });
  }
})();
