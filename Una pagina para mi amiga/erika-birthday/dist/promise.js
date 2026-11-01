(() => {
  const svg = document.getElementById('promise-hands');
  const hand = document.getElementById('promise-moving-hand');
  const card = document.querySelector('.promise-card');
  const join = document.getElementById('promise-join');
  const retry = document.getElementById('promise-retry');
  const notice = document.getElementById('promise-notice');
  const key = 'erika-pinky-promise-v1';
  let x = 0, y = 0, drag = null, sealed = false, sending = false;
  const read = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
  const save = value => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  function render() { hand.setAttribute('transform', `translate(${x} ${y})`); }
  function point(event) {
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  async function notify() {
    if (sending) return;
    if (read().sent) { notice.textContent = 'El aviso de esta promesa ya fue enviado ♡'; return; }
    if (['localhost', '127.0.0.1'].includes(location.hostname)) {
      notice.textContent = 'Vista previa: el correo se enviará al hacer la promesa en la página publicada.';
      return;
    }
    sending = true; retry.hidden = true; notice.textContent = 'Enviando tu promesa con mucho cariño…';
    try {
      const response = await fetch('https://formsubmit.co/ajax/crunchyesmicuenta@gmail.com', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({
          _subject: 'Erika hizo la promesa del meñique ♡', _captcha: 'false', _template: 'table',
          mensaje: 'Erika unió los meñiques y selló la promesa: Conmigo por siempre, en las buenas y en las malas ♡',
          fecha: read().date || new Date().toISOString(), pagina: location.origin
        }), signal: AbortSignal.timeout(15000)
      });
      const data = await response.json();
      if (!response.ok || (data.success !== true && data.success !== 'true')) throw new Error('Delivery not accepted');
      save({...read(), sent: true}); notice.textContent = 'Aviso enviado con cariño ♡';
    } catch {
      notice.textContent = 'La promesa está sellada. El aviso no pudo enviarse todavía.'; retry.hidden = false;
    } finally { sending = false; }
  }
  function seal(restoring = false) {
    if (sealed) return;
    sealed = true; drag = null; x = -178; y = 0; render();
    card.classList.add('is-sealed'); hand.setAttribute('aria-disabled', 'true'); hand.setAttribute('tabindex', '-1');
    document.getElementById('promise-hand-palm').setAttribute('d', 'M22 222 L21 174 C2 153 4 119 17 103 L24 77 Q31 62 43 70 Q49 75 45 91 L42 105 L55 62 Q61 46 73 52 Q82 57 77 75 L68 107 L84 64 Q91 48 103 56 Q111 62 104 78 L94 111 L117 110 L140 38 Q145 15 163 20 Q181 25 177 44 L174 55 Q170 66 160 60 Q154 56 158 47 L161 39 Q162 35 157 36 L151 115 Q165 137 151 160 L131 183 L128 222 Z');
    join.hidden = true;
    document.getElementById('promise-instruction').textContent = 'Nuestros meñiques ya están unidos ♡';
    document.getElementById('promise-result').textContent = 'Promesa sellada. En las buenas y en las malas, contigo ♡';
    document.getElementById('promise-your-label').textContent = 'PARA SIEMPRE ♡';
    if (!restoring) save({...read(), sealed: true, date: new Date().toISOString()});
    if (!restoring || read().sent || ['localhost', '127.0.0.1'].includes(location.hostname)) notify();
    else { notice.textContent = 'Tu promesa sigue guardada. Puedes reintentar el aviso.'; retry.hidden = false; }
  }
  hand.addEventListener('pointerdown', event => {
    if (sealed) return;
    event.preventDefault(); const p = point(event); drag = {id: event.pointerId, x: p.x - x, y: p.y - y};
    hand.setPointerCapture(event.pointerId); card.classList.add('is-dragging');
  });
  hand.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || sealed) return;
    const p = point(event); x = Math.max(-210, Math.min(15, p.x - drag.x)); y = Math.max(-35, Math.min(45, p.y - drag.y)); render();
    if (Math.abs(x + 188) < 28 && Math.abs(y) < 28) { card.classList.remove('is-dragging'); seal(); }
  });
  function release() { drag = null; card.classList.remove('is-dragging'); }
  hand.addEventListener('pointerup', release); hand.addEventListener('pointercancel', release); hand.addEventListener('lostpointercapture', release);
  hand.addEventListener('keydown', event => {
    if (sealed) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); seal(); return; }
    const moves = {ArrowLeft: [-16,0], ArrowRight: [16,0], ArrowUp: [0,-12], ArrowDown: [0,12]};
    if (!moves[event.key]) return; event.preventDefault();
    x = Math.max(-210,Math.min(15,x + moves[event.key][0])); y = Math.max(-35,Math.min(45,y + moves[event.key][1])); render();
    if (Math.abs(x + 188) < 28 && Math.abs(y) < 28) seal();
  });
  join.addEventListener('click', () => seal()); retry.addEventListener('click', notify);
  if (read().sealed) seal(true);
})();
