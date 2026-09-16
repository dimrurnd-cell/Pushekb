#!/usr/bin/env python3
"""Статический предпросмотр артборда: разворачивает .dc.html в обычную
HTML-страницу (подставляет значения тюнеров и локальные пути к картинкам),
чтобы можно было снять скриншот и проверить вёрстку."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent

def render(dc_path: pathlib.Path, out: pathlib.Path):
    src = dc_path.read_text(encoding="utf-8")
    helmet = re.search(r"<helmet>(.*?)</helmet>", src, re.S).group(1)
    body = re.search(r"<x-dc>(.*?)</x-dc>", src, re.S).group(1)
    body = body.replace(helmet, "").replace("<helmet>", "").replace("</helmet>", "")

    props = json.loads(re.search(r"data-props='(.*?)'\s*>", src, re.S).group(1)
                       .replace("&amp;", "&").replace("&#39;", "'"))
    for key, spec in props.items():
        if key.startswith("$"):
            continue
        body = body.replace("{{%s}}" % key, str(spec.get("default", "")))
    body = re.sub(r"\{\{\s*(\w+)\s*\}\}", "", body)
    body = re.sub(r'src="([\w\-]+\.(?:jpg|png|webp))"', r'src="img/\1"', body)

    out.write_text(
        "<!doctype html><html><head><meta charset='utf-8'>" + helmet + "</head><body>"
        + body + "</body></html>", encoding="utf-8")
    print("preview:", out.name)

if __name__ == "__main__":
    for name in sys.argv[1:]:
        render(ROOT / name, ROOT / ("_preview_" + name.replace(".dc.html", ".html")))
