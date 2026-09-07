"""Собирает страницу так, как её видит Tilda: с обёртками .t-rec/.t123
и правдоподобным набором глобальных стилей Tilda поверх наших."""
import pathlib, re
R = pathlib.Path(__file__).parent
head = (R/'01-head.html').read_text(encoding='utf-8')
css  = (R/'02-styles.css').read_text(encoding='utf-8')
body = (R/'03-body-t123.html').read_text(encoding='utf-8')
foot = (R/'04-footer.html').read_text(encoding='utf-8')

TILDA = """
/* --- имитация глобальных стилей Tilda --- */
* { -webkit-box-sizing: border-box; box-sizing: border-box; }
body { margin:0; font-family: Arial, Helvetica, sans-serif; font-size:16px;
       line-height:1.55; color:#000; background:#fff; }
#allrecords { -webkit-font-smoothing: antialiased; }
#allrecords a { color:#ff8562; text-decoration:none; }
#allrecords a:hover { text-decoration:underline; }
h1,h2,h3,h4,p,figure,div,blockquote { margin:0; padding:0; }
ul,li { margin:0; padding:0; list-style:none; }
img { border:0; max-width:100%; vertical-align:middle; }
button { font-family: inherit; }
.t-rec { position: relative; }
.t-container { max-width:1200px; margin:0 auto; }
.t-container_100 { width:100%; }
.t-text { font-family:'Arial'; font-size:18px; line-height:1.55; }
.t-title { font-family:'Arial'; font-weight:700; }
"""

page = ("<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        "<title>Пушкин. Живой</title>" + head +
        "<style>" + TILDA + "</style>"      # стили Tilda идут ПЕРЕД нашими
        "<style>" + css + "</style></head>"
        "<body><div id='allrecords' class='t-records'>"
        "<div class='t-rec' id='rec100'><div class='t123'>"
        "<div class='t-container_100'>" + body + "</div></div></div>"
        "</div>" + foot + "</body></html>")

page = re.sub(r'https://cdn\.jsdelivr\.net/gh/\S*?/landing/img/', '../img/', page)
page = re.sub(r'https://cdn\.jsdelivr\.net/gh/\S*?/landing/fonts/', '../fonts/', page)
(R/'_test_tilda.html').write_text(page, encoding='utf-8')
print('_test_tilda.html собран')
