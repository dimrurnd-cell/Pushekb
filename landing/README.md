# «Пушкин. Живой» — лендинг

Макет лендинга мультимедийной выставки.
Екатеринбург · Свердловская киностудия · 5 октября — 29 ноября 2026.
Организатор — Креативная студия R·ART.

Дизайн-канвас (три артборда, редактируется мышкой):
https://claude.ai/code/artifact/9ca2a8cf-37e0-497d-a3f8-750f01ee5b96

## Артборды

| Файл | Что это | Размер |
|---|---|---|
| `Main.dc.html` | Основной лендинг, десктоп | 1440 × 8704 |
| `Mobile.dc.html` | Мобильная версия | 390 × 6181 |

Выбран светлый первый экран с текстом из тёмной версии; тёмный вариант убран.

**Код для боевого сайта на Tilda — в папке [`tilda/`](tilda/), он же основной.**
Артборды дизайн-канваса остались на более ранней версии: в коде для Tilda
с тех пор добавлены блоки «О выставке», «Шедевры в фильме», «Расписание»
и «Билеты», убран зернистый фон и вставлено ожившее фото.
Картинки и шрифты раздаются через jsDelivr прямо из этого репозитория.

`canvas.json` — раскладка артбордов на канвасе и заметки.

## Типографика

| Роль | Шрифт | Где |
|---|---|---|
| Заголовки | **TrooverRoman** (`TOO.TTF`) — дидон, ровесник эпохи | H1, H2, названия эпизодов |
| Рукопись | **Monplesir script** | «Живой», цитаты, финальная строка, фоновые строки стихов |
| Текст и интерфейс | **Akrobat** (Light / Regular / SemiBold / Black) | абзацы, навигация, надзаголовки |
| Даты и цифры | **Helvetica Inserat LT Pro** | «5 октября — 29 ноября 2026», 40 / 3 / 10 / 100+, цены |

Шрифты в `fonts/` — подмножества (кириллица + латиница + пунктуация) в woff2,
вшиваются в артборды как data-URI при сборке.

## Палитра

| | |
|---|---|
| Пергамент | `#efe6d4`, плотнее `#e5d9bf` |
| Чернила | `#1b1611`, текст `#4a4034` |
| Тёмный зал | `#14120f`, `#1d1a15` |
| Золото (акцент) | `#b3842f`, на тёмном `#cb9e48` |

Акцент вынесен в тюнер `accent` — меняется на канвасе одним кликом
и подхватывается везде.

## Оживление фото (Hugging Face)

Оживлено моделью **Wan 2.2 I2V** через Space
[`zerogpu-aoti/wan2-2-fp8da-aoti-faster`](https://huggingface.co/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster).

1. **Портрет Пушкина** (`Пушкин.jpg`) — дышит, моргает, рукописные листы летят.
   `https://d2ol7oe51mr4n9.cloudfront.net/user_3IomiYrQuWHDjUMF8hmz5n7cE7n/ab4a0077-dfed-4b51-9a07-2ba27a5573d4.mp4`
   Промпт: *The young poet in the black top hat comes alive: he breathes slowly,
   his chest rises, he blinks, his eyelashes tremble, his curly hair stirs faintly
   in the air. The handwritten manuscript pages around him flutter and drift slowly
   through the frame. Very slow subtle cinematic camera push-in. Soft warm painterly
   light, photorealistic, 19th century portrait, gentle natural motion, no cuts.*

2. **Осенняя набережная** (`ChatGPT Image … 17_58_27.png`) — листья падают,
   вода рябит, дрожит пламя фонаря.
   `https://d2ol7oe51mr4n9.cloudfront.net/user_3IomiYrQuWHDjUMF8hmz5n7cE7n/77e6834b-917b-483a-aefb-503a7e3e76c3.mp4`
   Промпт: *Autumn Saint Petersburg embankment comes alive: golden maple leaves
   drift and fall slowly through the air, the river water ripples and the sunset
   reflection shimmers on it, the gas lamp flame flickers softly, the manuscript
   pages on the granite parapet lift slightly in the breeze, clouds move very slowly
   across the sky. Cinematic slow motion, warm golden hour light, photorealistic,
   gentle continuous camera drift forward.*

Настройки: `duration_seconds 3.5`, `steps 6`, `guidance_scale 1`.

На сайте эти ролики ставятся вместо статичных картинок:
`<video autoplay muted loop playsinline poster="…">`. По просьбе заказчика
нигде на странице не написано, что изображения оживлены нейросетью.

## Заглушки

Всё в `[КВАДРАТНЫХ СКОБКАХ]` нужно заполнить фактическими данными:
`[АДРЕС ПЛОЩАДКИ]`, `[РАСПИСАНИЕ СЕАНСОВ]`, `[ЦЕНА]`, `[ЛЬГОТНАЯ ЦЕНА]`,
`[ТЕЛЕФОН ДЛЯ ГРУПП]`, `[ТЕЛЕФОН]`, `[E-MAIL]`, `[СОЦСЕТИ]`, `[ИМЕНА АРТИСТОВ]`.

Имена артистов намеренно не проставлены: в сценарии Марк Васёв и Екатерина
Опарина указаны как предварительные, до кастинга.

## Сборка

```bash
python3 build.py                 # src/*.tpl.html + fonts/ -> *.dc.html
python3 preview.py Main.dc.html  # обычная HTML-страница для скриншота
python3 shot.py                  # скриншоты всех трёх артбордов
```

Пересобрать канвас после правок:

```bash
node <путь-к-скиллу>/seed-canvas.mjs \
  --template <путь-к-скиллу>/payload.template.html \
  --out pushkin-zhivoy-landing.html --title "Пушкин. Живой — лендинг" \
  --artboard Main.dc.html --artboard HeroNight.dc.html --artboard Mobile.dc.html \
  --canvas canvas.json $(for f in img/*.jpg; do printf -- "--image %s " "$f"; done)
```

## Источники

Тексты, цитаты и структура эпизодов — из сценария фильма
(`Пушкин_сценарий_части/`). Кадры зала — проекты R·ART (`Зал/`).
Картины — Беггров, Белюкин, де Местр, Иткин и др. из корневой папки и `photos/`.
