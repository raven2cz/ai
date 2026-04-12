# Redesign Hand-off for Opus

Tento dokument shromažďuje historické požadavky uživatele a dohodnutý plán redesignu (Soft Dark Theme) pro `AI Prompt Engineering` platformu. Slouží k plynulému předání práce.

## 1. Uživatelovy stížnosti a požadavky (History of Requests)
Uživatel opakovaně kritizoval nasazení designu založeného na "Avatar Engine", který obsahoval nevhodné kontrastní barvy a narušoval zážitek při čtení delších kódů a textů:
- *Problém 1:* "Ten vzhled zářivých fontů a tmavého pozadí je totálně hnusnej, pálí do očí a blbě se to čte."
- *Problém 2:* "Zvýrazňování syntaxe ti taky funguje blbě. (Syntax highlighting je rozbité)."
- *Očekávání:* Design musí být dokonale čitelný, nesmí pálit do očí. Má používat standardní prověřené postupy a barevná "color themes" (ideálně jemnější tlumené barvy - Dimmed). Musí bezvadně fungovat knihovna `highlight.js` s fonty od Google (pro text a kód).

## 2. Dohodnutý Implementation Plan (Soft Dark Theme)
Na základě výše uvedeného vznikl tento schválený plán pro opravu webu (`scripts/build_challenges.py` a generované sady):

### A. Barevná paleta (Soft Dark Theme / Slate Palette)
Namísto čisté černé aplikace (high-contrast mode) bude použit Dimmed Dark motiv (inspirováno GitHub Dimmed nebo Tailwind Slate):
- **Hlavní pozadí (`--obsidian`):** `#0f172a` 
- **Karty a obsah (`--card-bg`):** `#1e293b`
- **Texty:** `#e2e8f0` pro základní text a `#cbd5e1` pro doplňky.
- **Rámečky:** `#334155`

### B. Typografie (Google Fonts)
- **Primary Text:** `Inter` (pro naprostou čistotu) s upraveným line-height (`1.7`).
- **Monospace Code:** `Fira Code` nebo `JetBrains Mono`. Kódové bloky nebudou nerespektovat pravidla knihovny pro zvýraznění barev – z CSS musíme striktně odstranit globální overridy (`!important` na barvách tagu `pre`).

### C. Syntax Highlighting integrace
- Implementovat čistý průchod hljs přes `marked.js` bez vlastních agresivních CSS záplat.
- Použít motiv `github-dark-dimmed.min.css` a obarvit code block pozadí hlubší temnou barvou (např. `#090e17` místo transparentního), tak aby slova perfektně kontrastovala.

### D. Chat Bubbles (JÁ vs AI)
- Zahození gradientů a skleněných okrajů u konverzace.
- **User:** Tmavší, matná modrá pozadí `#1e3a8a` se světle modro-šedým textem `#bfdbfe`.
- **Assistant:** Neutrální šedý blok `#334155` s velmi jemně bílým textem `#f1f5f9`.
- Code tagy uvnitř bublin budou mít pouze lehce modifikované poloprůhledné pozadí (`rgba(0,0,0,0.2)`).

## 3. Rozdělaná Práce a Aktuální Blokátory (Tasks)
Python skript `scripts/build_challenges.py` obdržel modifikovanou CSS šablonu obsahu `CHALLENGE_TEMPLATE` ale při vložení se původní kód potýkal se zablokováním a chybami v regex replacování uvnitř HTML (při updatování `site/index.html`).

- [x] Vytvořit nový Soft Dark Theme draft
- [x] Opravit zamrzající Regulární Výrazy na buildu `site/index.html`.
- [ ] Otestování finálního buildu, ověření přes prohlížeč že skutečně naběhlo tlumené barevné téma, test jestli se rozbily či nerozbily bubliny.
- [ ] Finální code/polishing a commit.

Opusi, přebíráš kormidlo. Tvým úkolem je ověřit, že buildovací skript funguje správně na upraveném UI Themu uvnitř `build_challenges.py` a výsledek vypadá profesionálně podle zadaných bodů výše.
