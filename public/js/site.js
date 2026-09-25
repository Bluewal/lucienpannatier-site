(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var typed = document.getElementById('typed');
  var idblock = document.getElementById('idblock');
  if (typed && idblock){
    var cmd = 'whoami';
    var show = function(){ idblock.classList.add('show'); };
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

  // lightbox (album pages only)
  var lb = document.getElementById('lb');
  if (lb){
    var img = document.getElementById('lb-img');
    var items = [].slice.call(document.querySelectorAll('.masonry .ph'));
    var idx = 0;
    var openAt = function(i){ idx=i; img.src = items[i].dataset.full; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); };
    var close = function(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); img.src=''; };
    var go = function(d){ idx=(idx+d+items.length)%items.length; img.src = items[idx].dataset.full; };
    items.forEach(function(a,i){ a.addEventListener('click', function(e){ e.preventDefault(); openAt(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function(e){ e.stopPropagation(); go(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function(e){ e.stopPropagation(); go(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  }
})();
