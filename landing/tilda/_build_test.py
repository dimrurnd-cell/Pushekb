import pathlib, re
R = pathlib.Path(__file__).parent
head = (R/'01-head.html').read_text(encoding='utf-8')
css  = (R/'02-styles.css').read_text(encoding='utf-8')
body = (R/'03-body-t123.html').read_text(encoding='utf-8')
foot = (R/'04-footer.html').read_text(encoding='utf-8')
page = ("<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        "<title>Пушкин. Живой</title>" + head +
        "<style>body{margin:0}</style><style>" + css + "</style></head><body>"
        + body + foot + "</body></html>")
# для локальной проверки подменяем CDN на файлы репозитория
page = re.sub(r'https://cdn\.jsdelivr\.net/gh/\S*?/landing/img/', '../img/', page)
page = re.sub(r'https://cdn\.jsdelivr\.net/gh/\S*?/landing/fonts/', '../fonts/', page)
assert 'jsdelivr.net/gh' not in page, 'остались ссылки на файлы CDN'
(R/'_test.html').write_text(page, encoding='utf-8')
print('_test.html собран, картинки локальные')
