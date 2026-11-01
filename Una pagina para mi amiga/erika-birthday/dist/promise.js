(() => {
  const svg = document.getElementById('promise-hands');
  const hand = document.getElementById('promise-moving-hand');
  const card = document.querySelector('.promise-card');

  const retry = document.getElementById('promise-retry');
  const notice = document.getElementById('promise-notice');
  let x = 0, y = 0, drag = null, sealed = false, sending = false, delivered = false;
  let promiseDate = '';
  function render() { hand.setAttribute('transform', `translate(${x} ${y})`); }
  function point(event) {
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  async function notify() {
    if (sending) return;
    if (delivered) { notice.textContent = 'El aviso de esta promesa ya fue enviado ♡'; return; }
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
          fecha: promiseDate, pagina: location.origin
        }), signal: AbortSignal.timeout(15000)
      });
      const data = await response.json();
      if (!response.ok || (data.success !== true && data.success !== 'true')) throw new Error('Delivery not accepted');
      delivered = true; notice.textContent = 'Promesa hecha con mucho cariño ♡';
    } catch {
      notice.textContent = 'La promesa está sellada. El aviso no pudo enviarse todavía.'; retry.hidden = false;
    } finally { sending = false; }
  }
  function seal() {
    if (sealed) return;
    sealed = true; drag = null; x = -124; y = 0; render();
    card.classList.add('is-sealed'); hand.setAttribute('aria-disabled', 'true'); hand.setAttribute('tabindex', '-1');

    document.getElementById('promise-instruction').textContent = 'Nuestros meñiques ya están unidos ♡';
    document.getElementById('promise-result').textContent = 'Promesa sellada. En las buenas y en las malas, contigo ♡';
    document.getElementById('promise-your-label').textContent = 'PARA SIEMPRE ♡';
    promiseDate = new Date().toISOString();
    notify();
  }
  hand.addEventListener('pointerdown', event => {
    if (sealed) return;
    event.preventDefault(); const p = point(event); drag = {id: event.pointerId, x: p.x - x, y: p.y - y};
    hand.setPointerCapture(event.pointerId); card.classList.add('is-dragging');
  });
  hand.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || sealed) return;
    const p = point(event); x = Math.max(-145, Math.min(15, p.x - drag.x)); y = Math.max(-35, Math.min(45, p.y - drag.y)); render();
    if (Math.abs(x + 116) < 18 && Math.abs(y) < 18) { card.classList.remove('is-dragging'); seal(); }
  });
  function release() { drag = null; card.classList.remove('is-dragging'); }
  hand.addEventListener('pointerup', release); hand.addEventListener('pointercancel', release); hand.addEventListener('lostpointercapture', release);
  hand.addEventListener('keydown', event => {
    if (sealed) return;

    const moves = {ArrowLeft: [-16,0], ArrowRight: [16,0], ArrowUp: [0,-12], ArrowDown: [0,12]};
    if (!moves[event.key]) return; event.preventDefault();
    x = Math.max(-145,Math.min(15,x + moves[event.key][0])); y = Math.max(-35,Math.min(45,y + moves[event.key][1])); render();
    if (Math.abs(x + 116) < 18 && Math.abs(y) < 18) seal();
  });
  retry.addEventListener('click', notify);

})();
