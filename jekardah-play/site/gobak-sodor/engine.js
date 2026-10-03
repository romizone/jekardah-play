(() => {
  'use strict';
  const $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d');
  const W = 540, H = 660, field = {left:76,right:464,top:204,bottom:574};
  let state = 'title', score = 0, lives = 3, wave = 1, crossings = 0, best = 0;
  let elapsed = 0, tripTime = 0, outbound = true, invincible = 0, hitStop = 0, shake = 0, bannerTime = 0, muted = false, audio;
  let player = {x:270,y:602}, guards = [], particles = [], floats = [], keys = new Set(), joy = {x:0,y:0}, pointer = null;
  let previous = null, accumulator = 0;
  try { best = Math.max(0, Number(localStorage.getItem('jek_hi_gobak-sodor')) || 0); } catch (_) {}
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenery = {};
  function loadScene(name, file, overlayScene) {
    const img = new Image();
    img.decoding = 'async'; img.loading = 'lazy'; img.alt = ''; img.className = 'cinematic';
    scenery[name] = {img, ready:false};
    img.onload = async () => {
      try { if (img.decode) await img.decode(); } catch (_) { return; }
      if (!img.naturalWidth) return;
      scenery[name].ready = true;
      if (overlayScene && state === overlayScene) updateBackdrop();
    };
    img.onerror = () => { scenery[name].ready = false; updateBackdrop(); };
    img.src = file;
  }
  function updateBackdrop() {
    const overlay = $('overlay');
    overlay.querySelectorAll('.cinematic').forEach(img => img.remove());
    overlay.dataset.scene = state;
    const scene = state === 'title' ? scenery.title : state === 'over' ? scenery.over : null;
    if (scene && scene.ready) overlay.prepend(scene.img);
  }
  loadScene('title', 'aset/hero-judul.jpg', 'title');
  // Defer background decode/load until the browser has finished initial work.
  const loadSecondary = () => {
    loadScene('field', 'aset/latar-lapangan.jpg');
    loadScene('over', 'aset/latar-malam.jpg', 'over');
  };
  if (window.requestIdleCallback) window.requestIdleCallback(loadSecondary, {timeout:1500});
  else window.setTimeout(loadSecondary, 0);
  function fit() {
    const rect = $('view').getBoundingClientRect(), scale = Math.max(.1, Math.min(rect.width / W, rect.height / H));
    $('screen').style.width = `${W*scale}px`; $('screen').style.height = `${H*scale}px`; $('screen').style.setProperty('--u', `${scale}px`);
  }
  window.addEventListener('resize',fit); if (window.ResizeObserver) new ResizeObserver(fit).observe($('view')); fit();
  function tone(freq, duration=.12) {
    if (muted) return;
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const o=audio.createOscillator(), g=audio.createGain(); o.connect(g);g.connect(audio.destination);o.frequency.value=freq;o.type='triangle';g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.start();o.stop(audio.currentTime+duration); } catch (_) {}
  }
  function clearInput() {keys.clear();joy.x=joy.y=0;pointer=null;$('stick').style.transform='translate(0px,0px)';}
  function hud() {$('score').textContent=score;$('wave').textContent=wave;$('lives').textContent='♥ '.repeat(lives).trim() || '—';$('objective').textContent=outbound?'Ke garis atas, lalu pulang!':'Kembali ke garis bawah!';}
  function banner(text,time=2){$('banner').textContent=text;bannerTime=time;$('banner').hidden=false;}
  function show(next) {
    state=next;clearInput();$('overlay').hidden=next==='play';$('pause').textContent=next==='pause'?'Lanjut':'Jeda';$('pause').disabled=next==='title'||next==='over';
    updateBackdrop();
    if(next==='play')return;
    let content='';
    if(next==='title') content='<div class="eyebrow">Dolanan sore di Sleman</div><h1>Gobak Sodor</h1><p class="subtitle">Kampung Wijilan · Yogyakarta</p><p>Lewati penjaga di garis merah. Capai garis atas, lalu kembali ke garis bawah untuk mencetak skor!</p><p>Penjaga hanya bergerak sepanjang garis. Kamu punya <b>3 nyawa</b>. Setiap perjalanan pulang menaikkan gelombang.</p><p class="keys">Gerak: <b>↑ ↓ ← → / WASD</b> atau joystick<br><b>P</b> jeda · <b>M</b> suara · <b>Enter</b> mulai</p><p class="record">Rekor: '+best+'</p><button class="primary" id="action">Mulai Main</button>';
    if(next==='pause')content='<div class="eyebrow">Tarik napas dulu</div><h2>Permainan Dijeda</h2><p>Senja masih menunggu. Lanjutkan perjalananmu!</p><button class="primary" id="action">Lanjut Main</button>';
    if(next==='over'){const rank=crossings<5?'Atta Ndog':crossings<10?'Tukang Sodor':crossings<15?'Jago Sodor':'Legenda Wijilan';content='<div class="eyebrow">Sore yang seru!</div><h2>Permainan Selesai</h2><p class="subtitle">'+rank+'</p><p>Skor: <b>'+score+'</b> · Rekor: <b>'+best+'</b><br>Gelombang tercapai: <b>'+wave+'</b><br>Crossing sukses (pulang-pergi): <b>'+crossings+'</b></p><button class="primary" id="action">Main Lagi</button>';}
    $('card').innerHTML=content;$('action').addEventListener('click',()=>next==='pause'?show('play'):start());
  }
  function setupGuards() {
    guards=[];const rows=Math.min(5,2+Math.floor((wave-1)/2));
    for(let i=0;i<rows;i++) {const y=field.top+42+i*(field.bottom-field.top-84)/(rows-1); const count=wave>=6&&i%2===0?2:1;
      for(let j=0;j<count;j++) guards.push({x:125+(i*113+j*180)%300,y,dir:i%2?-1:1,speed:66+Math.min(150,(wave-1)*11)+i*5,phase:i+j*2});
    }
  }
  function start(){score=0;lives=3;wave=1;crossings=0;tripTime=0;outbound=true;player={x:270,y:602};invincible=1.6;hitStop=shake=0;particles=[];floats=[];setupGuards();show('play');banner('Gelombang 1 · Ayo menyeberang!');hud();tone(440);}
  function dust(x,y,n,color){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*100,vy:-Math.random()*75,life:.3+Math.random()*.4,max:.7,color});}
  function caught(){lives--;hitStop=.10;shake=5;dust(player.x,player.y,22,'#ffc88c');tone(130,.2);outbound=true;tripTime=0;player.x=270;player.y=602;invincible=2;hud();banner('Tertangkap! Kembali ke garis bawah',1.5);if(lives<=0){if(score>best){best=score;try{localStorage.setItem('jek_hi_gobak-sodor',String(best));}catch(_){}}show('over');$('banner').hidden=true;bannerTime=0;}}
  function crossing(){const bonus=Math.max(0,Math.floor(25-tripTime));const points=100+bonus;score+=points;crossings++;wave++;tripTime=0;outbound=true;invincible=1.5;floats.push({x:player.x,y:player.y-28,text:'+'+points+' · bonus '+bonus,life:1.8});dust(player.x,player.y,15,'#ffe99f');setupGuards();banner('Gelombang '+wave+' · Penjaga makin sigap!');tone(660,.18);if(score>best){best=score;try{localStorage.setItem('jek_hi_gobak-sodor',String(best));}catch(_){}}hud();}
  function step(dt){
    elapsed+=dt;
    particles=particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=80*dt;return p.life>0;});
    floats=floats.filter(f=>{f.life-=dt;f.y-=22*dt;return f.life>0;});
    if(state!=='play')return;
    if(bannerTime>0){bannerTime-=dt;if(bannerTime<=0)$('banner').hidden=true;}
    shake=Math.max(0,shake-dt*14);if(hitStop>0){hitStop-=dt;return;}
    invincible=Math.max(0,invincible-dt);tripTime+=dt;
    let dx=joy.x+(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=joy.y+(keys.has('down')?1:0)-(keys.has('up')?1:0);
    const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
    player.x=clamp(player.x+dx*155*dt,field.left+12,field.right-12);player.y=clamp(player.y+dy*155*dt,field.top-30,field.bottom+30);
    if(length>.1&&Math.random()<.28)dust(player.x,player.y+10,1,'#dcc29b');
    for(const g of guards){const target=clamp(player.x,field.left+12,field.right-12);const chase=Math.sign(target-g.x);g.x+=((.65*g.dir)+(.35*chase))*g.speed*dt;if(g.x<field.left+12){g.x=field.left+12;g.dir=1;}if(g.x>field.right-12){g.x=field.right-12;g.dir=-1;}
      if(invincible<=0&&Math.hypot(player.x-g.x,player.y-g.y)<22){caught();break;}}
    if(state!=='play')return;
    if(outbound&&player.y<=field.top-18){outbound=false;banner('Garis atas tercapai · Sekarang pulang!',1.7);tone(520);hud();}
    else if(!outbound&&player.y>=field.bottom+18)crossing();
  }
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function line(x,y,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
  function person(x,y,color,isPlayer,phase=0){const bob=Math.sin(elapsed*9+phase)*1.5;ellipse(x,y+12,12,4,'#362a3b55');line(x-4,y+5,x-5,y+12,'#302839',4);line(x+4,y+5,x+5,y+12,'#302839',4);ellipse(x,y-1+bob,9,11,color);line(x-9,y-3+bob,x-14,y+2+bob,'#dca779',4);line(x+9,y-3+bob,x+14,y+2+bob,'#dca779',4);ellipse(x,y-16+bob,7,8,'#ebba8c');ellipse(x,y-21+bob,8,4,isPlayer?'#20374a':'#66364b');if(isPlayer){ctx.fillStyle='#fff3c3';ctx.fillRect(x-4,y-5+bob,8,3);}}
  function draw(){
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#53496e');sky.addColorStop(.29,'#d9887a');sky.addColorStop(.5,'#e7af7e');sky.addColorStop(1,'#485942');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    const backdrop = scenery.field;
    if (backdrop && backdrop.ready) {
      const img = backdrop.img, scale = Math.max((W+24)/img.naturalWidth, (H+24)/img.naturalHeight);
      const width = img.naturalWidth*scale, height = img.naturalHeight*scale;
      const drift = reducedMotion ? 0 : Math.sin(elapsed*.18)*4;
      ctx.save(); ctx.filter = 'blur(1.5px) brightness(0.65)';
      ctx.drawImage(img, (W-width)/2+drift, (H-height)/2, width, height);
      ctx.restore();
    }
    // Keep the original procedural scenery as a subtle foreground, opaque on failure.
    ctx.save(); ctx.globalAlpha = backdrop && backdrop.ready ? .22 : 1;
    ellipse(431,110,31,31,'#ffd29a');
    for(let i=0;i<5;i++){const x=((i*149+elapsed*(3+i*.3))%(W+150))-70;ellipse(x,64+i%3*23,57,7,'#efc1b477');ellipse(x+24,60+i%3*23,33,8,'#efc1b477');}
    ctx.fillStyle='#555b57';ctx.beginPath();ctx.moveTo(0,180);ctx.lineTo(99,120);ctx.lineTo(182,176);ctx.lineTo(305,128);ctx.lineTo(435,180);ctx.lineTo(540,139);ctx.lineTo(540,230);ctx.lineTo(0,230);ctx.fill();
    ctx.fillStyle='#65764b';ctx.fillRect(0,181,W,479);
    for(let r=0;r<15;r++){const y=190+r*34;line(0,y,W,y+8,'#c1ae6a66',4);for(let c=0;c<19;c++){const x=c*31+(r%2)*13;const bend=Math.sin(elapsed*1.5+c+r)*3;line(x,y+10,x+bend-4,y-2,'#aab666',1.5);line(x,y+10,x+bend+5,y,'#bac677',1.5);}}
    // Bale-bale, atap bambu, dan lampion: seluruhnya geometri asli.
    ctx.fillStyle='#674638';ctx.fillRect(15,142,105,8);line(25,143,25,182,'#4e3935',5);line(109,143,109,182,'#4e3935',5);ctx.fillStyle='#3c3543';ctx.beginPath();ctx.moveTo(5,137);ctx.lineTo(68,99);ctx.lineTo(131,137);ctx.closePath();ctx.fill();line(6,138,131,138,'#cfaa74',4);line(30,167,106,167,'#bc8b5b',7);
    line(0,99,540,136,'#3d3149',2);for(let i=0;i<7;i++){const x=22+i*83,y=100+x*.068;line(x,y,x,y+12,'#473449',1);ellipse(x,y+21,8,11,'#ffd687');ellipse(x,y+21,15,16,'#ffd68716');line(x-6,y+13,x+6,y+13,'#ae624f',2);line(x-6,y+29,x+6,y+29,'#ae624f',2);}
    for(let i=0;i<18;i++){const x=24+(i*97)%500+Math.sin(elapsed*.4+i)*8,y=180+(i*71)%460+Math.cos(elapsed*.6+i)*9;ellipse(x,y,1.8,1.8,`rgba(255,237,146,${.15+.55*(.5+.5*Math.sin(elapsed*2+i))})`);}
    ctx.restore();
    ctx.save();ctx.translate(Math.sin(elapsed*80)*shake,Math.cos(elapsed*73)*shake*.6);
    ctx.fillStyle='#bf996b';ctx.fillRect(field.left-8,field.top-34,field.right-field.left+16,field.bottom-field.top+68);
    ctx.fillStyle='#caa678';ctx.fillRect(field.left,field.top,field.right-field.left,field.bottom-field.top);
    for(let i=0;i<65;i++){ctx.fillStyle='#866c4c33';ctx.fillRect(84+(i*53)%367,213+(i*47)%350,2,2);}
    const rows=Math.min(5,2+Math.floor((wave-1)/2));
    for(let i=0;i<rows;i++){let y=field.top+42+i*(field.bottom-field.top-84)/(rows-1);line(field.left,y,field.right,y,'#a9544d',5);line(field.left,y-3,field.right,y-3,'#ffe0b3',1);}
    line(270,field.top,270,field.bottom,'#f8e9be77',2);
    ctx.strokeStyle='#fff0c6';ctx.lineWidth=3;ctx.strokeRect(field.left,field.top,field.right-field.left,field.bottom-field.top);
    ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillStyle='#422f36';ctx.fillText(outbound?'TUJUAN · GARIS ATAS':'SUDAH SAMPAI · PULANG ↓',270,193);ctx.fillText('MULAI / PULANG',270,624);
    for(const g of guards)person(g.x,g.y,'#ad4354',false,g.phase);
    if(invincible<=0||Math.floor(elapsed*10)%2===0||state!=='play')person(player.x,player.y,'#2d7182',true);
    if(invincible>0&&state==='play'){ctx.strokeStyle='#fff0a7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y-5,20,0,Math.PI*2);ctx.stroke();}
    for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ellipse(p.x,p.y,2.5,2.5,p.color);}ctx.globalAlpha=1;
    for(const f of floats){ctx.globalAlpha=Math.min(1,f.life);ctx.font='bold 19px system-ui';ctx.lineWidth=4;ctx.strokeStyle='#302334';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle='#fff0aa';ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.restore();
  }
  const directions={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(directions[key]){e.preventDefault();if(state==='play')keys.add(directions[key]);}if(e.repeat)return;if(key==='Enter'&&(state==='title'||state==='over'))start();if(key==='p')togglePause();if(key==='m')toggleSound();});
  window.addEventListener('keyup',e=>keys.delete(directions[e.key.length===1?e.key.toLowerCase():e.key]));
  function togglePause(){if(state==='play'){show('pause');bannerTime=0;$('banner').hidden=true;}else if(state==='pause')show('play');}
  function toggleSound(){muted=!muted;$('sound').textContent='Suara: '+(muted?'Mati':'Nyala');$('sound').setAttribute('aria-pressed',String(muted));if(!muted)tone(440);}
  $('pause').addEventListener('click',togglePause);$('sound').addEventListener('click',toggleSound);
  window.addEventListener('blur',()=>{clearInput();if(state==='play')togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')togglePause();});
  const pad=$('pad');
  function movePointer(e){if(e.pointerId!==pointer)return;const r=pad.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,limit=r.width*.3,length=Math.hypot(x,y),scale=length>limit?limit/length:1;joy.x=length<5?0:x*scale/limit;joy.y=length<5?0:y*scale/limit;$('stick').style.transform=`translate(${joy.x*25}px,${joy.y*25}px)`;e.preventDefault();}
  pad.addEventListener('pointerdown',e=>{if(pointer!==null||state!=='play')return;pointer=e.pointerId;pad.setPointerCapture(pointer);movePointer(e);});pad.addEventListener('pointermove',movePointer);
  function endPointer(e){if(e.pointerId!==pointer)return;joy.x=joy.y=0;pointer=null;$('stick').style.transform='translate(0px,0px)';}
  for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,endPointer);
  window.__gs={get state(){return state;},get score(){return score;},get lives(){return lives;},get wave(){return wave;},press(dir){if(['up','down','left','right'].includes(dir)){keys.clear();keys.add(dir);}else clearInput();},start};
  function frame(now){if(previous===null)previous=now;accumulator+=Math.min(100,Math.max(0,now-previous))/1000;previous=now;while(accumulator>=1/60){step(1/60);accumulator-=1/60;}draw();requestAnimationFrame(frame);}
  hud();show('title');requestAnimationFrame(frame);
})();
