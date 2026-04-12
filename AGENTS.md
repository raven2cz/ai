# Agent Instructions & Data Contracts

This document describes how humans and AI agents add content to the AI Playground.

## Process

1. **New request** — a user opens a GitHub issue (for a challenge) or drops an HTML article source (for an essay series).
2. **Ingestion** — an agent creates the corresponding folder under `data/`.
3. **Authoring** — challenges get prompts and sessions; articles get `article.html` + `meta.json`.
4. **Build** — `python3 scripts/build.py` regenerates `site/` from `data/`.
5. **Deploy** — pushed to `main`; GitHub Pages publishes the result.

---

## 🗂 Challenges — `data/challenges/<slug>/`

Every challenge lives in its own folder, e.g. `data/challenges/01-center-a-div-issue/`:

```text
data/challenges/<id-slug>/
├── problem.md           # problem statement (see format below)
├── session-user.md      # the conversation that failed
├── solution-user/       # code that came out of the failed session
│   └── index.html       # (rendered as an iframe if index.html exists)
│
├── session-expert.md    # the conversation that worked
└── solution-expert/     # working code
    ├── index.html
    └── style.css
```

### `problem.md` format

```markdown
# Problem title

Short description of what the user tried and why it didn't work.

## Expected result
What the output should look / behave like.
```

### Session format

Write sessions as plain Markdown alternating speakers — the build script parses `**User:**` and `**Assistant:**` paragraphs into chat bubbles:

```markdown
**User:**
The failed prompt text.

**Assistant:**
The flawed response.
```

### Solution folders

- If the folder contains `index.html`, the build embeds it as an iframe.
- Otherwise every file is rendered as a syntax-highlighted code block.

---

## 📝 Articles — `data/articles/<series>/<slug>/`

Essays are grouped into **series**. One series directory contains the manifest plus one folder per article:

```text
data/articles/<series-slug>/
├── series.json                  # series manifest
├── <part-1-slug>/
│   ├── meta.json
│   └── article.html             # self-contained page (its own CSS/JS)
└── <part-2-slug>/
    ├── meta.json
    └── article.html
```

### `series.json`

```json
{
  "slug": "series-ai-effectively",
  "title": "AI Effectively: A Systems Approach",
  "description": "One-paragraph pitch shown on the landing page.",
  "order": ["01-systemic-approach", "02-from-stone-to-sculpture"]
}
```

### `meta.json`

```json
{
  "slug": "01-systemic-approach",
  "part": 1,
  "title": "The Systemic Approach",
  "subtitle": "AI as a cybernetic regulation loop",
  "source_lang": "cs",
  "translated": true,
  "translator": "claude-sonnet-4-6",
  "translated_at": "2026-04-12"
}
```

### `article.html`

A **self-contained HTML document** with its own `<head>`, styles, and scripts — the build script preserves the article's visual identity. The build automatically injects a sticky **series switcher** bar at the top of the `<body>` (Back link, series title, Part N chips) using the article's own CSS variables (`--bg1`, `--bg3`, `--fg`, `--green`, etc.), so the switcher blends with the article's palette.

### Translation workflow

Articles with `source_lang != "en"` should be translated by a Sonnet subagent before being committed. Translation rules:

- Translate visible text only: headings, paragraphs, list items, `<title>`, `<meta description>`, `alt`, `title`, `aria-*`, and SVG `<text>` / `<tspan>`.
- Preserve all class names, ids, CSS, JS, and external URLs.
- Remap Czech-slug anchor ids to English kebab-case (`id="pamet"` → `id="memory"`) and update **every** matching `href="#..."` (and any `getElementById(...)` call) consistently.
- Set `lang="en"` on `<html>`.
- Update `meta.json`: `translated: true`, plus `translator` and `translated_at`.

---

## Adding a new GitHub-issue challenge

When asked *"Ingest issue #ID"*:

1. Pull issue content via `gh issue view ID`.
2. Create `data/challenges/<ID>-<slug>/`.
3. Write `problem.md` (title + description + expected result).
4. If the issue contains a failed session, save it as `session-user.md`.
5. If the issue contains code output, save it under `solution-user/`.
6. Ask the user to co-author `session-expert.md`.
