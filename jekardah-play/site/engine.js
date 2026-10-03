/* JEK — kerangka game mini Jekardah Play (murni, tanpa dependency)
   Kontrak:
     JEK.boot(slug, function(g){ g.run(Game); })
     function Game(ctx, S){ return { update(dt), draw(ctx) } }
     S: beep(f,dur,type), onKey(k,fn), hi(), saveHi(v), over(title,sub,extra)
*/
window.JEK = (function(){
  function hiKey(slug){ return "jek_hi_" + slug; }

  function loop(update, draw){
    let last = 0;
    function frame(now){
      const dtms = Math.min(50, now - last); last = now;
      const dt = Math.max(1, Math.round(dtms / (1000/60))); // tick @60fps
      try{ update(dt); draw(); }catch(e){}
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function beep(freq, dur, type, vol){
    try{
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
      if(!beep.ctx) beep.ctx = new AC();
      if(beep.ctx.state === "suspended") beep.ctx.resume();
      const o = beep.ctx.createOscillator(), gn = beep.ctx.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      gn.gain.value = (vol == null ? 0.06 : vol);
      gn.gain.exponentialRampToValueAtTime(0.0001, beep.ctx.currentTime + dur);
      o.connect(gn); gn.connect(beep.ctx.destination);
      o.start(); o.stop(beep.ctx.currentTime + dur + 0.02);
    }catch(e){}
  }

  function boot(slug, cb){
    document.addEventListener("DOMContentLoaded", function(){
      const cv  = document.getElementById("cv");
      const ui  = document.getElementById("ui");
      const btn = document.getElementById("btnStart");
      const h1  = ui ? ui.querySelector("h1") : null;
      const msg = document.getElementById("msg");

      btn.addEventListener("click", function(){
        if(ui) ui.classList.add("hidden");
        const ctx = cv.getContext("2d");
        const keys = {};
        const S = {
          cv, W: cv.width, H: cv.height, beep: beep,
          count: function(k){ (this._c = this._c || {}); this._c[k] = (this._c[k]||0)+1; return this._c[k]; },
          onKey: function(key, fn){ keys[String(key).toLowerCase()] = fn; },
          hi: function(){ return +(localStorage.getItem(hiKey(slug)) || 0); },
          saveHi: function(v){ if(v > this.hi()) localStorage.setItem(hiKey(slug), v); },
          over: function(title, sub, extra){
            if(!ui) return;
            ui.classList.remove("hidden");
            if(h1) h1.textContent = (title && !/^Skor|^Rp/.test(title)) ? title : "GAME OVER";
            const scoreLine = (title && /^Skor|^Rp/.test(title)) ? title + "<br>" : "";
            if(msg) msg.innerHTML = scoreLine + (sub || "") + (extra ? "<br>" + extra : "") +
              "<br><br>Rekor: " + ( +(localStorage.getItem(hiKey(slug)) || 0) );
            btn.textContent = "↻ MAIN LAGI";
          }
        };
        window.addEventListener("keydown", function(e){
          const k = e.key.toLowerCase();
          if(keys[k]){ e.preventDefault(); keys[k](); }
        });
        cb({ run: function(G){
          const inst = G(ctx, S);
          if(inst && inst.update && inst.draw) loop(inst.update, function(){ inst.draw(ctx); });
        }});
      });
    });
  }

  return { boot, beep };
})();
