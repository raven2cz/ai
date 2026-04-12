**User:**
I need to center a box on the page — horizontally **and** vertically — so that it stays centered at any viewport size. Inside: a heading "Hello world" and a short subtitle. Constraints:

- Use **CSS Grid** on the body (no margin hacks, no flexbox on the outer wrapper).
- Dark, modern palette — not plain white.
- A soft, subtle shadow that implies depth without looking heavy.
- Responsive: on small screens the box should not overflow; use a sensible max-width.
- Pleasant typography (system font stack is fine, but set a readable line-height).
- Include a full, self-contained HTML file I can drop straight into a browser.

**Assistant:**
Got it. Three ideas I'll apply explicitly, so you can spot them in the code:

1. **`display: grid; place-items: center;` on `<body>`** — the cleanest native way to center a single child both axes. `place-items` is shorthand for `align-items` + `justify-items`, so one line handles both directions.
2. **`html, body { height: 100% }`** — without this, the body collapses to the height of its content and "vertical center" has nothing to center *in*. Many "margin auto doesn't work" bugs come from skipping this.
3. **`width: min(420px, 100%)`** — modern responsive trick: caps the card at 420px on desktop but lets it shrink on phones without ever overflowing. Cleaner than a media query.

For the visuals:

- A dark slate palette (`#0f172a` background, `#1e293b` card) with a cyan accent.
- A radial gradient on the background so the page doesn't feel flat.
- A two-layer shadow: a tight 1px inner line for the edge, plus a large colored glow (`rgba(56,189,248,0.18)`) for depth without the heavy look of a harsh drop shadow.

Here is the complete file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Centered card</title>
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --accent: #38bdf8;
            --text: #e2e8f0;
            --muted: #94a3b8;
            --border: #334155;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
            background: radial-gradient(circle at 30% 20%, #1e293b, var(--bg) 70%);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: var(--text);
            display: grid;
            place-items: center;
            padding: 24px;
        }
        .card {
            width: min(420px, 100%);
            background: var(--card);
            padding: 40px 36px;
            border-radius: 16px;
            text-align: center;
            border: 1px solid var(--border);
            box-shadow:
                0 1px 2px rgba(0, 0, 0, 0.4),
                0 24px 60px -12px rgba(56, 189, 248, 0.18);
        }
        .card h2 {
            font-size: 1.6rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--accent);
            margin-bottom: 10px;
        }
        .card p {
            color: var(--muted);
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <main class="card">
        <h2>Hello world</h2>
        <p>Precisely centered with CSS Grid — horizontally and vertically, at any viewport size.</p>
    </main>
</body>
</html>
```

**User:**
Why does `margin: 50% auto` break here but `place-items: center` works? I want to understand the mechanism, not just copy the fix.

**Assistant:**
Good question — the failure mode is worth internalizing.

`margin: 50% auto` does two different things on each axis:

- **Horizontal (`auto`)** — works as expected: left/right margins are distributed equally, so the block centers.
- **Vertical (`50%`)** — here's the trap: **percentage margins resolve against the *width* of the containing block, not its height** (it is a historical CSS quirk). So `margin-top: 50%` becomes "half the viewport's width", which is why the box jumps around when you resize and why it never actually lands on the vertical midpoint.

Even if vertical percentages *did* resolve against height, you'd still need `body` to have a defined height — by default the body only grows to fit its content, so "50% of body height" would effectively be "50% of the card's own height". That is why centering hacks that "mostly work" break the moment the content changes.

`display: grid; place-items: center` sidesteps both problems:

- It defines the body as a grid container with one cell that fills its area.
- It aligns the child to the center of *that cell*, using layout logic — no percentage-vs-width trickery.
- Combined with `html, body { height: 100% }`, the cell truly spans the viewport, so "center" means what you'd expect.

The takeaway: for centering a block in a viewport, always prefer a layout method (`grid` or `flex`) over margin arithmetic. It is shorter, it is correct at every size, and it stays correct when content changes.
