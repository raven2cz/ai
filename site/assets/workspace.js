/* ═══════════════════════════════════════════════════════════
   Unified Code Workspace
   Hydrates every <div class="workspace" data-manifest="..."></div>
   in the page. Lazy-loads files via fetch() relative to the
   manifest URL.
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const LANG_MAP = {
    html: "html", htm: "html",
    css: "css", scss: "scss",
    js: "javascript", mjs: "javascript", cjs: "javascript",
    ts: "typescript", tsx: "typescript",
    jsx: "javascript",
    json: "json", jsonc: "json",
    md: "markdown", markdown: "markdown",
    sh: "bash", bash: "bash", zsh: "bash",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    c: "c", h: "c",
    cpp: "cpp", cc: "cpp", hpp: "cpp",
    cs: "csharp",
    php: "php",
    yml: "yaml", yaml: "yaml",
    toml: "toml",
    xml: "xml", svg: "xml", html5: "html",
    sql: "sql",
    dockerfile: "dockerfile",
    ini: "ini", cfg: "ini",
  };

  const TEXT_EXT = new Set([
    "html", "htm", "css", "scss", "js", "mjs", "cjs", "jsx", "ts", "tsx",
    "json", "jsonc", "md", "markdown", "txt", "sh", "bash", "zsh", "py",
    "rb", "go", "rs", "java", "kt", "c", "h", "cpp", "cc", "hpp", "cs",
    "php", "yml", "yaml", "toml", "xml", "svg", "sql", "ini", "cfg",
    "env", "gitignore", "editorconfig", "conf",
  ]);

  function extOf(name) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
  }

  function langOf(name) {
    const ext = extOf(name);
    if (LANG_MAP[ext]) return LANG_MAP[ext];
    if (/dockerfile$/i.test(name)) return "dockerfile";
    if (/makefile$/i.test(name)) return "makefile";
    return "plaintext";
  }

  function isTextFile(name) {
    const ext = extOf(name);
    if (TEXT_EXT.has(ext)) return true;
    if (/^(dockerfile|makefile|license|readme|changelog)(\..*)?$/i.test(name)) return true;
    return false;
  }

  // ── icons (inline SVG, 14px) ─────────────────────────────
  const ICON_FOLDER = '<svg class="workspace-tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
  const ICON_FILE   = '<svg class="workspace-tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
  const ICON_CODE   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>';
  const ICON_EYE    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';

  // ── tree building ────────────────────────────────────────
  // manifest.files is a flat list of relative file paths ("a/b/c.css")
  // We build a nested tree from it.
  function buildTree(files) {
    const root = { name: "", type: "folder", children: {} };
    for (const path of files) {
      const parts = path.split("/");
      let node = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          node.children[part] = { name: part, type: "file", path };
        } else {
          if (!node.children[part]) {
            node.children[part] = { name: part, type: "folder", children: {} };
          }
          node = node.children[part];
        }
      }
    }
    return root;
  }

  function sortNodes(obj) {
    return Object.values(obj).sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  function renderTree(node, depth = 0) {
    if (node.type === "file") {
      return `<li>
        <div class="workspace-tree-file" data-file="${escapeAttr(node.path)}" style="padding-left:${depth * 14 + 16}px">
          <span class="workspace-tree-caret" style="visibility:hidden">▾</span>
          ${ICON_FILE}
          <span>${escapeHtml(node.name)}</span>
        </div>
      </li>`;
    }
    const children = sortNodes(node.children)
      .map((c) => renderTree(c, depth + 1))
      .join("");
    if (depth === 0) {
      return `<ul>${children}</ul>`;
    }
    return `<li>
      <div class="workspace-tree-folder" style="padding-left:${(depth - 1) * 14 + 16}px">
        <span class="workspace-tree-caret">▾</span>
        ${ICON_FOLDER}
        <span>${escapeHtml(node.name)}</span>
      </div>
      <ul>${children}</ul>
    </li>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ── workspace instance ───────────────────────────────────
  async function hydrate(root) {
    const manifestUrl = root.dataset.manifest;
    if (!manifestUrl) {
      root.innerHTML = '<div class="workspace-placeholder">No manifest.</div>';
      return;
    }
    const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1);

    let manifest;
    try {
      const res = await fetch(manifestUrl, { cache: "no-cache" });
      manifest = await res.json();
    } catch (e) {
      root.innerHTML = `<div class="workspace-placeholder">Failed to load manifest: ${escapeHtml(e.message)}</div>`;
      return;
    }

    const files = manifest.files || [];
    const hasPreview = !!manifest.preview;
    const previewFile = manifest.preview_file || "index.html";
    const title = manifest.title || "Code";

    if (files.length === 0) {
      root.innerHTML = '<div class="workspace-placeholder">Empty workspace.</div>';
      return;
    }

    const tree = buildTree(files);
    const treeHtml = renderTree(tree, 0);

    // Choose initial file: prefer index.html, else first text file, else first
    let initialFile =
      files.find((f) => f === previewFile) ||
      files.find((f) => isTextFile(f)) ||
      files[0];

    root.innerHTML = `
      <div class="workspace-tabs">
        ${hasPreview ? `<button class="workspace-tab ${hasPreview ? "active" : ""}" data-pane="preview">${ICON_EYE}<span>Preview</span></button>` : ""}
        <button class="workspace-tab ${hasPreview ? "" : "active"}" data-pane="code">${ICON_CODE}<span>Code</span></button>
        <span class="workspace-tab-spacer"></span>
        <span class="workspace-tab-meta">${files.length} file${files.length === 1 ? "" : "s"}</span>
      </div>
      ${hasPreview ? `
        <div class="workspace-pane workspace-preview active" data-pane="preview">
          <iframe src="${escapeAttr(baseUrl + previewFile)}" loading="lazy" title="${escapeAttr(title)} preview"></iframe>
        </div>` : ""}
      <div class="workspace-pane workspace-code ${hasPreview ? "" : "active"}" data-pane="code">
        <aside class="workspace-tree">
          <div class="workspace-tree-title">Files</div>
          ${treeHtml}
        </aside>
        <div class="workspace-view">
          <div class="workspace-view-header">
            <span class="workspace-view-path">—</span>
            <span class="workspace-view-lang">—</span>
            <button class="workspace-copy" type="button">Copy</button>
          </div>
          <div class="workspace-code-body">
            <div class="workspace-loading">Select a file…</div>
          </div>
        </div>
      </div>
    `;

    // tab switching
    root.querySelectorAll(".workspace-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.pane;
        root.querySelectorAll(".workspace-tab").forEach((t) => t.classList.toggle("active", t === tab));
        root.querySelectorAll(".workspace-pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === target));
      });
    });

    // folder collapse
    root.querySelectorAll(".workspace-tree-folder").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.classList.toggle("collapsed");
      });
    });

    // file clicks
    const fileEls = root.querySelectorAll(".workspace-tree-file");
    fileEls.forEach((el) => {
      el.addEventListener("click", () => {
        const path = el.dataset.file;
        loadFile(path, el);
      });
    });

    // copy button
    const copyBtn = root.querySelector(".workspace-copy");
    copyBtn.addEventListener("click", async () => {
      const codeEl = root.querySelector(".workspace-code-body code");
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        copyBtn.classList.add("copied");
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.textContent = "Copy";
        }, 1400);
      } catch (e) {
        copyBtn.textContent = "Copy failed";
      }
    });

    async function loadFile(path, el) {
      root.querySelectorAll(".workspace-tree-file").forEach((f) => f.classList.toggle("active", f === el));
      const header = root.querySelector(".workspace-view-header");
      const pathEl = root.querySelector(".workspace-view-path");
      const langEl = root.querySelector(".workspace-view-lang");
      const body = root.querySelector(".workspace-code-body");

      pathEl.textContent = path;
      const lang = langOf(path);
      langEl.textContent = lang;

      if (!isTextFile(path)) {
        body.innerHTML = `<div class="workspace-placeholder">Binary file — preview not supported.<br><a href="${escapeAttr(baseUrl + path)}" download style="color:var(--ws-accent);margin-top:8px;display:inline-block;">Download file</a></div>`;
        return;
      }

      body.innerHTML = '<div class="workspace-loading">Loading…</div>';

      try {
        const res = await fetch(baseUrl + path, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        body.innerHTML = `<pre><code class="language-${lang}"></code></pre>`;
        const codeEl = body.querySelector("code");
        codeEl.textContent = text;
        if (window.hljs) {
          try { window.hljs.highlightElement(codeEl); } catch (e) {}
        }
      } catch (e) {
        body.innerHTML = `<div class="workspace-placeholder">Failed to load file: ${escapeHtml(e.message)}</div>`;
      }
    }

    // auto-load initial file + auto-expand its parents
    if (initialFile) {
      const startEl = Array.from(fileEls).find((f) => f.dataset.file === initialFile);
      if (startEl) {
        loadFile(initialFile, startEl);
      }
    }
  }

  function init() {
    document.querySelectorAll(".workspace[data-manifest]").forEach(hydrate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // expose for manually-added workspaces
  window.AIPlaygroundWorkspace = { hydrate, init };
})();
