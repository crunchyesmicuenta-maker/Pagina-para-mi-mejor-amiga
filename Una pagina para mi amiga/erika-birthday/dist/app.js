const canvas=document.querySelector('#scratch');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
const card=document.querySelector('#scratch-card');
const revealButton=document.querySelector('#reveal');
const resetButton=document.querySelector('#reset');
const statusText=document.querySelector('#status');
let down=false,revealed=false,last=null,strokeCount=0;
function drawCover(){
 if(revealed)return;
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.globalCompositeOperation='source-over';
 const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#bc6386');gradient.addColorStop(.5,'#a84b70');gradient.addColorStop(1,'#c87e99');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#f6d9e52b';ctx.lineWidth=1;ctx.strokeRect(12,12,w-24,h-24);
 ctx.fillStyle='#f9e4ec37';ctx.font='19px Georgia';
 for(let y=32;y<h;y+=44)for(let x=22;x<w;x+=48)ctx.fillText((Math.round(x+y)%3)?'✧':'♡',x,y);
 ctx.textAlign='center';ctx.fillStyle='#fff0f5';ctx.font='34px Georgia';ctx.fillText('♡',w/2,h/2-25);
 ctx.font='italic 27px Georgia';ctx.fillText('Aquí hay algo para ti',w/2,h/2+14);
 ctx.font='9px sans-serif';ctx.fillText('R A S P A   Y   S O N R Í E',w/2,h/2+43);strokeCount=0;
}
function celebrate(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const container=document.querySelector('#confetti');
 for(let i=0;i<48;i++){const piece=document.createElement('span');piece.className='confetti-piece';piece.textContent=i%3===0?'♡':'✦';piece.style.cssText=`left:${Math.random()*100}%;color:${['#af416d','#d48ba5','#ecb9cc','#b99364'][i%4]};font-size:${9+Math.random()*15}px;animation-delay:${Math.random()*.6}s;--drift:${Math.random()*240-120}px`;container.append(piece);setTimeout(()=>piece.remove(),4200);}
}
function reveal(){if(revealed)return;revealed=true;down=false;card.classList.add('revealed');canvas.setAttribute('aria-hidden','true');statusText.textContent='Erika, esta sorpresa es para ti ♡';revealButton.hidden=true;resetButton.hidden=false;celebrate();}
function point(e){const rect=canvas.getBoundingClientRect();const angle=-2*Math.PI/180;const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);return{x:dx*Math.cos(angle)+dy*Math.sin(angle)+canvas.clientWidth/2,y:-dx*Math.sin(angle)+dy*Math.cos(angle)+canvas.clientHeight/2};}
function scratch(e){if(!down||revealed)return;const p=point(e);ctx.globalCompositeOperation='destination-out';ctx.lineWidth=46;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last?.x??p.x,last?.y??p.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,23,0,Math.PI*2);ctx.fill();last=p;if(++strokeCount%12===0)checkProgress();}
function checkProgress(){if(revealed)return;const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let erased=0,total=0;for(let i=3;i<pixels.length;i+=64){total++;if(pixels[i]<128)erased++;}if(erased/total>.43)reveal();}
canvas.addEventListener('pointerdown',e=>{if(revealed)return;down=true;last=null;canvas.setPointerCapture(e.pointerId);scratch(e);});
canvas.addEventListener('pointermove',scratch);
canvas.addEventListener('pointerup',()=>{down=false;last=null;checkProgress();});
canvas.addEventListener('pointercancel',()=>{down=false;last=null;});
revealButton.addEventListener('click',reveal);
resetButton.addEventListener('click',()=>{revealed=false;card.classList.remove('revealed');canvas.removeAttribute('aria-hidden');revealButton.hidden=false;resetButton.hidden=true;statusText.textContent='✧ Raspa el cuadro y descubre para quién es';drawCover();});
new ResizeObserver(drawCover).observe(canvas);
drawCover();
