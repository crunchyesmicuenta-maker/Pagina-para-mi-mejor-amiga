(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
let queued=false;function update(){const total=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+ (total>0?Math.min(1,scrollY/total):0)+')';queued=false}addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
if(!reduced.matches && 'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08});document.querySelectorAll('main > section:not(.birthday),.taste-card,.poem-section').forEach((el,i)=>{el.classList.add('reveal-ready');el.style.setProperty('--reveal-delay',el.matches('.taste-card')?(i%3)*65+'ms':'0ms');observer.observe(el)});}
const card=document.querySelector('.promise-card'),section=document.querySelector('.promise-section');if(!card||!section)return;
let played=false;
function celebrate(){if(played)return;played=true;if(reduced.matches)return;
const canvas=document.createElement('canvas');canvas.className='promise-fireworks';canvas.setAttribute('aria-hidden','true');section.prepend(canvas);
const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=box.width*dpr;canvas.height=box.height*dpr;const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}ctx.scale(dpr,dpr);
const rect=card.getBoundingClientRect(),w=box.width,h=box.height,originY=rect.top-box.top+rect.height*.65;const particles=[],rockets=[];const colors=['#b94e83','#db7298','#d4a34c','#af83cf','#e79bb4'];let last=0,start=0,next=0,count=0,frame;
function launch(){const side=count%2===0?-1:1;const x=w/2+side*rect.width*.28;rockets.push({x,y:originY,tx:w/2+side*(rect.width*.42+Math.random()*65),ty:65+Math.random()*130,color:colors[count%colors.length]});count++}
function burst(r){for(let i=0;i<46;i++){const a=Math.PI*2*i/46,s=45+Math.random()*105;particles.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.5+Math.random()*.8,age:0,color:r.color,size:1.3+Math.random()*1.6})}}
function tick(t){if(!start)start=t;const dt=Math.min((t-(last||t))/1000,.035);last=t;ctx.clearRect(0,0,w,h);if(t-start>=next&&count<8){launch();next+=480}
for(let i=rockets.length-1;i>=0;i--){const r=rockets[i],dx=r.tx-r.x,dy=r.ty-r.y,dist=Math.hypot(dx,dy),step=420*dt;if(dist<Math.max(step,7)){burst(r);rockets.splice(i,1);continue}const ox=r.x,oy=r.y;r.x+=dx/dist*step;r.y+=dy/dist*step;ctx.globalAlpha=.8;ctx.strokeStyle=r.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox,oy+12);ctx.lineTo(r.x,r.y);ctx.stroke()}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>=p.life){particles.splice(i,1);continue}p.vy+=38*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.985,dt*60);ctx.globalAlpha=Math.pow(1-p.age/p.life,1.4);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;if(count<8||rockets.length||particles.length)frame=requestAnimationFrame(tick);else canvas.remove()}
frame=requestAnimationFrame(tick);const stop=()=>{cancelAnimationFrame(frame);canvas.remove()};addEventListener('pagehide',stop,{once:true});reduced.addEventListener('change',stop,{once:true});
}
const observer=new MutationObserver(()=>{if(card.classList.contains('is-sealed')){celebrate();observer.disconnect()}});observer.observe(card,{attributes:true,attributeFilter:['class']});if(card.classList.contains('is-sealed')){celebrate();observer.disconnect()}
})();