/* Legalis Click Perú · Accesibilidad
   Se agrega SIN reescribir tu código: solo cárgalo al final de index.html.
   Incluye: navegación por teclado, teclado en pantalla, texto a voz para el chatbot,
   dictado por micrófono, alto contraste y tamaño de letra. */
(function () {
  'use strict';
  function init() {
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var synth = window.speechSynthesis;
    var auto = false, rate = 1, size = 100, kbOn = false, shift = false, lastField = null;

    /* ---------- ESTILOS ---------- */
    var css = [
      '.ac-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
      '.skip-link{position:fixed;left:-9999px;top:8px;z-index:200;background:#fff;color:#000;padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none}',
      '.skip-link:focus{left:8px}',
      ':focus-visible{outline:3px solid #ffd54a!important;outline-offset:3px}',
      '.sr:focus-within{outline:3px solid #ffd54a;outline-offset:2px}',
      '.sr input:focus-visible{outline:none!important}',
      '#ac-fab{position:fixed;left:18px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:31;width:56px;height:56px;border-radius:50%;border:2px solid #fff;background:#1e4fa3;color:#fff;font-size:1.6rem;cursor:pointer;padding:0}',
      '#ac-panel{position:fixed;left:14px;bottom:calc(152px + env(safe-area-inset-bottom,0px));z-index:31;width:min(330px,calc(100vw - 28px));background:#0d1424;color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:16px;padding:12px;display:none;gap:8px;grid-template-columns:1fr 1fr;box-shadow:0 20px 60px rgba(0,0,0,.6)}',
      '#ac-panel.on{display:grid}',
      '#ac-panel h2{grid-column:1/-1;font-size:1.05rem;margin:0 0 2px}',
      '#ac-panel button{background:#2a3345;color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:10px 8px;font:600 .85rem system-ui,sans-serif;cursor:pointer}',
      '#ac-panel button[aria-pressed="true"]{background:#e8b04a;color:#000}',
      '.ac-note{grid-column:1/-1;font-size:.74rem;color:#a3aec2;line-height:1.4}',
      '.ac-listen{align-self:flex-start;background:transparent;color:#e8b04a;border:1px solid #e8b04a;border-radius:16px;padding:5px 12px;font-size:.8rem;cursor:pointer;margin-top:-2px}',
      '#ac-mic[aria-pressed="true"]{background:#d91023;color:#fff}',
      '#ac-kb{position:fixed;left:0;right:0;bottom:0;z-index:70;background:#0b1020;border-top:2px solid #e8b04a;padding:8px;display:none;user-select:none;-webkit-user-select:none}',
      '#ac-kb.on{display:block}',
      '#ac-kb .kr{display:flex;justify-content:center;gap:4px;margin-bottom:4px}',
      '#ac-kb button{flex:1 1 0;max-width:56px;min-width:0;height:44px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:#1b2437;color:#fff;font:600 1rem system-ui,sans-serif;cursor:pointer;padding:0}',
      '#ac-kb button.w{max-width:none;flex:2 1 0;font-size:.85rem}',
      '#ac-kb button.sp{flex:6 1 0;max-width:420px;font-size:.85rem}',
      '#ac-kb button[aria-pressed="true"]{background:#e8b04a;color:#000}',
      'body.ac-kb-on{padding-bottom:var(--kbh,0px)}',
      'body.ac-kb-on #chat{bottom:calc(var(--kbh,0px) + 92px)!important;max-height:calc(100vh - var(--kbh,0px) - 110px)}',
      'body.ac-kb-on #fab{bottom:calc(var(--kbh,0px) + 18px)!important}',
      'body.ac-kb-on #wa{bottom:calc(var(--kbh,0px) + 18px)!important}',
      'body.ac-kb-on #ac-fab{bottom:calc(var(--kbh,0px) + 86px)!important}',
      'body.ac-kb-on #ac-panel{bottom:calc(var(--kbh,0px) + 152px)!important}',
      '.drop:focus-visible{background:rgba(232,176,74,.15)}',
      /* alto contraste */
      'html.ac-hc{--bg:#000;--card:#000;--txt:#fff;--mut:#fff;--line:#fff;--gold:#ffe600;--blue:#0a3cff;--slate:#000}',
      'html.ac-hc body{background:#000;color:#fff}',
      'html.ac-hc .pb,html.ac-hc .hero,html.ac-hc .top,html.ac-hc footer.ft,html.ac-hc .ann{background:#000!important}',
      'html.ac-hc .pb::before,html.ac-hc .hero::before,html.ac-hc .orb,html.ac-hc .stripe{display:none}',
      'html.ac-hc .bot{background:#000;border:2px solid #fff}',
      'html.ac-hc #chat{background:#000;border-color:#fff}',
      'html.ac-hc .btn.alt{border:2px solid #fff}',
      'html.ac-hc .card,html.ac-hc .member,html.ac-hc .fi,html.ac-hc .rd{border:2px solid #fff}'
    ].join('\n');
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    /* ---------- UTILIDADES ---------- */
    var live = document.createElement('div');
    live.id = 'ac-live'; live.className = 'ac-vh'; live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
    function anuncia(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 40); }

    /* ---------- ESTRUCTURA Y TECLADO FÍSICO ---------- */
    var main = $('main');
    if (main) { main.id = main.id || 'contenido'; main.setAttribute('tabindex', '-1'); }
    var skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = '#contenido'; skip.textContent = 'Saltar al contenido principal';
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      var v = $('.view.on h1') || main;
      if (v) { v.setAttribute('tabindex', '-1'); v.focus(); }
    });
    document.body.insertBefore(skip, document.body.firstChild);

    var nav = $('#menu'); if (nav) nav.setAttribute('aria-label', 'Menú principal');
    $$('.sv .ic,.orb,.stripe,#juez3d').forEach(function (e) { e.setAttribute('aria-hidden', 'true'); });
    var vid = $('video'); if (vid) vid.setAttribute('aria-label', 'Video de presentación de Legalis Click Perú');

    // Etiquetas para campos que solo tienen placeholder
    $$('input:not([type=checkbox]):not([type=file]),textarea,select').forEach(function (el) {
      if (el.hasAttribute('aria-label') || el.closest('label')) return;
      var t = el.placeholder || (el.tagName === 'SELECT' && el.options[0] && el.options[0].text) || '';
      if (t) el.setAttribute('aria-label', t.replace(/^🔍\s*/, ''));
    });

    // Zona de adjuntar expedientes: que se pueda activar con teclado
    var drop = $('#drop'), fi = $('#fi');
    if (drop && fi) {
      drop.setAttribute('tabindex', '0'); drop.setAttribute('role', 'button');
      drop.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); }
      });
    }

    function marcaMenu() {
      $$('#menu a').forEach(function (a) {
        if (a.classList.contains('on')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    }
    setTimeout(marcaMenu, 150);
    window.addEventListener('hashchange', function () {
      detener();
      setTimeout(function () {
        marcaMenu();
        var h = $('.view.on h1');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }, 80);
    });

    /* ---------- CHAT: accesibilidad básica ---------- */
    var msgs = $('#msgs');
    if (msgs) { msgs.setAttribute('role', 'log'); msgs.setAttribute('aria-live', 'polite'); msgs.setAttribute('aria-label', 'Conversación con el asistente'); }
    var chat = $('#chat');
    var closeX = $('#chat .ch span');
    if (closeX) {
      closeX.setAttribute('role', 'button'); closeX.tabIndex = 0; closeX.setAttribute('aria-label', 'Cerrar chat');
      closeX.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.openChat(false); var f = $('#fab'); if (f) f.focus(); }
      });
    }
    var _oc = window.openChat;
    if (typeof _oc === 'function') {
      window.openChat = function (on) {
        _oc(on);
        var abierto = chat.classList.contains('on');
        var f = $('#fab'); if (f) f.setAttribute('aria-expanded', abierto);
        if (abierto) setTimeout(function () { var i = $('#cin'); if (i) i.focus(); }, 60);
      };
    }

    /* ---------- TEXTO A VOZ ---------- */
    function pickVoice() {
      if (!synth) return null;
      var v = synth.getVoices();
      return v.filter(function (x) { return /^es[-_]PE/i.test(x.lang); })[0] ||
        v.filter(function (x) { return /^es[-_](MX|US|419|CO|AR|CL)/i.test(x.lang); })[0] ||
        v.filter(function (x) { return /^es/i.test(x.lang); })[0] || null;
    }
    function limpia(t) {
      return t.replace(/https?:\/\/\S+/g, ' enlace ').replace(/[*_#`>~|]/g, '').replace(/\s+/g, ' ').trim();
    }
    function trozos(t) {
      var out = [], buf = '';
      (t.match(/[^.!?\n]+[.!?]*/g) || [t]).forEach(function (s) {
        s = s.trim(); if (!s) return;
        while (s.length > 200) {
          var i = s.lastIndexOf(' ', 200); if (i < 50) i = 200;
          out.push(s.slice(0, i)); s = s.slice(i).trim();
        }
        if ((buf + ' ' + s).length > 200) { if (buf) out.push(buf); buf = s; }
        else buf = buf ? buf + ' ' + s : s;
      });
      if (buf) out.push(buf);
      return out;
    }
    function hablar(texto) {
      if (!synth) { anuncia('Tu navegador no permite leer en voz alta.'); return; }
      synth.cancel();
      var lista = trozos(limpia(texto || ''));
      if (!lista.length) return;
      setTimeout(function () {
        var voz = pickVoice();
        lista.forEach(function (c) {
          var u = new SpeechSynthesisUtterance(c);
          u.lang = voz ? voz.lang : 'es-PE';
          if (voz) u.voice = voz;
          u.rate = rate;
          synth.speak(u);
        });
      }, 60);
    }
    function detener() { if (synth) synth.cancel(); }

    // Botón "Escuchar" en cada respuesta del asistente (sin tocar tu código del chat)
    function procesar() {
      if (!msgs) return;
      $$('.m.bot', msgs).forEach(function (b) {
        var t = b.textContent.trim();
        if (t === 'Escribiendo…') { b.dataset.esp = '1'; return; }
        if (b.dataset.listo) return;
        b.dataset.listo = '1';
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'ac-listen'; btn.textContent = '🔊 Escuchar';
        btn.setAttribute('aria-label', 'Escuchar esta respuesta');
        btn.addEventListener('click', function () { hablar(b.textContent); });
        b.insertAdjacentElement('afterend', btn);
        if (b.dataset.esp && auto) hablar(t);
      });
    }
    if (msgs) new MutationObserver(procesar).observe(msgs, { childList: true, subtree: true, characterData: true });
    procesar();

    /* ---------- DICTADO POR MICRÓFONO ---------- */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var row = $('#chat .row');
    if (SR && row) {
      var mic = document.createElement('button');
      mic.type = 'button'; mic.id = 'ac-mic'; mic.className = 'btn alt'; mic.textContent = '🎤';
      mic.setAttribute('aria-label', 'Hablar para escribir tu consulta'); mic.setAttribute('aria-pressed', 'false');
      row.insertBefore(mic, row.lastElementChild);
      var rec = null, grabando = false;
      mic.addEventListener('click', function () {
        if (grabando && rec) { rec.stop(); return; }
        detener();
        rec = new SR(); rec.lang = 'es-PE'; rec.interimResults = false; rec.maxAlternatives = 1;
        rec.onstart = function () { grabando = true; mic.setAttribute('aria-pressed', 'true'); mic.textContent = '⏺'; anuncia('Escuchando. Habla ahora.'); };
        rec.onend = function () { grabando = false; mic.setAttribute('aria-pressed', 'false'); mic.textContent = '🎤'; };
        rec.onerror = function () { anuncia('No se pudo usar el micrófono. Revisa el permiso del navegador.'); };
        rec.onresult = function (e) {
          var txt = e.results[0][0].transcript, i = $('#cin');
          i.value = (i.value ? i.value + ' ' : '') + txt; i.focus();
          anuncia('Escribí: ' + txt + '. Presiona Enter para enviar.');
        };
        rec.start();
      });
    }

    /* ---------- TECLADO EN PANTALLA ---------- */
    var ROWS = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACK'],
      ['á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '?', '¡', '!'],
      ['@', '.', ',', '-', '_', 'SPACE', 'ENTER', 'CLOSE']
    ];
    var kb = document.createElement('div');
    kb.id = 'ac-kb'; kb.setAttribute('role', 'group'); kb.setAttribute('aria-label', 'Teclado en pantalla');
    ROWS.forEach(function (fila) {
      var r = document.createElement('div'); r.className = 'kr';
      fila.forEach(function (k) {
        var b = document.createElement('button'); b.type = 'button'; b.dataset.k = k;
        if (k === 'SHIFT') { b.textContent = '⇧'; b.className = 'w'; b.id = 'ac-shift'; b.setAttribute('aria-label', 'Mayúsculas'); b.setAttribute('aria-pressed', 'false'); }
        else if (k === 'BACK') { b.textContent = '⌫'; b.className = 'w'; b.setAttribute('aria-label', 'Borrar'); }
        else if (k === 'SPACE') { b.textContent = 'Espacio'; b.className = 'sp'; }
        else if (k === 'ENTER') { b.textContent = '↵ Enviar'; b.className = 'w'; b.setAttribute('aria-label', 'Enter o enviar'); }
        else if (k === 'CLOSE') { b.textContent = '✕ Cerrar'; b.className = 'w'; b.setAttribute('aria-label', 'Cerrar teclado en pantalla'); }
        else { b.textContent = k; b.dataset.l = '1'; b.setAttribute('aria-label', k); }
        r.appendChild(b);
      });
      kb.appendChild(r);
    });
    document.body.appendChild(kb);

    var CAMPO = 'input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit]),textarea';
    document.addEventListener('focusin', function (e) {
      if (e.target.matches && e.target.matches(CAMPO)) {
        lastField = e.target;
        if (kbOn) {
          if (!e.target.hasAttribute('inputmode')) { e.target.setAttribute('inputmode', 'none'); e.target.dataset.acIm = '1'; }
          setTimeout(function () { e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80);
        }
      }
    });
    function objetivo() {
      if (lastField && document.body.contains(lastField) && !lastField.disabled && lastField.getClientRects().length) return lastField;
      if (chat && chat.classList.contains('on')) return $('#cin');
      return null;
    }
    function ins(el, txt) {
      if (el.maxLength > 0 && el.value.length >= el.maxLength) return;
      var s = el.selectionStart, e = el.selectionEnd;
      if (typeof s === 'number') el.setRangeText(txt, s, e, 'end'); else el.value += txt;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function borra(el) {
      var s = el.selectionStart, e = el.selectionEnd;
      if (typeof s === 'number') {
        if (s !== e) el.setRangeText('', s, e, 'end');
        else if (s > 0) el.setRangeText('', s - 1, s, 'end');
      } else el.value = el.value.slice(0, -1);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function enter(el) {
      if (el.tagName === 'TEXTAREA') { ins(el, '\n'); return; }
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
      if (el.id !== 'cin' && el.form && el.form.requestSubmit) el.form.requestSubmit();
    }
    function pintaTeclas() {
      $$('#ac-kb button[data-l]').forEach(function (b) {
        var k = b.dataset.k; b.textContent = shift ? k.toUpperCase() : k;
      });
      $('#ac-shift').setAttribute('aria-pressed', shift);
    }
    kb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    kb.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var k = b.dataset.k;
      if (k === 'SHIFT') { shift = !shift; pintaTeclas(); return; }
      if (k === 'CLOSE') { setKb(false); return; }
      var el = objetivo();
      if (!el) { anuncia('Primero selecciona un campo de texto.'); return; }
      if (k === 'BACK') borra(el);
      else if (k === 'SPACE') ins(el, ' ');
      else if (k === 'ENTER') enter(el);
      else { ins(el, shift ? k.toUpperCase() : k); if (shift) { shift = false; pintaTeclas(); } }
    });

    var bKb;
    function setKb(on) {
      kbOn = on;
      kb.classList.toggle('on', on);
      document.body.classList.toggle('ac-kb-on', on);
      document.documentElement.style.setProperty('--kbh', on ? kb.offsetHeight + 'px' : '0px');
      $$(CAMPO).forEach(function (el) {
        if (on) { if (!el.hasAttribute('inputmode')) { el.setAttribute('inputmode', 'none'); el.dataset.acIm = '1'; } }
        else if (el.dataset.acIm) { el.removeAttribute('inputmode'); delete el.dataset.acIm; }
      });
      if (bKb) bKb.setAttribute('aria-pressed', on);
      anuncia(on ? 'Teclado en pantalla activado' : 'Teclado en pantalla cerrado');
    }
    window.addEventListener('resize', function () {
      if (kbOn) document.documentElement.style.setProperty('--kbh', kb.offsetHeight + 'px');
    });

    /* ---------- PANEL DE ACCESIBILIDAD ---------- */
    var fab = document.createElement('button');
    fab.id = 'ac-fab'; fab.type = 'button'; fab.textContent = '♿';
    fab.setAttribute('aria-label', 'Abrir herramientas de accesibilidad');
    fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'ac-panel');
    var panel = document.createElement('div');
    panel.id = 'ac-panel'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Herramientas de accesibilidad');
    panel.innerHTML = '<h2>Accesibilidad</h2>';
    function btn(txt, fn, toggle) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = txt;
      if (toggle) b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', fn); panel.appendChild(b); return b;
    }
    function leerPagina() { var v = $('.view.on'); hablar((v || document.body).innerText); }
    btn('🔊 Leer la página', leerPagina);
    btn('⏹ Detener voz', detener);
    var bAuto = btn('Voz automática del chat: no', function () {
      auto = !auto; bAuto.setAttribute('aria-pressed', auto);
      bAuto.textContent = 'Voz automática del chat: ' + (auto ? 'sí' : 'no');
    }, true);
    var bVel = btn('Velocidad de voz: normal', function () {
      rate = rate === 1 ? 0.8 : (rate === 0.8 ? 1.25 : 1);
      bVel.textContent = 'Velocidad de voz: ' + (rate === 0.8 ? 'lenta' : rate === 1.25 ? 'rápida' : 'normal');
    });
    function aplicaTam() { document.documentElement.style.fontSize = size + '%'; }
    btn('A+ Letra más grande', function () { size = Math.min(size + 10, 200); aplicaTam(); anuncia('Letra al ' + size + ' por ciento'); });
    btn('A− Letra más pequeña', function () { size = Math.max(size - 10, 80); aplicaTam(); anuncia('Letra al ' + size + ' por ciento'); });
    var bHC = btn('◐ Alto contraste', function () {
      var on = document.documentElement.classList.toggle('ac-hc');
      bHC.setAttribute('aria-pressed', on);
    }, true);
    bKb = btn('⌨ Teclado en pantalla', function () { setKb(!kbOn); }, true);
    btn('↺ Restablecer todo', function () {
      detener(); auto = false; rate = 1; size = 100; aplicaTam();
      document.documentElement.classList.remove('ac-hc');
      bAuto.setAttribute('aria-pressed', 'false'); bAuto.textContent = 'Voz automática del chat: no';
      bVel.textContent = 'Velocidad de voz: normal'; bHC.setAttribute('aria-pressed', 'false');
      setKb(false);
    });
    var nota = document.createElement('div'); nota.className = 'ac-note';
    nota.textContent = 'Atajos: Alt+Shift+L leer la página, S detener voz, C abrir el chat, T teclado en pantalla, A este panel. Escape cierra paneles.';
    panel.appendChild(nota);
    document.body.appendChild(panel); document.body.appendChild(fab);

    function setPanel(on) {
      panel.classList.toggle('on', on); fab.setAttribute('aria-expanded', on);
      if (on) { var p = $('button', panel); if (p) p.focus(); }
    }
    fab.addEventListener('click', function () { setPanel(!panel.classList.contains('on')); });

    /* ---------- ATAJOS ---------- */
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.shiftKey) {
        if (e.code === 'KeyL') { e.preventDefault(); leerPagina(); }
        else if (e.code === 'KeyS') { e.preventDefault(); detener(); }
        else if (e.code === 'KeyC') { e.preventDefault(); window.openChat(true); }
        else if (e.code === 'KeyT') { e.preventDefault(); setKb(!kbOn); }
        else if (e.code === 'KeyA') { e.preventDefault(); setPanel(!panel.classList.contains('on')); if (!panel.classList.contains('on')) fab.focus(); }
        return;
      }
      if (e.key === 'Escape') {
        detener();
        if (kbOn) { setKb(false); return; }
        if (panel.classList.contains('on')) { setPanel(false); fab.focus(); return; }
        if (chat && chat.classList.contains('on')) { window.openChat(false); var f = $('#fab'); if (f) f.focus(); }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
