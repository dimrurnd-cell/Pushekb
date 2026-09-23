"""Regenerate the ready-to-paste Tilda fragments and portable previews.

Python standard library only. Run: python landing/redesign/build.py
"""
from pathlib import Path
import base64
import re

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'source-templates'
MEDIA_VERSION = '37b260fc839c1c0006fb632aa381eb8e76d628f6'
CDN = f'https://cdn.jsdelivr.net/gh/dimrurnd-cell/Pushekb@{MEDIA_VERSION}/landing/redesign/assets'
head = (HERE / '01-head.html').read_text(encoding='utf-8')
css = (SOURCE / '02-styles.css').read_text(encoding='utf-8')
body = (SOURCE / '03-body-t123.html').read_text(encoding='utf-8')
footer = (SOURCE / '04-footer.html').read_text(encoding='utf-8')

def render(text, assets):
    return text.replace('@@ASSET@@', assets)

meta = ('<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<meta name="description" content="Пушкин. Живой — мультимедийная выставка в Екатеринбурге. '
        'Мультимедийный фильм и интерактивная зона. 5 октября — 29 ноября 2026, Свердловская киностудия.">'
        '<title>Пушкин. Живой — мультимедийная выставка в Екатеринбурге</title>')

def page(content, script=footer):
    return ('<!doctype html><html lang="ru"><head>' + meta + head
            + '<style>html{scroll-behavior:auto}body{margin:0}' + css
            + '</style></head><body>' + content + script + '</body></html>')

font_match = re.search(r'<style[^>]*>([\s\S]*?)</style>', head, re.I)
assert font_match, 'Missing font stylesheet'
font_css = font_match.group(1).strip() + '\n'
assert '<style' not in font_css and '<!--' not in font_css

files = {
    'fonts.css': font_css,
    '02-styles.css': css,
    '02-styles-T123.html': '<style>\n' + css + '\n</style>',
    '03-body-t123.html': render(body, CDN),
    '04-footer.html': footer,
    'preview.html': page(render(body, 'assets')),
    'preview-cdn.html': page(render(body, CDN)),
}
single = render(body, 'assets')
for asset in sorted((HERE / 'assets').rglob('*')):
    if asset.suffix not in ('.jpg', '.png', '.webp', '.mp4'):
        continue
    ref = 'assets/' + asset.relative_to(HERE / 'assets').as_posix()
    if ref.startswith('assets/hall/') and ref.endswith('-full.webp'):
        continue
    if ref not in single:
        continue
    mime = {'.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.mp4':'video/mp4'}[asset.suffix]
    data = f'data:{mime};base64,' + base64.b64encode(asset.read_bytes()).decode()
    single = single.replace(ref, data)
# Полные кадры галереи оставляем на CDN: иначе файл вырастает на пару мегабайт.
# Подстановка идёт после вшивания, иначе цикл затирает путь внутри собранной ссылки.
single = re.sub(r'assets/hall/([\w-]+)-full\.webp', CDN + r'/hall/\1-full.webp', single)
files['Пушкин-Живой-просмотр.html'] = page(single, footer)
for name, content in files.items():
    assert '@@' not in content, f'Незаменённая подстановка в {name}'
    # Перевод строки задаём явно: иначе сборка на Windows и на Linux даёт разные файлы.
    (HERE / name).write_bytes(content.replace('\r\n', '\n').replace('\n', '\r\n').encode('utf-8'))
print('Tilda fragments and previews regenerated.')

