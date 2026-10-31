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
  character.src = 'assets/killua-three-poses.png';
  function polygon(points, fill, stroke) {
    ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function line(x,y,a,b,color,width=2) { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(a,b); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.stroke(); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    const wall=ctx.createLinearGradient(0,0,0,H);wall.addColorStop(0,'#fcecf2');wall.addColorStop(1,'#e9a9c2');ctx.fillStyle=wall;ctx.fillRect(0,0,W,H);
    const scroll=elapsed*.13;
    // Side-scrolling corridor: wall panels, lamps and floor move past the runner.
    for(let i=-1;i<7;i++) {
      const x=i*210-scroll%210;
      ctx.fillStyle='#fff4f744';ctx.fillRect(x+12,30,182,345);
      line(x,0,x,405,'#b8587e44',3);
      ctx.fillStyle='#fff5d9';ctx.fillRect(x+85,65,35,12);
      ctx.fillStyle='#b54f76';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText('♡',x+103,190);
    }
    ctx.fillStyle='#f8dce5';ctx.fillRect(0,405,W,115);
    line(0,405,W,405,'#be7593',4);line(0,460,W,460,'#c7859d55');
    for(let i=-1;i<11;i++){const x=i*110-scroll%110;line(x,405,x-50,H,'#c7859d55');}
    const runnerX=200+progress*340;
    const cardX=790-progress*150;
    ctx.fillStyle='#fff7fa';ctx.fillRect(cardX-48,233,96,96);
    ctx.strokeStyle='#bf6d8c';ctx.lineWidth=2;ctx.strokeRect(cardX-42,239,84,84);
    ctx.fillStyle='#ad416b';ctx.textAlign='center';ctx.font='32px Georgia';ctx.fillText('♡',cardX,280);
    ctx.font='13px sans-serif';ctx.fillText(`${Math.min(station+1,5)} / 5`,cardX,309);
    const active=running && !paused && !reduced.matches;
    const pose=active ? [0,1,2,1][Math.floor(elapsed/100)%4] : 0;
    ctx.fillStyle='#a55a7b33';ctx.beginPath();ctx.ellipse(runnerX,436,57,9,0,0,Math.PI*2);ctx.fill();
    if(character.complete && character.naturalWidth) {
      const cellH=character.naturalHeight, cellW=cellH*.83;
      const centers=[.215,.498,.803];
      ctx.drawImage(character,centers[pose]*character.naturalWidth-cellW/2,0,cellW,cellH,
        runnerX-120,145,240,290);
    }
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
