(() => {
  const canvas = document.getElementById('killua-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const go = document.getElementById('killua-go');
  const pause = document.getElementById('killua-pause');
  const reset = document.getElementById('killua-reset');
  const label = document.getElementById('killua-label');
  const text = document.getElementById('killua-text');
  const count = document.getElementById('killua-count');
  const hint = document.getElementById('killua-hint');
  const messages = [
    'Erika, tu sonrisa tiene ese poder bonito de convertir un día cualquiera en un recuerdo especial.',
    'No tienes que ser perfecta para ser increíble. Ser tú ya es una de las cosas más bonitas de este mundo.',
    'Aunque haya kilómetros entre nosotros, siempre tendrás cerquita mi cariño y un lugar en mi vida.',
    'Ojalá hoy te mires con el mismo cariño con el que yo te veo: valiente, única y merecedora de cosas hermosas.',
    'Si pudiera elegir de nuevo con quién cruzarme en la vida, volvería a elegir nuestra amistad. Gracias por existir, amika ♡'
  ];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let station = 0, progress = 0, elapsed = 0, running = false, paused = false, last = 0, frame = 0;
  const W = 900, H = 520;
  const character = new Image();
  character.onload = () => draw();
  character.src = 'assets/killua-run-cycle.png';
  function polygon(points, fill, stroke) {
    ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function line(x,y,a,b,color,width=2) { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(a,b); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.stroke(); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#fcecf2'); sky.addColorStop(1,'#efb5cc'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    polygon([[0,0],[340,160],[340,260],[0,H]],'#e6a1bb');
    polygon([[W,0],[560,160],[560,260],[W,H]],'#d98fab');
    polygon([[0,H],[340,260],[560,260],[W,H]],'#f8dce5');
    ctx.fillStyle='#fff5f8'; ctx.fillRect(340,160,220,100);
    // Perspective frames approach the camera to create a third-person corridor.
    const travel=(elapsed / 1700)%1;
    for(let i=0;i<9;i++) {
      const depth=((i/9+travel)%1); const z=depth*depth;
      const left=340-490*z, right=560+490*z, top=160-240*z, bottom=260+370*z;
      line(left,top,left,bottom,'#b8587e55',3); line(right,top,right,bottom,'#b8587e55',3);
      line(left,top,right,top,'#fff1f6aa',4); line(left,bottom,right,bottom,'#bd6d8c44');
    }
    for (let i=1;i<6;i++) line(340+i*220/6,260,-180+i*1260/6,H,'#c7859d55');
    ctx.textAlign='center'; ctx.fillStyle='#b54f76'; ctx.font='22px Georgia'; ctx.fillText('♡',450,203);
    // The next message is a framed square at the side of the corridor.
    const zoom=.35+progress*.9, cardX=530+progress*125, cardY=205+progress*60;
    ctx.save(); ctx.translate(cardX,cardY); ctx.scale(zoom,zoom);
    ctx.shadowColor='#a8517355';ctx.shadowBlur=20;ctx.fillStyle='#fff7fa';ctx.fillRect(-57,-57,114,114);ctx.shadowBlur=0;
    ctx.strokeStyle='#bf6d8c';ctx.lineWidth=3;ctx.strokeRect(-50,-50,100,100);
    ctx.fillStyle='#ad416b';ctx.font='36px Georgia';ctx.fillText('♡',0,1);ctx.font='13px sans-serif';ctx.fillText(`${Math.min(station+1,5)} / 5`,0,32);ctx.restore();
    // Six drawn poses: extension, bent-knee recovery and passing, for each leg.
    const active=running && !paused && !reduced.matches;
    const pose=active ? Math.floor(elapsed/90)%6 : 0;
    const bounce=active ? Math.sin(elapsed/90*Math.PI/3)*2 : 0;
    ctx.save();
    ctx.fillStyle='#a55a7b33';ctx.beginPath();ctx.ellipse(450,486,43,8,0,0,Math.PI*2);ctx.fill();
    if(character.complete && character.naturalWidth) {
      const scale=275/512;
      const centers=[320,790,1260,310,790,1255];
      const sourceX=centers[pose]-180, sourceY=pose<3?0:512;
      const left=450-180*scale, top=207+bounce;
      // Keep the face looking over the same shoulder as the limbs alternate.
      ctx.drawImage(character,140,0,360,195,left,top,360*scale,195*scale);
      ctx.drawImage(character,sourceX,sourceY+195,360,317,
        left,top+195*scale,360*scale,317*scale);
    }
    ctx.restore();
  }
  function arrive() {
    running=false; station++; count.textContent=`${station} / 5 mensajes`;
    label.textContent=`${station===5?'ÚLTIMA PARADA':'PARADA '+station} · PARA TI, ERIKA`;
    text.textContent=messages[station-1]; go.hidden=false; pause.hidden=true;
    go.textContent=station===5?'Volver a jugar ↻':'Seguir corriendo ⚡';
    hint.textContent=station===5?'Cinco mensajes entregados. Una amistad que sigue ♡':'Quédate el tiempo que quieras. La próxima sorpresa puede esperar.';
    draw();
  }
  function tick(now) {
    frame=0;
    if(!running || paused) return;
    const delta=last ? Math.min(now-last,60) : 0; last=now;
    elapsed+=delta; progress=Math.min(1,progress+delta/4200); draw();
    if(progress>=1) arrive(); else frame=requestAnimationFrame(tick);
  }
  function schedule() { cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(tick); }
  function restart() {
    cancelAnimationFrame(frame);running=false;paused=false;station=0;progress=0;elapsed=0;
    count.textContent='0 / 5 mensajes';label.textContent='ENTREGA ESPECIAL PARA ERIKA';
    text.textContent='Un pasillo, cinco sorpresas y muchas ganas de verte feliz.';
    go.hidden=false;go.textContent='Comenzar aventura ⚡';pause.hidden=true;reset.hidden=true;
    hint.textContent='Killua corre solo y se detiene en cada mensaje. Tú decides cuándo continuar.';draw();
  }
  go.addEventListener('click',()=>{
    if(station===5) restart();
    running=true;paused=false;progress=0;go.hidden=true;pause.hidden=false;pause.textContent='Pausar';reset.hidden=false;
    label.textContent='EN CAMINO';text.textContent='Killua está llevando un poquito de cariño hasta ti…';
    if(reduced.matches) { progress=1;draw();arrive(); } else schedule();
  });
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Continuar':'Pausar';if(paused)cancelAnimationFrame(frame);else schedule();});
  reset.addEventListener('click',restart);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && running && !paused){paused=true;cancelAnimationFrame(frame);pause.textContent='Continuar';}});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting && running && !paused){paused=true;cancelAnimationFrame(frame);pause.textContent='Continuar';}}).observe(document.querySelector('.killua-panel'));
  draw();
})();
