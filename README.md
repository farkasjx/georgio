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
deploy. A JS (`app.js`, `content-graph-data.js`) nem változik, ha csak tartalmat írsz.

## Mappaszerkezet

```
content/                    TARTALOM — teljesen portable, semmilyen build-kódtól nem függ
  hu/                       Magyar tartalom — EZT szerkeszted (elsődleges nyelv)
    *.md                    egy fájl = egy oldal
    glossary.json           automatikus linkelés szótára (magyar célok)
  en/                       Angol tartalom (ugyanazok a fájlnevek, mint a hu/-ban)
    *.md
    glossary.json           automatikus linkelés szótára (angol célok)

assets/                     Kézzel karbantartott, típus szerint különválasztva — EZT szerkeszted
  css/                      style.css, theme-light.css, search.css
  js/                       app.js, content-graph-data.js, search.js
  images/                   a .md fájlokban __IMG__/fajlnev.jpg formában hivatkozott képek

engine/                     Az ÚJRAFELHASZNÁLHATÓ markdown → HTML motor.
                            Content-agnosztikus: nem tud a PAGE_ORDER-ről, a nyelvekről vagy
                            a HTML-sablonról. Ha csak a .md feldolgozást akarod átvinni egy
                            másik projektbe, ELÉG EZT AZ EGY MAPPÁT átmásolni.
  index.js                  belépési pont — innen importálj (lásd fejléce)
  markdown.js               markdown-it motor + a highlight.js CSS
  containers.js             a ::: blokkok definíciói (section, callout, compare, tech…)
  render-page.js            egy .md fájl → HTML oldal (imageBaseUrl paraméterrel!)
  sidebar.js                a nav="..." elemek csoportosítása sidebar-szekciókká
  autolink.js                glossary.json-alapú automatikus kereszthivatkozás
  search-index.js           kereshető index a renderelt HTML-ekből

site/                       A SITE-SPECIFIKUS rész — ez NEM vihető át más projektbe
  build.js                  PAGE_ORDER, LOCALES, a teljes HTML-sablon; az engine/-t hívja
  map-page.js               az interaktív kapcsolati térkép HTML-váza (nyelvesítve, ui paramétert kap)
  serve.js                  fejlesztői statikus szerver

public/                     TELJESEN GENERÁLT — .gitignore-olva, ne szerkeszd kézzel,
                            bármikor törölhető, az `npm run build` újra előállítja
  index.html                magyar (alapértelmezett, gyökér)
  en/index.html             angol
  assets/                   a build ide másolja az assets/css + assets/js tartalmát,
                            az assets/images/ almappát, és a highlight.css-t
```

**Miért ez a szétválasztás?**
- A `content/` fájlokban **semmi projekt-specifikus útvonal nincs** (lásd lejjebb a képeknél) — ha átmásolod egy másik markdown-alapú projektbe, a tartalom önmagában is értelmes marad.
- Az `engine/` a feldolgozó logika, de nem tudja, *milyen* oldalak vannak, *milyen* nyelveken, vagy *hogyan* néz ki a HTML-sablon — ezt mind a `site/build.js` adja meg paraméterként/hívóként. Így az `engine/` mappa egy az egyben átvihető egy másik projektbe is.
- A `public/` mappa a build kimenete — ha bárki törli és újrafuttatja a buildet (pl. egy friss `git clone` után), mindennek onnan kell újra elő tudnia állnia. Az `assets/` és a `content/` a forrás, ezeket commitolod; a `public/` a `.gitignore`-ban van, a GitHub Actions minden buildnél frissen állítja elő.

## Képek: `__IMG__` placeholder

A markdown fájlokban **soha ne** írj konkrét relatív útvonalat egy képhez (pl. `assets/kep.jpg`) — ez az adott projekt mappaszerkezetéhez kötné a tartalmat. Helyette:

```markdown
![Alt szöveg](__IMG__/kv-01-mechanism.jpg)
```

A build (`site/build.js`) locale-onként adja meg, mire cserélődjön az `__IMG__` (lásd `imageBaseUrl` — jelenleg `assets/images` a magyar, `../assets/images` az angol változatnál, mert az utóbbi egy almappában van). Ha ezt a projektet egy másik struktúrába viszed át, csak ezt az egy `imageBaseUrl` paramétert kell máshogy megadni — a `.md` fájlokhoz és a képekhez nem kell hozzányúlni.

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

1. Hozz létre `content/hu/<kulcs>.md`-t (és `content/en/<kulcs>.md`-t, akár csak "még nincs lefordítva" jelzéssel) frontmatterrel.
2. Vedd fel a `site/build.js` tetején a `PAGE_ORDER` tömbbe:
   `{ key: '<kulcs>', label: 'Topbar felirat', labelEn: 'Topbar label', dot: '#szín' }`.
   Ez teszi be a dropdownba, a sidebarba és a keresésbe.
3. Ha szeretnéd, hogy a kezdőoldali kapcsolati térképen is megjelenjen csomópontként, vedd fel az
   `assets/js/content-graph-data.js`-ben a `graphNodes` tömbbe (`id` = ugyanaz a `<kulcs>`), és
   kösd be a `graphEdges`-be a releváns kapcsolódó témákhoz.
4. `npm run build`.

## Migrációs állapot

A legtöbb oldal (pl. `prompting.md`, `ollama.md`, `aiconfig.md`, `security.md`, `mcp.md`, `hallucination.md` stb.) **teljesen Markdown-blokkokra** van bontva (`:::` szintaxis) — ezek a referencia-oldalak, itt látod, hogyan néz ki minden blokk-típus a gyakorlatban.

A `tools.md` szándékosan `::: raw` blokkban tartja az eredeti HTML-t: a nagy összehasonlító táblák cellánként sok inline HTML-t (badge, tool-name, small) tartalmaznak; Markdown-táblában ez törékenyebb és nem olvashatóbb lenne. A cellák szövegét a raw HTML-ben szerkeszted.

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

## Új funkciók

### Sötét / világos mód

A topbar jobb oldalán lévő nap/hold gomb vált. A választás `localStorage`-ba mentődik, alapból a böngésző/rendszer beállítását követi. A világos paletta az `assets/css/theme-light.css`-ben él — ha egy elem nem a `style.css` CSS-változóit használja (konkrét hex-szín), azt itt kell felülírni `[data-theme="light"]` alatt.

### Keresés (Ctrl+K)

A build minden section szövegét kigyűjti egy kereshető indexbe (`window.__SEARCH__`, inline a HTML-ben), amit az `assets/js/search.js` kliens-oldalon pontoz és jelenít meg. Nincs külön build lépés hozzá — automatikusan frissül minden `npm run build`-nél, a raw-blokkos oldalak tartalma is bekerül.

### Automatikus fogalom-linkelés

A `content/<locale>/glossary.json` fájlban definiált fogalmak (pl. "RAG", "OWASP") **első előfordulása** az egész oldalon (nem csak egy lapon belül) automatikusan linkké válik a megadott célra. Egy fogalom csak egyszer, sitewide linkelődik; a saját célszekciójában lévő említés nem linkelődik önmagára.

Új fogalom hozzáadása:
```json
"ChromaDB": { "page": "security", "id": "sec-rag" }
```
Ha a kifejezésnek több írásmódja is van, add meg `variants` tömbként:
```json
"prompt injection": { "page": "security", "id": "sec-jailbreak", "variants": ["prompt injectiont"] }
```

**Előnézeti kártya (hover/tap).** Az így linkelt kifejezések nem navigálnak azonnal — hover (desktop) vagy tap (mobil) esetén egy kis kártya jelenik meg a céltéma rövid leírásával (ugyanaz a `short` szöveg, amit a kezdőoldali kapcsolati térkép is használ, lásd `assets/js/content-graph-data.js`), és csak a kártyán belüli "Teljes cikk megnyitása →" gombra kattintva navigál el ténylegesen a másik oldal adott szekciójához. Ez azért van, hogy egy előfeltétel-fogalom gyors felidézéséhez ne kelljen elhagyni az éppen olvasott cikket. A logika az `assets/js/app.js`-ben él (`initTermPreviews`), az auto-linkek pedig `data-goto-page`/`data-goto-id` attribútumokat kapnak `onclick` helyett (lásd `engine/autolink.js`).

### Nyelvesítés (HU / EN)

A tartalom `content/hu/` és `content/en/` almappákban él. A build **mindkét nyelvet lebuildeli**: a magyar a `public/index.html`-be (gyökér), az angol a `public/en/index.html`-be. Az `assets/` (CSS, JS) közös, nem duplikálódik.

A topbarban lévő HU/EN gomb átvált a másik nyelvre, **megőrizve az aktuális oldal/section hash-t**.

Jelenleg csak a `prompting` oldal van teljesen lefordítva angolra — ez a referencia. A többi oldal angol verziója egy rövid, professzionális „még nincs lefordítva" jelzés a `content/en/<oldal>.md`-ben, ami visszalinkel a magyar verzióra. Egy oldal lefordításához:

1. Írd meg a `content/en/<oldal>.md`-t (ugyanazokkal a section-id-kkal, mint a magyar verzióban — ez teszi lehetővé, hogy a keresés és a linkek konzisztensek maradjanak).
2. Ha a fogalom-szótárban a lefordított oldalra mutató új angol kifejezéseket akarsz, vedd fel a `content/en/glossary.json`-be.
3. `npm run build` — mindkét nyelv újragenerálódik.

A `PAGE_ORDER` tömb (`site/build.js`) minden oldalhoz tartalmaz `label` (magyar) és `labelEn` (angol) topbar-feliratot — új oldalnál mindkettőt add meg.

Az interaktív kapcsolati térkép (`site/map-page.js` + `assets/js/content-graph-data.js`) is teljesen nyelvesítve van: a csomópontok szövege (cím, rövid leírás, panel-szöveg) és a térkép körüli UI-feliratok (zoom, szűrők, hint) egyaránt HU/EN szerint jelennek meg, a `window.__LOCALE__` alapján (ezt a `site/build.js` írja be locale-onként). Új nyelv hozzáadásához a `graphText` objektumot (`content-graph-data.js`) és a `LOCALES[].ui.map*` kulcsokat (`site/build.js`) kell bővíteni.
