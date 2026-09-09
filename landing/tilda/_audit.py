from playwright.sync_api import sync_playwright
URL = "http://127.0.0.1:8765/tilda/_test.html"
WIDTHS = [320, 390, 480, 640, 768, 960, 1200, 1440, 1680, 1920, 2560]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for w in WIDTHS:
        pg = b.new_page(viewport={"width": w, "height": 900})
        pg.goto(URL, wait_until="load", timeout=60000)
        pg.wait_for_timeout(800)
        r = pg.evaluate("""() => {
          const de = document.documentElement;
          const over = [];
          document.querySelectorAll('#pz *').forEach(el => {
            const b = el.getBoundingClientRect();
            if (b.width === 0) return;
            if (b.right > de.clientWidth + 1 || b.left < -1) {
              over.push((el.className || el.tagName) + ' [' + Math.round(b.left) + '…' + Math.round(b.right) + ']');
            }
          });
          const wrap = document.querySelector('.pz__wrap').getBoundingClientRect();
          const arch = document.querySelector('.pz-arch');
          return {
            scrollW: de.scrollWidth, clientW: de.clientWidth,
            hscroll: de.scrollWidth > de.clientWidth,
            wrapW: Math.round(wrap.width),
            archPct: arch ? Math.round(arch.getBoundingClientRect().width / wrap.width * 100) : null,
            heroH: Math.round(document.querySelector('.pz-hero').getBoundingClientRect().height),
            overflow: over.slice(0, 6)
          };
        }""")
        flag = "ГОРИЗ. СКРОЛЛ" if r["hscroll"] else "ok"
        print("%5d | %-14s scrollW=%-5d контейнер=%-5d арка=%s%% герой=%d %s" % (
            w, flag, r["scrollW"], r["wrapW"], r["archPct"], r["heroH"],
            (" | вылезает: " + "; ".join(r["overflow"])) if r["overflow"] else ""))
        pg.close()
    b.close()
