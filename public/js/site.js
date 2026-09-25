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

  var clock = document.getElementById('clock');
  if (clock){
    var tick = function(){
      try { clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()); }
      catch(e){ clock.textContent = new Date().toLocaleTimeString('en-GB'); }
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
  var timeline = document.querySelector('.timeline');
  var entries = timeline ? [].slice.call(timeline.querySelectorAll('.entry')) : [];
  var current = null;
  var spy = function(){
    var line = innerHeight * 0.4, id = null;
    sections.forEach(function(sec){ if (sec.getBoundingClientRect().top <= line) id = sec.id; });
    if (sections.length && innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = sections[sections.length - 1].id;
    if (id === current) return;
    if (current) links[current].removeAttribute('aria-current');
    if (id) links[id].setAttribute('aria-current', 'location');
    current = id;
  };
  var draw = function(){
    var r = timeline.getBoundingClientRect();
    var p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    timeline.style.setProperty('--p', p);
    var reach = p * r.height;
    entries.forEach(function(en){ en.classList.toggle('lit', en.offsetTop + 10 <= reach + 0.5); });
  };
  var ticking = false;
  var onScroll = function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){ ticking = false; if (sections.length) spy(); if (timeline) draw(); });
  };
  if (sections.length || timeline){
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  // lightbox (album pages only)
  var lb = document.getElementById('lb');
  if (lb){
    var img = document.getElementById('lb-img');
    var items = [].slice.call(document.querySelectorAll('.masonry .ph'));
    var idx = 0;
    var preloaded = {};
    var preload = function(i){ i=(i+items.length)%items.length; if (preloaded[i]) return; preloaded[i]=true; new Image().src = items[i].dataset.full; };
    var showAt = function(i){ idx=(i+items.length)%items.length; img.src = items[idx].dataset.full; preload(idx+1); preload(idx-1); };
    var openAt = function(i){ showAt(i); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); };
    var close = function(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); img.src=''; };
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
