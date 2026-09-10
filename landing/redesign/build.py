"""Regenerate the ready-to-paste Tilda fragments and portable previews.

Python standard library only. Run: python landing/redesign/build.py
"""
from pathlib import Path
import base64
import json
import re

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'source-templates'
MEDIA_VERSION = '7bbab1066b4cd21a54925640dce669cc364ebee0'
CDN = f'https://cdn.jsdelivr.net/gh/dimrurnd-cell/Pushekb@{MEDIA_VERSION}/landing/redesign/assets'
head = (HERE / '01-head.html').read_text(encoding='utf-8')
css = (SOURCE / '02-styles.css').read_text(encoding='utf-8')
body = (SOURCE / '03-body-t123.html').read_text(encoding='utf-8')
footer = (SOURCE / '04-footer.html').read_text(encoding='utf-8')

def render(text, assets):
    return (text.replace('@@ASSET@@', assets)
            .replace('@@AUTUMN_VIDEO@@', assets + '/embankment.mp4'))

meta = ('<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<meta name="description" content="Пушкин. Живой — мультимедийная выставка в Екатеринбурге. '
        'Мультимедийный фильм и интерактивная зона. 5 октября — 29 ноября 2026, Свердловская киностудия.">'
        '<title>Пушкин. Живой — мультимедийная выставка в Екатеринбурге</title>')

def page(content, script=footer):
    return ('<!doctype html><html lang="ru"><head>' + meta + head
            + '<style>html{scroll-behavior:auto}body{margin:0}' + css
            + '</style></head><body>' + content + script + '</body></html>')

files = {
    '02-styles.css': css,
    '02-styles-T123.html': '<style>\n' + css + '\n</style>',
    '03-body-t123.html': render(body, CDN),
    '04-footer.html': footer,
    'preview.html': page(render(body, 'assets')),
    'preview-cdn.html': page(render(body, CDN)),
}
single = render(body, 'assets')
images = {}
chapter_files = set(re.findall(r"'([^']+\.jpg)'", footer))
for asset in (HERE / 'assets').iterdir():
    if asset.suffix not in ('.jpg', '.png', '.mp4'):
        continue
    if ('assets/' + asset.name) not in single and asset.name not in chapter_files:
        continue
    mime = {'.jpg':'image/jpeg', '.png':'image/png', '.mp4':'video/mp4'}[asset.suffix]
    data = f'data:{mime};base64,' + base64.b64encode(asset.read_bytes()).decode()
    single = single.replace('assets/' + asset.name, data)
    if asset.name in chapter_files:
        images[asset.name] = data
single_footer = footer.replace('chapterImage.src=assetBase+data[3];',
                              'chapterImage.src=' + json.dumps(images) + '[data[3]];')
files['Пушкин-Живой-просмотр.html'] = page(single, single_footer)
for name, content in files.items():
    (HERE / name).write_text(content, encoding='utf-8')
print('Tilda fragments and previews regenerated.')

