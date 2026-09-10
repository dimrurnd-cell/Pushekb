import pathlib
from playwright.sync_api import sync_playwright
R = pathlib.Path(__file__).parent
jobs = [(1440, "t-desktop.jpg"), (960, "t-tablet.jpg"), (390, "t-mobile.jpg")]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for w, out in jobs:
        pg = b.new_page(viewport={"width": w, "height": 1000})
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append("PAGEERROR: " + str(e)))
        pg.goto("http://127.0.0.1:8765/tilda/_test.html", wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(2500)
        # прокрутить всю страницу, чтобы сработали IntersectionObserver-анимации
        pg.evaluate("""async () => {
            const step = window.innerHeight * 0.8;
            for (let y = 0; y < document.body.scrollHeight; y += step) {
                window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90));
            }
            window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
        }""")
        pg.wait_for_timeout(900)
        h = pg.evaluate("document.body.scrollHeight")
        print(out, "ширина", w, "высота", h, "| ошибки:", errs if errs else "нет")
        pg.screenshot(path=str(R / out.replace(".jpg", ".png")), full_page=True)
        pg.close()
    b.close()
