from playwright.sync_api import sync_playwright
CHECKS = """() => {
  const g = s => document.querySelector(s);
  const c = (s, prop) => { const e = g(s); return e ? getComputedStyle(e)[prop] : 'НЕТ ЭЛЕМЕНТА'; };
  return {
    'ссылка в меню':      c('.pz-nav__links a', 'color'),
    'кнопка тёмная':      c('.pz-hero__actions .pz-btn', 'color'),
    'кнопка золотая':     c('.pz-visit__foot .pz-btn--gold', 'color'),
    'подчёркивание меню': c('.pz-nav__links a', 'textDecorationLine'),
    'ссылки в подвале':   c('.pz-footer__col a', 'color'),
    'шрифт H1':           c('.pz-h1', 'fontFamily').split(',')[0],
    'кегль H1':           c('.pz-h1', 'fontSize'),
    'шрифт лида':         c('.pz-lead', 'fontFamily').split(',')[0],
    'кегль лида':         c('.pz-lead', 'fontSize'),
    'ширина контейнера':  Math.round(g('.pz__wrap').getBoundingClientRect().width),
    'ширина тёмной ленты':Math.round(g('.pz-prologue').getBoundingClientRect().width),
    'высота героя':       Math.round(g('.pz-hero').getBoundingClientRect().height),
    'плавающая шапка':    c('.pz-bar', 'position'),
    'гориз. скролл':      document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    res = {}
    for name, url in [('чисто', 'http://127.0.0.1:8765/tilda/_test.html'),
                      ('в Tilda', 'http://127.0.0.1:8765/tilda/_test_tilda.html')]:
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(url, wait_until="load", timeout=60000); pg.wait_for_timeout(1500)
        res[name] = pg.evaluate(CHECKS); res[name]['ошибки JS'] = errs or 'нет'
        pg.screenshot(path="_shot_%s.png" % ('clean' if name == 'чисто' else 'tilda'), full_page=True)
        pg.close()
    keys = list(res['чисто'].keys())
    print("%-22s %-30s %-30s" % ('параметр', 'чисто', 'в обёртке Tilda'))
    print("-" * 84)
    for k in keys:
        a, c_ = res['чисто'][k], res['в Tilda'][k]
        mark = '' if a == c_ else '   <-- РАСХОЖДЕНИЕ'
        print("%-22s %-30s %-30s%s" % (k, a, c_, mark))
    b.close()
