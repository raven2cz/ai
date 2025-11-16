# AI Prompt Engineering Playground

Small, focused front-end examples created and refined with the help of AI models.  
The goal is **clear prompts + clean code**, not “vibe coding”.

Each example is self-contained, easy to read and meant as a reference for how to talk to models,
how to structure tasks, and how to iterate.

---

## Live demo

GitHub Pages: <https://raven2cz.github.io/ai/>

Current examples:

- **Analog Clock** – `site/examples/analog-clock/`  
  Smooth analog clock with a black frame, classic black hands and a red second hand,
  animated with `requestAnimationFrame`.

---

## Repository layout

```text
ai/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml   # GitHub Actions workflow for GitHub Pages
├─ site/
│  ├─ index.html            # Landing page listing all examples
│  └─ examples/
│     └─ analog-clock/
│        └─ index.html      # Example: analog clock
└─ README.md
