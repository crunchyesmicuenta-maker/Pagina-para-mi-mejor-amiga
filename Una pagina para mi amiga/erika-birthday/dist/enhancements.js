(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
let queued=false;function update(){const total=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+ (total>0?Math.min(1,scrollY/total):0)+')';queued=false}addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
if(!reduced.matches && 'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08});document.querySelectorAll('main > section:not(.birthday),.taste-card,.poem-section').forEach((el,i)=>{el.classList.add('reveal-ready');el.style.setProperty('--reveal-delay',el.matches('.taste-card')?(i%3)*65+'ms':'0ms');observer.observe(el)});}
const title=document.getElementById('title');
if(title&&!reduced.matches){
  const lines=[...title.children].filter(el=>el.matches('span,em'));
  const original=lines.map(el=>el.textContent);
  title.setAttribute('aria-label',original.join(' '));
  title.classList.add('title-letter-lit');
  const letters=[];
  lines.forEach(line=>{
    line.setAttribute('aria-hidden','true');
    const text=line.textContent;line.textContent='';
    for(const character of Array.from(text)){
      const letter=document.createElement('span');letter.className='fuse-letter';letter.textContent=character===' '?'\u00a0':character;line.append(letter);letters.push(letter);
    }
  });
  const ember=document.createElement('i');ember.className='letter-ember';ember.setAttribute('aria-hidden','true');title.append(ember);
  let stopped=false;
  const finish=()=>{stopped=true;lines.forEach((line,index)=>{line.textContent=original[index];line.removeAttribute('aria-hidden')});ember.remove();title.classList.add('title-complete')};
  reduced.addEventListener('change',finish,{once:true});
  async function ignite(){
    if(document.fonts)await document.fonts.ready;
    if(stopped)return;
    for(const letter of letters){
      if(stopped)return;
      const bounds=letter.getBoundingClientRect(),base=title.getBoundingClientRect();
      ember.style.left=(bounds.left-base.left+bounds.width*.5)+'px';
      ember.style.top=(bounds.top-base.top+bounds.height*.68)+'px';
      ember.classList.add('ember-on');
      letter.classList.add('letter-on');
      await new Promise(resolve=>setTimeout(resolve,145));
    }
    finish();
  }
  ignite();
}
if(!reduced.matches&&'IntersectionObserver' in window){const images=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('image-visible');images.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.taste-card img,.our-game-section img,.poem-section img').forEach(img=>{img.classList.add('image-arrival');images.observe(img)})}
const card=document.querySelector('.promise-card'),section=document.querySelector('.promise-section');if(!card||!section)return;
let played=false;
function celebrate(){if(played)return;played=true;if(reduced.matches)return;
const canvas=document.createElement('canvas');canvas.className='promise-fireworks';canvas.setAttribute('aria-hidden','true');section.prepend(canvas);
const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=box.width*dpr;canvas.height=box.height*dpr;const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}ctx.scale(dpr,dpr);
const rect=card.getBoundingClientRect(),w=box.width,h=box.height,originY=rect.top-box.top+rect.height*.65;const particles=[],rockets=[];const colors=['#b94e83','#db7298','#d4a34c','#af83cf','#e79bb4'];let last=0,start=0,next=0,count=0,frame;
function launch(){const side=count%2===0?-1:1;const x=w/2+side*rect.width*.28;rockets.push({x,y:originY,tx:Math.max(45,Math.min(w-45,w/2+side*(rect.width*.42+Math.random()*65))),ty:65+Math.random()*130,color:colors[count%colors.length]});count++}
function burst(r){for(let i=0;i<(w<500?48:80);i++){const a=Math.PI*2*i/(w<500?48:80),s=(i%3===0?55:110)+Math.random()*95;particles.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.8+Math.random()*1.1,age:0,color:r.color,size:1.2+Math.random()*1.8,trail:[]})}}
function tick(t){if(!start)start=t;const dt=Math.min((t-(last||t))/1000,.035);last=t;ctx.clearRect(0,0,w,h);if(t-start>=next&&count<12){launch();next+=360}
for(let i=rockets.length-1;i>=0;i--){const r=rockets[i],dx=r.tx-r.x,dy=r.ty-r.y,dist=Math.hypot(dx,dy),step=420*dt;if(dist<Math.max(step,7)){burst(r);rockets.splice(i,1);continue}const ox=r.x,oy=r.y;r.x+=dx/dist*step;r.y+=dy/dist*step;ctx.globalAlpha=.8;ctx.strokeStyle=r.color;ctx.shadowColor=r.color;ctx.shadowBlur=10;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ox,oy+32);ctx.lineTo(r.x,r.y);ctx.stroke()}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>=p.life){particles.splice(i,1);continue}p.trail.push({x:p.x,y:p.y});if(p.trail.length>7)p.trail.shift();p.vy+=32*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.985,dt*60);ctx.globalAlpha=Math.pow(1-p.age/p.life,1.4);ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=5;ctx.lineWidth=p.size*.65;ctx.beginPath();p.trail.forEach((v,j)=>j?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;if(count<12||rockets.length||particles.length)frame=requestAnimationFrame(tick);else canvas.remove()}
frame=requestAnimationFrame(tick);const stop=()=>{cancelAnimationFrame(frame);canvas.remove()};addEventListener('pagehide',stop,{once:true});reduced.addEventListener('change',stop,{once:true});
}
const observer=new MutationObserver(()=>{if(card.classList.contains('is-sealed')){celebrate();observer.disconnect()}});observer.observe(card,{attributes:true,attributeFilter:['class']});if(card.classList.contains('is-sealed')){celebrate();observer.disconnect()}
})();