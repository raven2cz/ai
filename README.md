# AI Playground

Essays, prompt-engineering challenges, and small front-end experiments — built and refined in dialogue with large language models.

The goal is **clear prompts + readable code**, not "vibe coding".

---

## Live site

GitHub Pages: <https://raven2cz.github.io/ai/>

Three sections:

- **Articles** — long-form essay series on working with AI systemically
  (*AI Effectively: A Systems Approach* — Part 1 & Part 2).
- **Challenges** — real prompts that went wrong, then the better conversation that fixed them.
- **Examples** — small, self-contained demos (e.g. analog clock).

---

## Repository layout

```text
ai/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml        # GitHub Pages workflow
├─ data/
│  ├─ articles/<series>/<slug>/  # essay sources (article.html + meta.json)
│  └─ challenges/<slug>/         # challenge sources (problem.md, sessions, solutions)
├─ scripts/
│  └─ build.py                   # builds site/ from data/
├─ site/
│  ├─ index.html                 # landing page (with marker regions for build script)
│  ├─ articles/                  # built articles (one index.html per part)
│  ├─ challenges/                # built challenge pages
│  └─ examples/analog-clock/     # static examples
└─ README.md
```

## Build

```bash
python3 scripts/build.py
```

Reads from `data/`, writes to `site/challenges/`, `site/articles/` and updates
`site/index.html` card lists between marker comments:

- `<!-- ARTICLES:START --> ... <!-- ARTICLES:END -->`
- `<!-- CHALLENGES:START --> ... <!-- CHALLENGES:END -->`
- `<!-- EXAMPLES:START --> ... <!-- EXAMPLES:END -->`

## Data contracts

See [`AGENTS.md`](./AGENTS.md) for how to add challenges and article series.
