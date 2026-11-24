(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var typed = document.getElementById('typed');
  var idblock = document.getElementById('idblock');
  if (typed && idblock){
    var cmd = 'whoami';
    var statusbar = idblock.querySelector('.statusbar');
    if (statusbar) [].forEach.call(statusbar.children, function(svc, ix){ svc.style.setProperty('--i', ix); });
    var boot = function(){ if (statusbar) statusbar.classList.add('boot'); };
    var show = function(){ idblock.classList.add('show'); if (reduce) boot(); else setTimeout(boot, 450); };
    if (reduce){ typed.textContent = cmd; show(); }
    else {
      var i = 0;
      (function step(){
        if (i <= cmd.length){ typed.textContent = cmd.slice(0,i); i++; setTimeout(step, 85); }
        else { setTimeout(show, 260); }
      })();
    }
  }

  // "now" pill: a label picked at random from the current Valais time slot.
  // Purely clock and calendar based; a new label is drawn only when the slot changes.
  var NOW = {
    A: ['brewing coffee', 'steeping tea', 'sudo make coffee', 'least privilege, maximum caffeine', 'zero trust, full mug', 'phishing-resistant, caffeine-dependent'],
    B: ['securing things', 'hardening the blue wall', 'report-only before enforce', 'verifying logs before blocking', 'applying least privilege', "reading logs so you don't have to", 'making inherited things defensible', 'writing docs future me will thank me for'],
    C: ['refueling', 'tea break', 'sleep 3600', 'cooking something real'],
    D: ["it's Patch Tuesday", 'reading release notes', 'patching all the things'],
    E: ['breaking the homelab', 'fixing what I broke', 'snapshot first, then chaos', 'self-hosting one more thing', 'docker compose up -d', 'chasing Valais by night', 'training on Mt. Silver'],
    F: ['shooting photos', 'chasing light', 'cooking something slow', 'training on Mt. Silver', 'steeping a second pot', 'touching grass (verified)'],
    G: ['idle', 'dreaming in YAML', 'cron jobs only', "logs rotate, I don't"]
  };
  var slotOf = function(wd, day, m){ // wd: 0=Sun..6=Sat, day: day of month, m: minutes since midnight
    if (m < 360 || m >= 1350) return 'G';  // 22:30-06:00
    if (m < 540) return 'A';               // 06:00-09:00
    if (m >= 1050) return 'E';             // 17:30-22:30
    if (wd === 0 || wd === 6) return 'F';  // weekend 09:00-17:30
    if (m >= 720 && m < 810) return 'C';   // weekday 12:00-13:30
    return (wd === 2 && day >= 8 && day <= 14) ? 'D' : 'B'; // second Tuesday of the month: Patch Tuesday
  };

  var clock = document.getElementById('clock');
  var now = document.getElementById('now');
  if (clock){
    var fmt = null, slot = null;
    try { fmt = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',weekday:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}); } catch(e){}
    var WD = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    var tick = function(){
      var d = new Date(), p = {};
      if (fmt) fmt.formatToParts(d).forEach(function(x){ p[x.type] = x.value; });
      else p = { weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], day: d.getDate(), hour: ('0'+d.getHours()).slice(-2), minute: ('0'+d.getMinutes()).slice(-2), second: ('0'+d.getSeconds()).slice(-2) };
      clock.textContent = p.hour + ':' + p.minute + ':' + p.second;
      if (!now) return;
      var s = slotOf(WD[p.weekday], +p.day, (+p.hour) * 60 + (+p.minute));
      if (s !== slot){ slot = s; now.textContent = NOW[s][Math.floor(Math.random() * NOW[s].length)]; }
    };
    tick(); setInterval(tick, 1000);
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('show'); en.target.querySelectorAll('.chip, .card, .album').forEach(function(k,ix){ k.style.transitionDelay = Math.min(ix*55,500) + 'ms'; }); io.unobserve(en.target); } });
    }, { threshold: .12 });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('show'); });
  }

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  if (nav && toggle){
    toggle.addEventListener('click', function(){ toggle.setAttribute('aria-expanded', nav.classList.toggle('open') ? 'true' : 'false'); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }); });
  }

  // scroll-linked: nav scrollspy + career timeline
  var links = {};
  document.querySelectorAll('#navList a[href^="/#"]').forEach(function(a){ links[a.getAttribute('href').slice(2)] = a; });
  var sections = [].filter.call(document.querySelectorAll('main section[id]'), function(sec){ return links[sec.id]; });
  var entries = [].slice.call(document.querySelectorAll('.timeline .entry'));
  var current = null;
  var DOT_Y = 12.5; // dot centre, matches --dot-y in global.css
  // every frame: all layout reads first, then all writes (no forced reflow)
  var frame = function(){
    var id = null, rects = null;
    if (sections.length){
      var line = innerHeight * 0.4;
      sections.forEach(function(sec){ if (sec.getBoundingClientRect().top <= line) id = sec.id; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = sections[sections.length - 1].id;
    }
    if (entries.length) rects = entries.map(function(en){ return en.getBoundingClientRect(); });

    if (sections.length && id !== current){
      if (current) links[current].removeAttribute('aria-current');
      if (id) links[id].setAttribute('aria-current', 'location');
      current = id;
    }
    if (rects){
      var reach = innerHeight * 0.6, last = entries.length - 1;
      rects.forEach(function(r, i){
        var start = r.top + (i === 0 ? DOT_Y : 0), end = i === last ? r.top + DOT_Y : r.bottom;
        var f = reduce ? 1 : Math.min(1, Math.max(0, (reach - start) / (end - start)));
        entries[i].style.setProperty('--f', f);
        entries[i].classList.toggle('lit', reduce || reach >= r.top + DOT_Y);
      });
    }
  };
  var ticking = false;
  var onScroll = function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){ ticking = false; frame(); });
  };
  if (sections.length || entries.length){
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  // name the clicked cover so it morphs into the album's first photo (page transition)
  document.querySelectorAll('a.album').forEach(function(a){
    a.addEventListener('click', function(){
      document.querySelectorAll('.album .art').forEach(function(el){ el.style.viewTransitionName = ''; });
      a.querySelector('.art').style.viewTransitionName = 'album-cover';
    });
  });

  // lightbox (album pages only)
  var lb = document.getElementById('lb');
  if (lb){
    var img = document.getElementById('lb-img');
    var items = [].slice.call(document.querySelectorAll('.masonry .ph'));
    var idx = 0;
    var preloaded = {};
    var preload = function(i){ i=(i+items.length)%items.length; if (preloaded[i]) return; preloaded[i]=true; new Image().src = items[i].dataset.full; };
    var swapTimer;
    img.addEventListener('load', function(){ img.classList.remove('swap'); });
    img.addEventListener('error', function(){ img.classList.remove('swap'); });
    var setSrc = function(src){
      clearTimeout(swapTimer);
      if (reduce || !lb.classList.contains('open')){ img.classList.remove('swap'); img.src = src; return; }
      img.classList.add('swap'); // short fade out, swap, fade back in once loaded
      swapTimer = setTimeout(function(){ img.src = src; if (img.complete) img.classList.remove('swap'); }, 150);
    };
    var showAt = function(i){ idx=(i+items.length)%items.length; setSrc(items[idx].dataset.full); preload(idx+1); preload(idx-1); };
    var openAt = function(i){ showAt(i); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); };
    var close = function(){ clearTimeout(swapTimer); lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); img.classList.remove('swap'); img.removeAttribute('src'); };
    var go = function(d){ showAt(idx+d); };
    items.forEach(function(a,i){ a.addEventListener('click', function(e){ e.preventDefault(); openAt(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function(e){ e.stopPropagation(); go(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function(e){ e.stopPropagation(); go(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    // swipe left/right on touch screens
    var sx = null, sy = 0;
    lb.addEventListener('touchstart', function(e){ if (e.touches.length !== 1){ sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function(e){
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  }
})();
