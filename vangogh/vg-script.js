
/* Билеты продаются на tickets.donexpocentre.ru по ссылке, виджет Яндекс Билетов не подключён. */
window.VANGOGH_EXHIBIT_CONFIG = window.VANGOGH_EXHIBIT_CONFIG || {};
window.VANGOGH_EXHIBIT_CONFIG.tickets = window.VANGOGH_EXHIBIT_CONFIG.tickets || {};
/* Номер счётчика Яндекс Метрики (0 — счётчик не подключён). Если счётчик подключён в настройках Тильды, код страницы
   свой не запускает; иначе запускает сам. */
window.VANGOGH_EXHIBIT_CONFIG.metrikaId = window.VANGOGH_EXHIBIT_CONFIG.metrikaId || 0;
(function () {
  'use strict';
  var watcher;
  function init() {
    var root = document.getElementById('vangogh-exhibit');
    if (!root) return false;
    if (root.dataset.pxInitialized === 'true') return true;
    root.dataset.pxInitialized = 'true';
    root.classList.add('px-enhanced');
    var q = function (s) { return root.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    /* Метрику и уведомление о cookie подключаем первыми: сбой в остальном коде не должен их блокировать. */
    try { mountConsent(q); } catch (e) { if (window.console) console.error(e); }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobile = window.matchMedia('(max-width:650px)');
    try { mountManuscript(q, mobile); } catch (e) { if (window.console) console.error(e); }
    try { mountTrailer(q); } catch (e) { if (window.console) console.error(e); }
    var manuallyCalm = false;
    var calm = function () { return reduce.matches || manuallyCalm; };
    var motion = q('.px-motion-toggle');
    function updateMotion() {
      root.classList.toggle('px-calm', calm());
      motion.setAttribute('aria-pressed', String(calm()));
      motion.textContent = reduce.matches ? 'Движение уменьшено в настройках устройства' : manuallyCalm ? 'Включить анимацию' : 'Остановить анимацию';
      motion.disabled = reduce.matches;

    }
    motion.addEventListener('click', function () { manuallyCalm = !manuallyCalm; updateMotion(); });
    if (reduce.addEventListener) reduce.addEventListener('change', updateMotion);
    else reduce.addListener(updateMotion);
    var menu=q('.px-menu-toggle');var nav=q('#px-nav');
    function closeMenu(returnFocus) {nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');if(returnFocus)menu.focus();}
    menu.addEventListener('click',function(){var open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
    root.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu(true);}});
    root.addEventListener('focusout',function(){setTimeout(function(){if(!q('.px-header').contains(document.activeElement))closeMenu(false);},0);});
    root.addEventListener('click',function(e){if(!e.target.closest('.px-header'))closeMenu(false);});
    var backdrop=q('.px-nav-backdrop');if(backdrop)backdrop.addEventListener('click',function(){closeMenu(false);});
    /* На телефоне шапка уезжает; когда она почти скрылась, гамбургер получает фон-кружок. */
    if('IntersectionObserver'in window){new IntersectionObserver(function(entries){root.classList.toggle('px-header-away',!entries[0].isIntersecting);},{rootMargin:'-58px 0px 0px 0px'}).observe(q('.px-header'));}
    if(mobile.addEventListener)mobile.addEventListener('change',function(){closeMenu(false);});
    root.addEventListener('click',function(e){
      var link=e.target.closest('a[href^="#px-"]');if(!link)return;
      var target=document.getElementById(link.getAttribute('href').slice(1));if(!target||!root.contains(target))return;
      e.preventDefault();closeMenu(false);
      target.scrollIntoView({behavior:calm()?'auto':'smooth',block:'start'});
      if(!target.hasAttribute('tabindex')){target.setAttribute('tabindex','-1');target.addEventListener('blur',function(){target.removeAttribute('tabindex');},{once:true});}
      target.focus({preventScroll:true});
    });
    var ticking=false;
    function progress(){ticking=false;var rect=root.getBoundingClientRect();var range=root.offsetHeight-window.innerHeight;var value=range>0?Math.min(1,Math.max(0,-rect.top/range)):0;root.style.setProperty('--px-progress',value.toFixed(4));}
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(progress);}},{passive:true});
    window.addEventListener('resize',progress,{passive:true});
    if('IntersectionObserver'in window && !calm()){
      var reveal=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.remove('px-reveal-pending');reveal.unobserve(entry.target);}});},{threshold:.08});
      qa('[data-reveal]').forEach(function(el){el.classList.add('px-reveal-pending');reveal.observe(el);});
    }
    /* Галерея зала: прокрутка стрелками, увеличение кадра по клику. */
    var track=q('#px-hallery-track');
    if(track){
      var shots=qa('.px-hallery-cell');
      var shotPrev=q('.px-hallery-prev'),shotNext=q('.px-hallery-next');
      var box=q('#px-lightbox'),boxImage=q('#px-lightbox-image'),boxCaption=q('#px-lightbox-caption');
      var shotAt=0,shotTick=false;
      function shotStep(){
        if(!shots.length)return 320;
        return shots[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||18);
      }
      function syncArrows(){
        var max=track.scrollWidth-track.clientWidth-2;
        shotPrev.disabled=track.scrollLeft<=2;
        shotNext.disabled=track.scrollLeft>=max;
      }
      function slide(direction){track.scrollBy({left:direction*shotStep(),behavior:calm()?'auto':'smooth'});}
      shotPrev.addEventListener('click',function(){slide(-1);});
      shotNext.addEventListener('click',function(){slide(1);});
      track.addEventListener('scroll',function(){
        if(shotTick)return;shotTick=true;
        requestAnimationFrame(function(){shotTick=false;syncArrows();});
      },{passive:true});
      track.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight')slide(1);else if(e.key==='ArrowLeft')slide(-1);else return;
        e.preventDefault();
      });
      window.addEventListener('resize',syncArrows,{passive:true});
      syncArrows();
      var canOpen=box&&typeof box.showModal==='function';
      function showShot(index){
        shotAt=(index+shots.length)%shots.length;
        var cell=shots[shotAt],image=cell.querySelector('img');
        boxImage.src=cell.dataset.full||image.src;
        boxImage.alt=image.alt;
        boxCaption.textContent=cell.querySelector('.px-hallery-caption span').textContent+' · '+(shotAt+1)+' из '+shots.length;
      }
      shots.forEach(function(cell,index){
        cell.addEventListener('click',function(){
          /* Без поддержки dialog просто открываем кадр отдельной страницей. */
          if(!canOpen){window.open(cell.dataset.full,'_blank','noopener');return;}
          showShot(index);box.showModal();
        });
      });
      if(canOpen){
        q('[data-lb-prev]').addEventListener('click',function(){showShot(shotAt-1);});
        q('[data-lb-next]').addEventListener('click',function(){showShot(shotAt+1);});
        q('[data-lb-close]').addEventListener('click',function(){box.close();});
        box.addEventListener('keydown',function(e){
          if(e.key==='ArrowRight')showShot(shotAt+1);else if(e.key==='ArrowLeft')showShot(shotAt-1);else return;
          e.preventDefault();
        });
        box.addEventListener('click',function(e){if(e.target===box)box.close();});
        box.addEventListener('close',function(){shots[shotAt].focus({preventScroll:true});});
      }
    }
    mountTickets(q, calm);
    updateMotion();progress();return true;
  }
  /* Строфа и подпись встают в свободный коридор между текстом первого экрана и портретом.
     Узкий коридор (меньше 200 px) — рукопись не показываем, чтобы не наезжать на текст. */
  function mountManuscript(q, mobile){
    var ms=q('.px-manuscript-hero'),hero=q('.px-hero'),portrait=q('.px-portrait'),actions=q('.px-hero-actions'),line=q('.px-hero-line');
    if(!ms||!hero||!portrait||!actions||!line)return;
    function textRight(){
      var right=0;
      ['.px-hero-line','.px-hero-description','.px-hero-event','.px-hero-actions'].forEach(function(sel){
        var el=q(sel);if(!el)return;
        var walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),node;
        while((node=walker.nextNode())){
          if(!node.textContent.trim())continue;
          var range=document.createRange();range.selectNodeContents(node);
          Array.prototype.forEach.call(range.getClientRects(),function(r){if(r.right>right)right=r.right;});
        }
        Array.prototype.forEach.call(el.querySelectorAll('a'),function(a){var r=a.getBoundingClientRect();if(r.right>right)right=r.right;});
      });
      return right;
    }
    function place(){
      if(mobile.matches){ms.classList.remove('is-placed');return;}
      var h=hero.getBoundingClientRect(),p=portrait.getBoundingClientRect();
      var top=line.getBoundingClientRect().top-h.top,bottom=actions.getBoundingClientRect().bottom-h.top;
      var x=textRight()-h.left+32,w=p.left-h.left-36-x;
      if(w<200){ms.classList.remove('is-placed');return;}
      var fs=Math.max(18,Math.min(34,w*0.085)),room=bottom-top+30;
      ms.style.setProperty('--ms-x',x+'px');ms.style.setProperty('--ms-w',w+'px');
      ms.classList.add('is-placed');
      for(var k=0;k<8;k++){
        ms.style.setProperty('--ms-fs',fs+'px');
        if(ms.getBoundingClientRect().height<=room||fs<=18)break;
        fs-=2;
      }
      var mh=ms.getBoundingClientRect().height;
      ms.style.setProperty('--ms-y',(top+Math.max(0,(bottom-top-mh)/2)+mh*0.04)+'px');
    }
    var timer;
    function later(){clearTimeout(timer);timer=setTimeout(place,150);}
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);else place();
    window.addEventListener('resize',later);
  }
  /* Трейлер на Rutube. Плеер создаём только по клику: он тяжёлый и ставит свои cookie.
     Без скрипта ссылки ведут на страницу ролика. Цель Метрики trailer_play — «JavaScript-событие». */
  function mountTrailer(q){
    var cover=q('.px-trailer-cover'),src=cover&&cover.dataset.trailerSrc;if(!src)return;
    var stage=cover.querySelector('.px-trailer-stage'),start=cover.querySelector('[data-trailer-play]');
    function frame(){
      var f=document.createElement('iframe');
      f.src=src+(src.indexOf('?')>-1?'&':'?')+'autoplay=true';
      f.title='Трейлер выставки «Ван Гог. Рождённый под холодной звездой»';
      f.allow='clipboard-write; autoplay; fullscreen; picture-in-picture';f.setAttribute('allowfullscreen','');
      return f;
    }
    function goal(){var id=Number(window.VANGOGH_EXHIBIT_CONFIG.metrikaId)||0;if(id&&typeof window.ym==='function')window.ym(id,'reachGoal','trailer_play');}
    function pauseInline(){var f=stage.querySelector('iframe');if(f&&f.contentWindow)f.contentWindow.postMessage(JSON.stringify({type:'player:pause',data:{}}),'*');}
    if(stage&&start)start.addEventListener('click',function(e){
      e.preventDefault();if(stage.classList.contains('is-playing'))return;
      var f=frame();stage.appendChild(f);stage.classList.add('is-playing');
      var cap=cover.querySelector('figcaption');if(cap)cap.textContent='Трейлер выставки «Ван Гог. Рождённый под холодной звездой», 1:20.';
      f.focus();goal();
    });
    var box=q('#px-trailer-dialog'),open=q('[data-trailer-open]');
    if(!box||!open||typeof box.showModal!=='function')return;
    var slot=box.querySelector('.px-trailer-box');
    open.addEventListener('click',function(e){
      e.preventDefault();pauseInline();slot.appendChild(frame());box.showModal();goal();
    });
    box.querySelector('[data-trailer-close]').addEventListener('click',function(){box.close();});
    box.addEventListener('click',function(e){if(e.target===box)box.close();});
    /* Закрыли окно — убираем плеер, чтобы звук не продолжался. */
    box.addEventListener('close',function(){slot.textContent='';open.focus({preventScroll:true});});
  }
  function mountConsent(q){
    var id=Number(window.VANGOGH_EXHIBIT_CONFIG.metrikaId)||0;
    /* Если счётчик подключён в настройках Тильды, свой не запускаем, чтобы не было двух копий. */
    var tilda=[].some.call(document.querySelectorAll('script:not([src])'),function(el){
      var t=el.textContent;if(t.indexOf('VANGOGH_EXHIBIT_CONFIG')>-1)return false;
      return t.indexOf('mc.yandex.ru/metrika/tag.js')>-1&&(el.hasAttribute('data-tilda-cookie-type')||t.indexOf('mainMetrikaId')>-1);
    });
    if(id&&!tilda&&!window.pxMetrikaStarted){
      window.pxMetrikaStarted=true;
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments);};m[i].l=1*new Date();if(e.querySelector('script[src="'+r+'"]'))return;k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
      window.ym(id,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});
    }
    /* Уведомление о cookie показываем, пока посетитель его не закрыл; выбор помним год. */
    var banner=q('#px-cookie');
    if(!banner)return;
    var name='px_cookie_notice';
    if(new RegExp('(?:^|; )'+name+'=').test(document.cookie))return;
    banner.hidden=false;
    q('[data-cookie-accept]').addEventListener('click',function(){
      document.cookie=name+'=seen; max-age=31536000; path=/; SameSite=Lax';
      banner.hidden=true;
    });
  }
  /* Яндекс Билеты: форма монтируется, когда блок покупки попадает в зону видимости. */
  function mountTickets(q, calm){
    var frame=q('#ya-widget-frame');if(!frame||frame.dataset.pxTickets)return;
    frame.dataset.pxTickets='pending';
    var cfg=(window.VANGOGH_EXHIBIT_CONFIG||{}).tickets||{};
    var placeholder=frame.querySelector('[data-ticket-placeholder]');
    var widget=null,timer=null;
    if(!cfg.clientKey||!cfg.eventId){fail('Продажа билетов пока не подключена. Билеты можно купить в кассе на выставке.');return;}
    function fail(text){
      frame.dataset.pxTickets='failed';frame.setAttribute('aria-busy','false');
      if(placeholder)placeholder.textContent=text||'Форма продажи билетов не загрузилась. Купите билет в кассе на выставке или позвоните нам.';
    }
    function mount(){
      if(timer)return;
      timer=setTimeout(function(){if(frame.dataset.pxTickets!=='mounted')fail();},12000);
      var dealer=window.YandexTicketsDealer=window.YandexTicketsDealer||[];
      dealer.push(['setDefaultClientKey',cfg.clientKey]);
      /* setYandexMetrika сюда не добавлять: с ним виджет не отрисовывается (проверено 01.10.2026).
         Цели виджета подключаются номером счётчика через форму Яндекс Билетов. */
      if(cfg.regionId)dealer.push(['setDefaultRegionId',cfg.regionId]);
      dealer.push(['getDealer',function(api){
        clearTimeout(timer);timer=null;
        if(placeholder&&placeholder.parentNode)placeholder.parentNode.removeChild(placeholder);
        frame.classList.add('is-mounted');frame.dataset.pxTickets='mounted';frame.setAttribute('aria-busy','false');
        widget=api.Widget(cfg.eventId,'event',{target:frame,onRequestClose:function(){
          /* Закрытие формы не должно оставлять пустую карточку: монтируем заново. */
          try{widget.unmount();}catch(ignore){}
          frame.classList.remove('is-mounted');frame.dataset.pxTickets='pending';
          widget.mount({style:{height:'620px'}});frame.classList.add('is-mounted');frame.dataset.pxTickets='mounted';
        }});
        widget.mount({style:{height:'620px'}});
      }]);
      if(document.querySelector('script[data-px-tickets]'))return;
      var script=document.createElement('script');
      script.async=true;script.dataset.pxTickets='true';
      script.src='https://widget.afisha.yandex.ru/dealer/dealer.js';
      script.onerror=function(){clearTimeout(timer);timer=null;fail();};
      document.head.appendChild(script);
    }
    if(!('IntersectionObserver'in window)||calm()){mount();return;}
    var io=new IntersectionObserver(function(entries){
      if(entries.some(function(e){return e.isIntersecting;})){io.disconnect();mount();}
    },{rootMargin:'400px 0px'});
    io.observe(frame);
  }
  function start(){
    if(init())return;
    /* Поддерживает вставку HTML редактором после DOMContentLoaded. */
    watcher=new MutationObserver(function(){if(init()){watcher.disconnect();}});
    watcher.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){if(watcher)watcher.disconnect();},30000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* Живое небо первого экрана: частицы идут по полю вихрей вокруг звёзд и оставляют мазки цветов афиши.
   Курсор или палец добавляет вихрь. На телефоне и в спокойном режиме рисуем один неподвижный кадр. */
(function () {
  'use strict';
  function sky() {
    var root = document.getElementById('vangogh-exhibit');
    var cv = root && root.querySelector('.vg-sky');
    if (!cv || cv.dataset.vgSky) return !!cv;
    cv.dataset.vgSky = 'on';
    setTimeout(function () { root.classList.add('vg-ready'); }, 60);
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var phone = window.matchMedia('(max-width:650px)');
    var BLUE = ['#1f3f8f', '#2b54b0', '#4f74c8', '#16224f', '#7d9bea', '#1a3270'];
    var STAR = ['#e7b848', '#f7f0dd', '#f3d27a'];
    var W, H, parts = [], stars = [], mouse = null, running = false, visible = true;
    function still() { return reduce.matches || phone.matches || root.classList.contains('px-calm'); }
    function spawn() { return { x: Math.random() * W, y: Math.random() * H, life: 40 + Math.random() * 120, w: 1.2 + Math.random() * 2.4, c: BLUE[(Math.random() * BLUE.length) | 0] }; }
    function setup() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return false;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0b112b'; ctx.fillRect(0, 0, W, H);
      var m = Math.min(W, H);
      stars = [{ x: W * .62, y: H * .16, r: m * .12, s: 1 }, { x: W * .9, y: H * .2, r: m * .14, s: -1 }, { x: W * .3, y: H * .55, r: m * .17, s: 1 }, { x: W * .1, y: H * .2, r: m * .1, s: -1 }, { x: W * .78, y: H * .78, r: m * .11, s: 1 }];
      parts = []; var n = Math.round(Math.min(1100, W * H / 900)); for (var i = 0; i < n; i++) parts.push(spawn());
      return true;
    }
    function field(x, y) {
      var vx = .6 + .4 * Math.sin(y * .012), vy = .35 * Math.cos(x * .01 + y * .004), all = mouse ? stars.concat([mouse]) : stars;
      for (var i = 0; i < all.length; i++) { var st = all[i], dx = x - st.x, dy = y - st.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2 + 1), k = st.s * st.r * st.r * 2.2 / (d2 + st.r * st.r); vx += -dy / d * k; vy += dx / d * k; }
      return [vx, vy];
    }
    function nearStar(x, y) { for (var i = 0; i < stars.length; i++) { var dx = x - stars[i].x, dy = y - stars[i].y; if (dx * dx + dy * dy < Math.pow(stars[i].r * .55, 2)) return true; } return false; }
    function step() {
      ctx.fillStyle = 'rgba(11,17,43,0.035)'; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.globalAlpha = .55;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], v = field(p.x, p.y), m = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1, nx = p.x + v[0] / m * 2.2, ny = p.y + v[1] / m * 2.2;
        ctx.strokeStyle = nearStar(p.x, p.y) ? STAR[(p.x | 0) % 3] : p.c; ctx.lineWidth = p.w;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny; p.life--;
        if (p.life < 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) parts[i] = spawn();
      }
      ctx.globalAlpha = 1;
    }
    function paintStill() { for (var i = 0; i < 280; i++) step(); }
    function loop() { if (!running) return; if (still()) { running = false; return; } step(); requestAnimationFrame(loop); }
    function start() { if (!running && visible && !still() && W) { running = true; requestAnimationFrame(loop); } }
    function stop() { running = false; }
    function reset() { if (!setup()) return; if (still()) paintStill(); else { for (var i = 0; i < 120; i++) step(); start(); } }
    reset();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { stop(); reset(); }, 200); }, { passive: true });
    var hero = cv.parentElement;
    function setMouse(e) { var r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top, r: Math.min(W, H) * .12, s: 1 }; }
    hero.addEventListener('pointermove', setMouse, { passive: true });
    hero.addEventListener('pointerleave', function () { mouse = null; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    new MutationObserver(function () { if (still()) stop(); else start(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    return true;
  }
  function boot() { if (sky()) return; var w = new MutationObserver(function () { if (sky()) w.disconnect(); }); w.observe(document.documentElement, { childList: true, subtree: true }); setTimeout(function () { w.disconnect(); }, 30000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();

