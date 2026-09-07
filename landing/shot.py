import sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).parent
jobs = [("_preview_Main.html", 1440, 8700, "shot-main.png"),
        ("_preview_HeroNight.html", 1440, 980, "shot-hero-night.png"),
        ("_preview_Mobile.html", 390, 6100, "shot-mobile.png")]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for f, w, h, out in jobs:
        pg = b.new_page(viewport={"width": w, "height": min(h, 2000)}, device_scale_factor=1)
        pg.goto((ROOT / f).as_uri())
        pg.wait_for_timeout(1400)
        real = pg.evaluate("document.body.scrollHeight")
        print(f, "content height =", real, "(frame", h, ")")
        pg.screenshot(path=str(ROOT / out), full_page=True)
        pg.close()
    b.close()
