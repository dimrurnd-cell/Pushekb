#!/usr/bin/env python3
"""Собирает .dc.html артборды из шаблонов src/*.tpl.html,
подставляя @font-face с woff2-шрифтами в виде data-URI."""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
FACES = [
    ("Troover",  "troover.woff2",         400, "normal"),
    ("Monplesir","monplesir.woff2",        400, "normal"),
    ("Inserat",  "inserat.woff2",          400, "normal"),
    ("Akrobat",  "akrobat-light.woff2",    300, "normal"),
    ("Akrobat",  "akrobat-regular.woff2",  400, "normal"),
    ("Akrobat",  "akrobat-semibold.woff2", 600, "normal"),
    ("Akrobat",  "akrobat-black.woff2",    900, "normal"),
]

def font_css():
    out = []
    for family, fname, weight, style in FACES:
        data = base64.b64encode((ROOT / "fonts" / fname).read_bytes()).decode()
        out.append(
            "@font-face{font-family:'%s';font-weight:%d;font-style:%s;font-display:block;"
            "src:url(data:font/woff2;base64,%s) format('woff2');}" % (family, weight, style, data)
        )
    return "\n".join(out)

def main():
    css = font_css()
    built = []
    for tpl in sorted((ROOT / "src").glob("*.tpl.html")):
        name = tpl.name.replace(".tpl.html", ".dc.html")
        html = tpl.read_text(encoding="utf-8")
        if "/*__FONTS__*/" not in html:
            sys.exit("нет маркера /*__FONTS__*/ в " + tpl.name)
        html = html.replace("/*__FONTS__*/", css)
        (ROOT / name).write_text(html, encoding="utf-8")
        built.append((name, len(html)))
    for n, s in built:
        print("%-22s %6.1f KB" % (n, s / 1024))

if __name__ == "__main__":
    main()
