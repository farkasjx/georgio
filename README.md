# AI Hub — Markdown-alapú statikus oldal

A tartalom `content/*.md` fájlokban él. Egy build lépés legenerálja belőlük a
kész `public/index.html`-t. A böngésző tisztán statikus HTML-t kap — semmit nem
tud arról, hogy a forrás Markdown volt. Nincs backend, nincs runtime-parse.

## Gyors kezdés

```bash
npm install          # egyszer, a függőségekhez
npm run build        # content/*.md  ->  public/index.html
npm run watch        # figyeli a content/ mappát, minden mentésnél újrabuildel
npm run serve        # http://localhost:4321 (fejlesztéshez; élesben Caddy szolgálja ki)
```

Szerkesztés menete: átírsz egy `.md` fájlt → `npm run build` (vagy fut a `watch`) →
deploy. A JS (`app.js`, `roadmap-data.js`) nem változik, ha csak tartalmat írsz.

## Mappaszerkezet

```
content/            A tartalom — EZT szerkeszted
  roadmap.md
  tools.md
  prompting.md      ← teljesen migrált referencia-oldal (minden blokk-típus)
  ollama.md
  aiconfig.md
  security.md
scripts/
  build.js          fő build (MD -> index.html + sidebar-adat)
  containers.js     a ::: blokkok definíciói (section, callout, compare, tech…)
  map-page.html     az interaktív térkép fix HTML-váza (nem MD)
  serve.js          fejlesztői statikus szerver
public/             GENERÁLT — ezt szolgálja ki Caddy, ne szerkeszd kézzel
  index.html
  assets/
    style.css       az eredeti stílus (érintetlen)
    highlight.css   syntax-highlight paletta (build generálja)
    app.js          navigáció + térkép logika
    roadmap-data.js a térkép csomópont-adatai (külön adatfájl)
```

## Egy MD-oldal felépítése

Minden oldal egy `.md` fájl. A tetején **frontmatter** (YAML) adja a metaadatot,
alatta a tartalom Markdownban, `:::` blokkokkal tagolva.

```markdown
---
page: prompting
title: Prompt Engineering
sidebar_groups: [Témák, Technikák]   # a sidebar-csoportok sorrendje
---

:::::: section id=p-context num=01 nav="Context window" group="Témák"
## Cím

Sima markdown szöveg, **félkövér**, _dőlt_, listák, táblázat, `inline kód`…
::::::
```

A `section` a fő tartalmi blokk. Ha van `nav=` attribútuma, **automatikusan
bekerül a bal oldali sidebarba** — nincs külön navigációt karbantartani, a
tartalom a forrás. A `group=` mondja meg, melyik sidebar-csoportba.

## Blokk-típusok

Minden blokk a meglévő CSS-osztályokra képződik, tehát stílus-kompatibilis.

| Blokk | Írásmód | Eredmény |
|-------|---------|----------|
| Szekció | `::: section id=… num=01 nav="…" group="…"` | `<section class="topic">` + topic-marker |
| Szekció (szint-fejléc) | `::: section id=… heading="0. szint — …" nav="…"` | `<div class="section-heading">` fejléc |
| Szekció (topic nélkül) | `::: section notopic id=… …` | `<section>` a "topic" osztály nélkül |
| Callout | `::: callout label="Tipp"` | alap keret |
| Callout (variáns) | `::: callout danger label="…"` | `danger` / `warning` / `success` |
| Kártyarács | `::: stack-grid` | `<div class="stack-grid">` |
| Kártya | `::: card label="🧠 Track 1" color="#c4a0ff"` | `stack-card` |
| Összehasonlítás | `::: compare` + benne `::: bad`/`::: good` (vagy két `::: good`) | két oszlop |
| Technika | `::: tech id=… num=03.01 name="…" nav="…"` | `tech` kártya |
| Nyers HTML | `::: raw` … `:::` | a tartalom érintetlenül átmegy |

A `heading=` attribútum a szintekre/fejlécekre való (ollama), a `num=` a számozott topic-markerre (prompting, security). A `nav=` bármelyikkel megy — az adja a sidebar-linket.

Kódblokk: sima Markdown ```` ```python ````. Az **automatikus syntax highlight**
a nyelvből jön (`python`, `bash`, `yaml`, `json`, `nginx`…). A nem valódi nyelvek
(`prompt`, `attack`, `email`, `text`) tisztán, `data-lang` felirattal jelennek meg.

## FONTOS: beágyazási szabály (kettőspont-szintek)

Ha egy blokk **másik blokkot tartalmaz**, a külső blokk **több kettőspontot**
kap, mint a belső — így a parser sosem téveszti el, melyik záró melyikhez tartozik.
Kívülről befelé csökken:

```markdown
:::::: section …          (6 — legkülső)
  ::::: tech …            (5)
    :::: compare          (4)
      ::: bad label="…"   (3 — legbelső)
      ```
      kód
      ```
      :::
      ::: good label="…"
      ```
      kód
      ```
      :::
    ::::
  :::::
::::::
```

Ökölszabály: **legkülső = 6 kettőspont, és minden szinttel eggyel kevesebb**,
minimum 3. Ha nincs beágyazás, elég a 3 (`:::`). A `content/prompting.md` végig
ezt a konvenciót követi — másold onnan a mintát.

## Új oldal hozzáadása

1. Hozz létre `content/<kulcs>.md`-t frontmatterrel.
2. Vedd fel a `scripts/build.js` tetején a `PAGE_ORDER` tömbbe:
   `{ key: '<kulcs>', label: 'Topbar felirat', dot: '#szín' }`.
3. `npm run build`.

## Migrációs állapot

A `prompting.md`, `ollama.md`, `aiconfig.md` és `security.md` **teljesen Markdown-blokkokra** van bontva (`:::` szintaxis) — ezek a referencia-oldalak, itt látod, hogyan néz ki minden blokk-típus a gyakorlatban.

A `tools.md` és `roadmap.md` szándékosan `::: raw` blokkban tartja az eredeti HTML-t:

- **tools.md** — a nagy összehasonlító táblák cellánként sok inline HTML-t (badge, tool-name, small) tartalmaznak; Markdown-táblában ez törékenyebb és nem olvashatóbb lenne. A cellák szövegét a raw HTML-ben szerkeszted.
- **roadmap.md** — több egyedi vizuális blokkja van (`timeline-bar`, `phase-block` a `--phase-color` változóval, `paper-card`), amik nincsenek a standard blokk-készletben.

Bármelyik raw-oldalt bármikor szétbonthatod `:::` blokkokra a többi mintájára — a raw és a strukturált blokkok együtt élnek, nem kell egyszerre mindent.

## Élesítés (Caddy)

Caddy egyszerűen a `public/` mappát szolgálja ki:

```
aihub.pelda.hu {
    root * /path/to/aihub/public
    file_server
    encode gzip
}
```

A build futhat a gépeden vagy CI-ben; a deploy a `public/` tartalmának feltöltése.
