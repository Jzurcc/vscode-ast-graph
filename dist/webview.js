"use strict";
(() => {
  // src/webview/styles/styles.ts
  var APP_STYLES = `
  :root {
    --bg-primary: var(--vscode-editor-background, #1e1e1e);
    --bg-secondary: var(--vscode-sideBar-background, #252526);
    --bg-surface: var(--vscode-editorWidget-background, #2d2d2d);
    --border-subtle: var(--vscode-panel-border, rgba(128, 128, 128, 0.25));
    --text-primary: var(--vscode-editor-foreground, #cccccc);
    --text-secondary: var(--vscode-descriptionForeground, #858585);
    --accent-cyan: #38bdf8;
    --accent-emerald: #34d399;
    --accent-purple: #a78bfa;
    --accent-amber: #fbbf24;
    --accent-rose: #f472b6;
    --font-mono: var(--vscode-editor-font-family, 'Cascadia Code', 'Fira Code', monospace);
    --font-sans: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    display: block;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    margin: 0; padding: 0;
    font-family: var(--font-sans);
    color: var(--text-primary);
    background-color: var(--bg-primary);
    user-select: none;
    overflow: hidden;
  }

  /* Main Viewport Container */
  #view {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--bg-primary);
  }

  /* Pinned Top Toolbar (Git Graph style) */
  #controls {
    height: 38px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    gap: 10px;
    flex-shrink: 0;
    z-index: 20;
  }

  .controls-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ctrl-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-primary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background 0.15s ease;
  }

  .ctrl-btn:hover {
    background: var(--vscode-toolbar-hoverBackground, rgba(128, 128, 128, 0.2));
  }

  .ctrl-btn.primary {
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #ffffff);
  }

  .ctrl-btn.primary:hover {
    background: var(--vscode-button-hoverBackground, #1177bb);
  }

  .step-counter-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    padding: 0 4px;
    white-space: nowrap;
  }

  /* Breadcrumbs Trail */
  .breadcrumbs-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-secondary);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 320px;
  }

  .breadcrumb-crumb {
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .breadcrumb-sep {
    color: var(--text-secondary);
    opacity: 0.5;
  }

  /* Diagnostic Tab Switcher */
  .tab-switcher {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 2px;
    border: 1px solid var(--border-subtle);
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .tab-btn:hover {
    color: var(--text-primary);
  }

  .tab-btn.active {
    background: var(--bg-surface);
    color: var(--accent-cyan);
  }

  /* Main Tab Content View */
  .tab-viewport {
    flex: 1;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tab-pane {
    display: none;
    width: 100%;
    min-height: 100%;
  }

  .tab-pane.active {
    display: block;
  }

  /* Git Graph Content Stack */
  #content {
    position: relative;
    width: 100%;
    min-height: 100%;
  }

  #commitGraph {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    pointer-events: none;
  }

  #commitGraph circle {
    pointer-events: all;
    cursor: pointer;
  }

  #commitGraph circle.active {
    stroke: #ffffff;
    stroke-width: 2;
    filter: drop-shadow(0 0 6px var(--accent-cyan));
  }

  #commitGraph path.rail {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }

  /* Commit & AST Data Table */
  #commitTable {
    width: 100%;
    z-index: 1;
  }

  #commitTable table {
    width: 100%;
    border-collapse: collapse;
  }

  #commitTable th, #commitTable td {
    padding: 0 8px;
    font-size: 12px;
    line-height: 28px;
    height: 28px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
  }

  #commitTable th {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    line-height: 24px;
    height: 24px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  #commitTable tr.ast-row:hover td {
    background: var(--vscode-list-hoverBackground, rgba(128, 128, 128, 0.1));
  }

  #commitTable tr.ast-row.active-step td {
    background: rgba(56, 189, 248, 0.12);
  }

  #commitTable tr.ast-row.active-step td:first-child {
    border-left: 3px solid var(--accent-cyan);
  }

  /* AST Row Content Styling */
  .outline-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .slot-tag {
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 11px;
    opacity: 0.75;
  }

  .cat-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
  }

  .cat-badge.Stmt, .cat-badge.STMT { background: rgba(129, 140, 248, 0.2); color: #a5b4fc; }
  .cat-badge.Expr, .cat-badge.EXPR { background: rgba(56, 189, 248, 0.2); color: #7dd3fc; }
  .cat-badge.Literal, .cat-badge.LITERAL { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; }
  .cat-badge.Ident, .cat-badge.IDENT { background: rgba(251, 191, 36, 0.2); color: #fde047; }
  .cat-badge.Fn, .cat-badge.FN { background: rgba(192, 132, 252, 0.2); color: #d8b4fe; }
  .cat-badge.Type { background: rgba(45, 212, 191, 0.2); color: #5eead4; }
  .cat-badge.Module { background: rgba(244, 114, 182, 0.2); color: #f472b6; }

  .node-label-text {
    font-family: var(--font-mono);
    color: var(--text-primary);
    font-weight: 500;
  }

  .val-pill {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 1px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    display: inline-block;
  }

  .mutation-text {
    font-family: var(--font-mono);
    color: #fde047;
    font-size: 11px;
  }

  .loc-text {
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 11px;
  }

  /* Inline Details View (#cdv.inline) */
  #commitTable tr.inline-details-row td {
    padding: 12px 18px;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    white-space: normal;
    line-height: 1.5;
    height: auto;
    cursor: default;
  }

  .cdv-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cdv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 6px;
  }

  .cdv-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent-cyan);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cdv-close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 14px;
  }

  .cdv-close-btn:hover { color: var(--text-primary); }

  .cdv-json-box {
    background: #0d1117;
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    max-height: 150px;
    overflow-y: auto;
    color: #94a3b8;
  }

  /* Token Stream Tab */
  .pane-toolbar {
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-pills-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .cat-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    cursor: pointer;
  }

  .cat-pill:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
  .cat-pill.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .matrix-table {
    width: 100%;
    border-collapse: collapse;
  }

  .matrix-table th, .matrix-table td {
    padding: 6px 12px;
    font-size: 12px;
    border-bottom: 1px solid var(--border-subtle);
    text-align: left;
    white-space: nowrap;
  }

  .matrix-table th {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-weight: 600;
  }

  .matrix-table tr:hover td {
    background: rgba(128, 128, 128, 0.08);
  }

  /* Scope Chain Tab */
  .scope-pane-content {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .scope-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 10px 14px;
  }

  .scope-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent-purple);
    margin-bottom: 6px;
  }

  .var-row {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 3px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }

  .var-name { color: #93c5fd; }
  .var-value { color: #fde047; }

  /* Console Output Tab */
  .console-pane-content {
    padding: 12px;
    height: 100%;
  }

  .console-box {
    background: #090d13;
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: #a7f3d0;
    height: calc(100vh - 90px);
    overflow-y: auto;
    white-space: pre-wrap;
  }
`;

  // src/webview/app/TopControlsToolbar.ts
  var ICONS = {
    reset: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M12.75 8a4.75 4.75 0 1 1-1.39-3.36l1.06-1.06A6.25 6.25 0 1 0 14.25 8h-1.5z"/><path d="M11 2h4v4l-1.5-1.5L11 2z"/></svg>`,
    back: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h2v12H3V2zm10 1L6 8l7 5V3z"/></svg>`,
    play: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5-9-5.5z"/></svg>`,
    pause: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 2h3v12h-3V2zm6 0h3v12h-3V2z"/></svg>`,
    step: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2h-2v12h2V2zM3 3l7 5-7 5V3z"/></svg>`,
    ast: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2H3v3h3V2zM2 1h5v5H2V1zm11 9h-3v3h3v-3zm-4-1h5v5H9V9zm-4 2H3v3h2v-3zm-1-1h4v5H4v-5z"/><path d="M4.5 5.5v4h1v-4h-1zm0 4.5h5v1h-5v-1z"/></svg>`,
    tokens: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.5H2V3zm0 4h12v1.5H2V7zm0 4h12v1.5H2V11z"/></svg>`,
    scopes: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 3.5v7L8 15l-6-3.5v-7L8 1zm0 1.2L3.2 4.9 8 7.7l4.8-2.8L8 2.2zm5 3.5L8.5 8.3v5.5l4.5-2.6V5.7zm-5.5 8.1V8.3L3 5.7v5.5l4.5 2.6z"/></svg>`,
    console: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3l5 5-5 5V3zm6 9h6v1.5H8V12z"/></svg>`
  };
  var TopControlsToolbar = class {
    container;
    callbacks;
    playBtn;
    stepCounter;
    breadcrumbsContainer;
    tabButtons = /* @__PURE__ */ new Map();
    constructor(container, callbacks) {
      this.container = container;
      this.callbacks = callbacks;
      this.render();
    }
    update(stepIndex, totalSteps, isPlaying, breadcrumbs = ["Program"]) {
      this.updatePlayButton(isPlaying);
      this.stepCounter.textContent = totalSteps > 0 ? `Step ${stepIndex + 1}/${totalSteps}` : "Ready";
      this.breadcrumbsContainer.innerHTML = "";
      breadcrumbs.forEach((crumb, i) => {
        if (i > 0) {
          const sep = document.createElement("span");
          sep.className = "breadcrumb-sep";
          sep.textContent = ">";
          this.breadcrumbsContainer.appendChild(sep);
        }
        const span = document.createElement("span");
        span.className = "breadcrumb-crumb";
        span.textContent = crumb;
        this.breadcrumbsContainer.appendChild(span);
      });
    }
    updatePlayButton(isPlaying) {
      this.playBtn.innerHTML = isPlaying ? `${ICONS.pause} <span>Pause</span>` : `${ICONS.play} <span>Play</span>`;
      if (isPlaying) {
        this.playBtn.classList.remove("primary");
      } else {
        this.playBtn.classList.add("primary");
      }
    }
    setActiveTab(tabId) {
      this.tabButtons.forEach((btn, id) => {
        btn.classList.toggle("active", id === tabId);
      });
    }
    render() {
      const controls = document.createElement("div");
      controls.id = "controls";
      const playerGroup = document.createElement("div");
      playerGroup.className = "controls-group";
      const resetBtn = this.createBtn(ICONS.reset, "Reset", () => this.callbacks.onReset());
      const backBtn = this.createBtn(ICONS.back, "Back", () => this.callbacks.onStepBackward());
      this.playBtn = this.createBtn(ICONS.play, "Play", () => this.callbacks.onTogglePlay(), true);
      const stepBtn = this.createBtn(ICONS.step, "Step", () => this.callbacks.onStepForward());
      this.stepCounter = document.createElement("span");
      this.stepCounter.className = "step-counter-badge";
      this.stepCounter.textContent = "Step 0/0";
      playerGroup.appendChild(resetBtn);
      playerGroup.appendChild(backBtn);
      playerGroup.appendChild(this.playBtn);
      playerGroup.appendChild(stepBtn);
      playerGroup.appendChild(this.stepCounter);
      controls.appendChild(playerGroup);
      this.breadcrumbsContainer = document.createElement("div");
      this.breadcrumbsContainer.className = "breadcrumbs-bar";
      controls.appendChild(this.breadcrumbsContainer);
      const tabSwitcher = document.createElement("div");
      tabSwitcher.className = "tab-switcher";
      const tabs = [
        { id: "ast", icon: ICONS.ast, label: "AST Graph" },
        { id: "tokens", icon: ICONS.tokens, label: "Tokens" },
        { id: "scopes", icon: ICONS.scopes, label: "Scopes" },
        { id: "console", icon: ICONS.console, label: "Console" }
      ];
      tabs.forEach((t) => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${t.id === "ast" ? "active" : ""}`;
        btn.innerHTML = `${t.icon} <span>${t.label}</span>`;
        btn.addEventListener("click", () => {
          this.setActiveTab(t.id);
          this.callbacks.onTabSelect(t.id);
        });
        this.tabButtons.set(t.id, btn);
        tabSwitcher.appendChild(btn);
      });
      controls.appendChild(tabSwitcher);
      this.container.appendChild(controls);
    }
    createBtn(icon, label, onClick, isPrimary = false) {
      const btn = document.createElement("button");
      btn.className = isPrimary ? "ctrl-btn primary" : "ctrl-btn";
      btn.innerHTML = `${icon} <span>${label}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });
      return btn;
    }
  };

  // src/domain/layout/AstTableLayout.ts
  var RAIL_COLORS = [
    "#38bdf8",
    // Cyan
    "#34d399",
    // Emerald
    "#a78bfa",
    // Purple
    "#fbbf24",
    // Amber
    "#f472b6",
    // Rose
    "#60a5fa"
    // Blue
  ];
  var AstTableLayout = class {
    static ROW_HEIGHT = 28;
    static RAIL_SPACING = 16;
    static RAIL_OFFSET_X = 20;
    static flattenAst(program) {
      const rows = [];
      let currentRowIndex = 0;
      const traverse = (node, depth, slot, parentIndex) => {
        const rowIndex = currentRowIndex++;
        const category = node.category ?? this.getCategory(node);
        const label = node.label ?? this.getLabel(node);
        const railIndex = depth;
        rows.push({
          id: `row-${rowIndex}`,
          nodeId: node.id,
          rowIndex,
          depth,
          slot,
          category,
          label,
          parentRowIndex: parentIndex,
          railIndex,
          node,
          loc: node.loc
        });
        const children = Array.isArray(node.children) ? node.children.map((c) => ({ node: c, slot: c.slot || "child" })) : this.getChildEntries(node);
        for (const child of children) {
          traverse(child.node, depth + 1, child.slot, rowIndex);
        }
      };
      traverse(program, 0, "root", -1);
      return rows;
    }
    static computeRails(rows, rowPositionsOrExpandAt = -1, expandHeight = 0) {
      const rails = [];
      let rowY;
      if (Array.isArray(rowPositionsOrExpandAt)) {
        rowY = rowPositionsOrExpandAt;
      } else {
        const expandAt = rowPositionsOrExpandAt;
        rowY = rows.map((r) => {
          let y = r.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2;
          if (expandAt > -1 && r.rowIndex > expandAt) {
            y += expandHeight;
          }
          return y;
        });
      }
      for (const row of rows) {
        if (row.parentRowIndex < 0) continue;
        const parent = rows[row.parentRowIndex];
        const y1 = rowY[parent.rowIndex] ?? parent.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2;
        const y2 = rowY[row.rowIndex] ?? row.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2;
        const x1 = this.RAIL_OFFSET_X + parent.railIndex * this.RAIL_SPACING;
        const x2 = this.RAIL_OFFSET_X + row.railIndex * this.RAIL_SPACING;
        const color = RAIL_COLORS[row.depth % RAIL_COLORS.length];
        if (x1 === x2) {
          rails.push({
            pathD: `M ${x1} ${y1} L ${x2} ${y2}`,
            color,
            isStraight: true
          });
        } else {
          const curveH = Math.min(28, Math.max(12, y2 - y1));
          const d = curveH * 0.45;
          let pathD;
          if (y2 - curveH > y1) {
            pathD = `M ${x1} ${y1} L ${x1} ${y2 - curveH} C ${x1} ${y2 - curveH + d}, ${x2} ${y2 - d}, ${x2} ${y2}`;
          } else {
            pathD = `M ${x1} ${y1} C ${x1} ${y1 + d}, ${x2} ${y2 - d}, ${x2} ${y2}`;
          }
          rails.push({
            pathD,
            color,
            isStraight: false
          });
        }
      }
      return rails;
    }
    static getCategory(node) {
      switch (node.type) {
        case "FunctionDeclaration":
          return "Fn";
        case "Literal":
          return "Literal";
        case "Identifier":
          return "Ident";
        case "BinaryExpression":
        case "UnaryExpression":
        case "CallExpression":
          return "Expr";
        default:
          return "Stmt";
      }
    }
    static getLabel(node) {
      switch (node.type) {
        case "Program":
          return "Program";
        case "VariableDeclaration":
          return `let ${node.identifier} = \u2026`;
        case "Assignment":
          return `${node.identifier} = \u2026`;
        case "PrintStatement":
          return "print(\u2026)";
        case "IfStatement":
          return "if (condition)";
        case "WhileStatement":
          return "while (condition)";
        case "BlockStatement":
          return "{ block }";
        case "FunctionDeclaration":
          return `fn ${node.name}(${node.params.join(", ")})`;
        case "ReturnStatement":
          return node.value ? "return expression" : "return";
        case "BinaryExpression":
          return `op '${node.operator}'`;
        case "UnaryExpression":
          return `op '${node.operator}'`;
        case "Literal":
          return String(node.raw ?? node.value);
        case "Identifier":
          return node.name;
        case "CallExpression":
          return `${node.callee}(\u2026)`;
        default:
          return node.type;
      }
    }
    static getChildEntries(node) {
      switch (node.type) {
        case "Program":
          return node.body.map((s, i) => ({ node: s, slot: `stmt[${i}]` }));
        case "VariableDeclaration":
          return [{ node: node.initializer, slot: "init" }];
        case "Assignment":
          return [{ node: node.value, slot: "value" }];
        case "PrintStatement":
          return [{ node: node.expression, slot: "expr" }];
        case "ExpressionStatement":
          return [{ node: node.expression, slot: "expr" }];
        case "BlockStatement":
          return node.body.map((s, i) => ({ node: s, slot: `stmt[${i}]` }));
        case "IfStatement": {
          const entries = [
            { node: node.condition, slot: "condition" },
            { node: node.consequent, slot: "consequent" }
          ];
          if (node.alternate) entries.push({ node: node.alternate, slot: "alternate" });
          return entries;
        }
        case "WhileStatement":
          return [
            { node: node.condition, slot: "condition" },
            { node: node.body, slot: "body" }
          ];
        case "FunctionDeclaration":
          return [{ node: node.body, slot: "body" }];
        case "ReturnStatement":
          return node.value ? [{ node: node.value, slot: "value" }] : [];
        case "BinaryExpression":
          return [
            { node: node.left, slot: "left" },
            { node: node.right, slot: "right" }
          ];
        case "UnaryExpression":
          return [{ node: node.argument, slot: "arg" }];
        case "CallExpression":
          return node.args.map((a, i) => ({ node: a, slot: `arg[${i}]` }));
        default:
          return [];
      }
    }
  };

  // src/webview/app/AstTableGraphRenderer.ts
  var AstTableGraphRenderer = class {
    container;
    onSelectNode;
    rows = [];
    activeRowIndex = 0;
    expandedRowIndex = -1;
    expandedHeight = 0;
    svgElem;
    tableElem;
    tbodyElem;
    activeResultValues = /* @__PURE__ */ new Map();
    constructor(container, onSelectNode) {
      this.container = container;
      this.onSelectNode = onSelectNode;
      this.renderContainers();
    }
    setProgram(program) {
      this.rows = AstTableLayout.flattenAst(program);
      this.expandedRowIndex = -1;
      this.expandedHeight = 0;
      this.activeResultValues.clear();
      this.renderTable();
      this.renderGraph();
    }
    setActiveStep(nodeId, resultValue) {
      const foundIndex = this.rows.findIndex((r) => r.nodeId === nodeId);
      if (foundIndex >= 0) {
        this.activeRowIndex = foundIndex;
        if (resultValue !== void 0) {
          this.activeResultValues.set(nodeId, resultValue);
        }
        this.updateRowHighlights();
        this.renderGraph();
        const activeTr = this.tbodyElem.querySelector(`tr[data-row-index="${foundIndex}"]`);
        activeTr?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return this.rows[foundIndex];
      }
      return null;
    }
    renderContainers() {
      const pane = document.createElement("div");
      pane.id = "tab-ast";
      pane.className = "tab-pane active";
      const content = document.createElement("div");
      content.id = "content";
      this.svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svgElem.id = "commitGraph";
      content.appendChild(this.svgElem);
      this.tableElem = document.createElement("div");
      this.tableElem.id = "commitTable";
      content.appendChild(this.tableElem);
      pane.appendChild(content);
      this.container.appendChild(pane);
    }
    renderTable() {
      const maxRail = Math.max(...this.rows.map((r) => r.railIndex), 0);
      const graphColWidth = Math.max(80, AstTableLayout.RAIL_OFFSET_X + (maxRail + 1) * AstTableLayout.RAIL_SPACING + 20);
      let html = `
      <table>
        <thead>
          <tr>
            <th style="width:${graphColWidth}px;">Graph</th>
            <th>AST Node &amp; Structure</th>
            <th style="width:130px;">Result</th>
            <th style="width:140px;">Scope Mutation</th>
            <th style="width:90px;">Location</th>
          </tr>
        </thead>
        <tbody>
    `;
      this.rows.forEach((row) => {
        const isExpanded = this.expandedRowIndex === row.rowIndex;
        const val = this.activeResultValues.get(row.nodeId);
        const valHtml = val ? `<span class="val-pill">${this.escape(val)}</span>` : "-";
        const locText = `L${row.loc.start.line}:${row.loc.start.column}`;
        html += `
        <tr class="ast-row ${row.rowIndex === this.activeRowIndex ? "active-step" : ""}" data-row-index="${row.rowIndex}">
          <td style="width:${graphColWidth}px;"></td>
          <td>
            <div class="outline-cell">
              <span class="slot-tag">${row.slot}:</span>
              <span class="cat-badge ${row.category}">${row.category}</span>
              <span class="node-label-text">${this.escape(row.label)}</span>
            </div>
          </td>
          <td>${valHtml}</td>
          <td><span class="mutation-text">${this.getMutationSummary(row.node)}</span></td>
          <td><span class="loc-text">${locText}</span></td>
        </tr>
      `;
        if (isExpanded) {
          html += `
          <tr class="inline-details-row" data-expanded-for="${row.rowIndex}">
            <td style="width:${graphColWidth}px;"></td>
            <td colspan="4">
              <div class="cdv-card">
                <div class="cdv-header">
                  <span class="cdv-title">Node Details: ${row.node.type} (${row.nodeId})</span>
                  <button class="cdv-close-btn" data-close-row="${row.rowIndex}">&times;</button>
                </div>
                <pre class="cdv-json-box">${this.escape(JSON.stringify(row.node, null, 2))}</pre>
              </div>
            </td>
          </tr>
        `;
        }
      });
      html += `</tbody></table>`;
      this.tableElem.innerHTML = html;
      this.tbodyElem = this.tableElem.querySelector("tbody");
      this.attachTableListeners();
    }
    renderGraph() {
      const maxRail = Math.max(...this.rows.map((r) => r.railIndex), 0);
      const graphWidth = Math.max(80, AstTableLayout.RAIL_OFFSET_X + (maxRail + 1) * AstTableLayout.RAIL_SPACING + 20);
      const rowYPositions = [];
      for (let i = 0; i < this.rows.length; i++) {
        const tr = this.tbodyElem?.querySelector(`tr.ast-row[data-row-index="${i}"]`);
        if (tr) {
          rowYPositions.push(tr.offsetTop + tr.clientHeight / 2);
        } else {
          rowYPositions.push(i * AstTableLayout.ROW_HEIGHT + AstTableLayout.ROW_HEIGHT / 2);
        }
      }
      const lastY = rowYPositions.length > 0 ? rowYPositions[rowYPositions.length - 1] : 0;
      const totalHeight = Math.max(
        this.tableElem.scrollHeight,
        this.tableElem.clientHeight,
        lastY + 40
      );
      this.svgElem.setAttribute("width", String(graphWidth));
      this.svgElem.setAttribute("height", String(totalHeight));
      this.svgElem.innerHTML = "";
      const rails = AstTableLayout.computeRails(
        this.rows,
        rowYPositions
      );
      rails.forEach((rail) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", rail.pathD);
        path.setAttribute("class", "rail");
        path.setAttribute("stroke", rail.color);
        this.svgElem.appendChild(path);
      });
      this.rows.forEach((row) => {
        const cy = rowYPositions[row.rowIndex] ?? row.rowIndex * AstTableLayout.ROW_HEIGHT + AstTableLayout.ROW_HEIGHT / 2;
        const cx = AstTableLayout.RAIL_OFFSET_X + row.railIndex * AstTableLayout.RAIL_SPACING;
        const isActive = row.rowIndex === this.activeRowIndex;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(cx));
        circle.setAttribute("cy", String(cy));
        circle.setAttribute("r", isActive ? "6" : "4");
        circle.setAttribute("fill", isActive ? "#38bdf8" : "#1e293b");
        circle.setAttribute("stroke", "#38bdf8");
        circle.setAttribute("stroke-width", isActive ? "2.5" : "1.5");
        if (isActive) circle.setAttribute("class", "active");
        circle.addEventListener("click", () => {
          this.onSelectNode(row.nodeId, row.loc);
        });
        this.svgElem.appendChild(circle);
      });
    }
    updateRowHighlights() {
      const trs = this.tbodyElem.querySelectorAll("tr.ast-row");
      trs.forEach((tr) => {
        const idx = parseInt(tr.getAttribute("data-row-index") || "-1", 10);
        tr.classList.toggle("active-step", idx === this.activeRowIndex);
      });
    }
    attachTableListeners() {
      this.tbodyElem.querySelectorAll("tr.ast-row").forEach((tr) => {
        tr.addEventListener("click", () => {
          const idx = parseInt(tr.getAttribute("data-row-index") || "-1", 10);
          if (idx >= 0) {
            const row = this.rows[idx];
            this.onSelectNode(row.nodeId, row.loc);
            if (this.expandedRowIndex === idx) {
              this.expandedRowIndex = -1;
              this.expandedHeight = 0;
            } else {
              this.expandedRowIndex = idx;
            }
            this.renderTable();
            this.renderGraph();
          }
        });
      });
      this.tbodyElem.querySelectorAll(".cdv-close-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.expandedRowIndex = -1;
          this.expandedHeight = 0;
          this.renderTable();
          this.renderGraph();
        });
      });
    }
    getMutationSummary(node) {
      if (node.type === "VariableDeclaration") return `let ${node.identifier}`;
      if (node.type === "Assignment") return `${node.identifier} = \u2026`;
      return "-";
    }
    escape(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  };

  // src/webview/app/TokenMatrixView.ts
  var TokenMatrixView = class {
    container;
    onSelectToken;
    tokens = [];
    activeCategory = "ALL";
    tbody;
    filterPillsContainer;
    constructor(container, onSelectToken) {
      this.container = container;
      this.onSelectToken = onSelectToken;
      this.render();
    }
    setTokens(tokens) {
      this.tokens = tokens;
      this.updateCategoryPills();
      this.renderTableRows();
    }
    render() {
      const pane = document.createElement("div");
      pane.id = "tab-tokens";
      pane.className = "tab-pane";
      const toolbar = document.createElement("div");
      toolbar.className = "pane-toolbar";
      this.filterPillsContainer = document.createElement("div");
      this.filterPillsContainer.className = "category-pills-bar";
      toolbar.appendChild(this.filterPillsContainer);
      pane.appendChild(toolbar);
      const tableContainer = document.createElement("div");
      tableContainer.style.overflowY = "auto";
      tableContainer.style.maxHeight = "calc(100vh - 80px)";
      const table = document.createElement("table");
      table.className = "matrix-table";
      table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th style="width:130px;">Type</th>
          <th>Lexeme</th>
          <th style="width:120px;">Literal</th>
          <th style="width:90px;">Line:Col</th>
          <th style="width:90px;">Category</th>
        </tr>
      </thead>
    `;
      this.tbody = document.createElement("tbody");
      table.appendChild(this.tbody);
      tableContainer.appendChild(table);
      pane.appendChild(tableContainer);
      this.container.appendChild(pane);
      this.updateCategoryPills();
    }
    updateCategoryPills() {
      const categories = ["All", "Keyword", "Ident", "Literal", "Operator", "Punct"];
      this.filterPillsContainer.innerHTML = "";
      categories.forEach((cat) => {
        const count = cat === "All" ? this.tokens.length : this.tokens.filter((t) => this.getTokenCategory(t.type) === cat).length;
        const pill = document.createElement("button");
        pill.className = `cat-pill ${this.activeCategory === cat ? "active" : ""}`;
        pill.textContent = `${cat} (${count})`;
        pill.addEventListener("click", () => {
          this.activeCategory = cat;
          this.updateCategoryPills();
          this.renderTableRows();
        });
        this.filterPillsContainer.appendChild(pill);
      });
    }
    renderTableRows() {
      this.tbody.innerHTML = "";
      const filtered = this.tokens.filter((t) => {
        if (this.activeCategory === "All") return true;
        return this.getTokenCategory(t.type) === this.activeCategory;
      });
      if (filtered.length === 0) {
        this.tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:16px;">No matching tokens.</td></tr>`;
        return;
      }
      filtered.forEach((tok, i) => {
        const tr = document.createElement("tr");
        const cat = this.getTokenCategory(tok.type);
        const locText = `L${tok.loc.start.line}:${tok.loc.start.column}`;
        tr.innerHTML = `
        <td style="color:var(--text-secondary);font-family:var(--font-mono);">${i}</td>
        <td><span class="cat-badge ${cat}">${tok.type}</span></td>
        <td style="font-family:var(--font-mono);font-weight:600;">${this.escape(tok.lexeme)}</td>
        <td style="font-family:var(--font-mono);color:#34d399;">${tok.literal !== null ? this.escape(String(tok.literal)) : "-"}</td>
        <td style="color:var(--text-secondary);font-family:var(--font-mono);">${locText}</td>
        <td><span class="cat-pill">${cat}</span></td>
      `;
        tr.addEventListener("click", () => this.onSelectToken(tok.loc));
        this.tbody.appendChild(tr);
      });
    }
    getTokenCategory(type) {
      switch (type) {
        case "LET" /* LET */:
        case "IF" /* IF */:
        case "ELSE" /* ELSE */:
        case "WHILE" /* WHILE */:
        case "FN" /* FN */:
        case "RETURN" /* RETURN */:
        case "PRINT" /* PRINT */:
          return "Keyword";
        case "IDENTIFIER" /* IDENTIFIER */:
          return "Ident";
        case "NUMBER" /* NUMBER */:
        case "STRING" /* STRING */:
        case "TRUE" /* TRUE */:
        case "FALSE" /* FALSE */:
        case "NULL" /* NULL */:
          return "Literal";
        case "PLUS" /* PLUS */:
        case "MINUS" /* MINUS */:
        case "STAR" /* STAR */:
        case "SLASH" /* SLASH */:
        case "PERCENT" /* PERCENT */:
        case "ASSIGN" /* ASSIGN */:
        case "EQUAL" /* EQUAL */:
        case "NOT_EQUAL" /* NOT_EQUAL */:
        case "LESS" /* LESS */:
        case "LESS_EQUAL" /* LESS_EQUAL */:
        case "GREATER" /* GREATER */:
        case "GREATER_EQUAL" /* GREATER_EQUAL */:
        case "BANG" /* BANG */:
          return "Operator";
        default:
          return "Punct";
      }
    }
    escape(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  };

  // src/webview/app/ScopeChainView.ts
  var ScopeChainView = class {
    container;
    contentEl;
    constructor(container) {
      this.container = container;
      this.render();
    }
    setScopes(scopes) {
      this.contentEl.innerHTML = "";
      if (!scopes || scopes.length === 0) {
        this.contentEl.innerHTML = `<div style="color:var(--text-secondary);font-size:12px;">No active scopes.</div>`;
        return;
      }
      scopes.forEach((scope) => {
        const card = document.createElement("div");
        card.className = "scope-card";
        const title = document.createElement("div");
        title.className = "scope-title";
        title.textContent = `Scope: ${scope.name} (${scope.scopeId})`;
        card.appendChild(title);
        const keys = Object.keys(scope.bindings);
        if (keys.length === 0) {
          const empty = document.createElement("div");
          empty.style.color = "var(--text-secondary)";
          empty.style.fontStyle = "italic";
          empty.style.fontSize = "11px";
          empty.textContent = "(empty scope frame)";
          card.appendChild(empty);
        } else {
          keys.forEach((k) => {
            const row = document.createElement("div");
            row.className = "var-row";
            row.innerHTML = `
            <span class="var-name">${k}</span>
            <span class="var-value">${scope.bindings[k]}</span>
          `;
            card.appendChild(row);
          });
        }
        this.contentEl.appendChild(card);
      });
    }
    render() {
      const pane = document.createElement("div");
      pane.id = "tab-scopes";
      pane.className = "tab-pane";
      this.contentEl = document.createElement("div");
      this.contentEl.className = "scope-pane-content";
      pane.appendChild(this.contentEl);
      this.container.appendChild(pane);
    }
  };

  // src/webview/app/ConsoleOutputView.ts
  var ConsoleOutputView = class {
    container;
    consoleBox;
    stdoutHistory = [];
    constructor(container) {
      this.container = container;
      this.render();
    }
    getHistory() {
      return this.stdoutHistory;
    }
    setOutput(stdoutHistory, executionTimeMs) {
      this.stdoutHistory = stdoutHistory;
      this.consoleBox.innerHTML = "";
      if (stdoutHistory.length === 0) {
        this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// No output produced yet...</span>`;
        return;
      }
      const lines = stdoutHistory.map((line) => `&gt; ${this.escape(line)}`).join("\n");
      let timingHtml = "";
      if (executionTimeMs !== void 0) {
        timingHtml = `

<span style="color:var(--text-secondary);font-size:11px;">[Execution time: ${executionTimeMs} ms]</span>`;
      }
      this.consoleBox.innerHTML = lines + timingHtml;
    }
    clear() {
      this.stdoutHistory = [];
      this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// Output cleared.</span>`;
    }
    render() {
      const pane = document.createElement("div");
      pane.id = "tab-console";
      pane.className = "tab-pane";
      const content = document.createElement("div");
      content.className = "console-pane-content";
      this.consoleBox = document.createElement("pre");
      this.consoleBox.className = "console-box";
      this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// Console output will appear here...</span>`;
      content.appendChild(this.consoleBox);
      pane.appendChild(content);
      this.container.appendChild(pane);
    }
    escape(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  };

  // src/webview/app/WebviewApp.ts
  var WebviewApp = class {
    vscode = acquireVsCodeApi();
    toolbar;
    astRenderer;
    tokenView;
    scopeView;
    consoleView;
    snapshots = [];
    currentStepIndex = 0;
    isPlaying = false;
    activeProgram = null;
    executionTimeMs = 0;
    constructor() {
      this.injectStyles();
      this.buildDom();
      this.setupMessageBridge();
    }
    getCurrentStepIndex() {
      return this.currentStepIndex;
    }
    injectStyles() {
      const styleEl = document.createElement("style");
      styleEl.textContent = APP_STYLES;
      document.head.appendChild(styleEl);
    }
    buildDom() {
      const root = document.getElementById("root") || document.body;
      root.innerHTML = "";
      const view = document.createElement("div");
      view.id = "view";
      this.toolbar = new TopControlsToolbar(view, {
        onStepForward: () => this.vscode.postMessage({ type: "STEP_FORWARD" }),
        onStepBackward: () => this.vscode.postMessage({ type: "STEP_BACKWARD" }),
        onTogglePlay: () => {
          this.isPlaying = !this.isPlaying;
          this.toolbar.updatePlayButton(this.isPlaying);
          this.vscode.postMessage({ type: this.isPlaying ? "PLAY" : "PAUSE" });
        },
        onReset: () => {
          this.isPlaying = false;
          this.toolbar.updatePlayButton(false);
          this.vscode.postMessage({ type: "RESET" });
        },
        onTabSelect: (tabId) => this.switchTab(tabId)
      });
      const tabViewport = document.createElement("div");
      tabViewport.className = "tab-viewport";
      this.astRenderer = new AstTableGraphRenderer(tabViewport, (_nodeId, loc) => {
        this.vscode.postMessage({ type: "SELECT_NODE", payload: { nodeId: _nodeId, loc } });
      });
      this.tokenView = new TokenMatrixView(tabViewport, (loc) => {
        this.vscode.postMessage({ type: "SELECT_NODE", payload: { nodeId: "", loc } });
      });
      this.scopeView = new ScopeChainView(tabViewport);
      this.consoleView = new ConsoleOutputView(tabViewport);
      view.appendChild(tabViewport);
      root.appendChild(view);
    }
    switchTab(tabId) {
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
      const target = document.getElementById(`tab-${tabId}`);
      target?.classList.add("active");
    }
    setupMessageBridge() {
      window.addEventListener("message", (event) => {
        const msg = event.data;
        switch (msg.type) {
          case "INIT_PROGRAM":
            this.initProgram(msg.payload.ast, msg.payload.tokens, msg.payload.snapshots, msg.payload.executionTimeMs);
            break;
          case "UPDATE_STEP":
            this.syncStep(msg.payload.stepIndex);
            break;
          case "PLAY_STATE_CHANGED":
            this.isPlaying = msg.payload.isPlaying;
            this.toolbar.updatePlayButton(this.isPlaying);
            break;
          case "REPORT_ERROR":
            alert(`Error: ${msg.payload.message}`);
            break;
        }
      });
      this.vscode.postMessage({ type: "WEBVIEW_READY" });
    }
    initProgram(ast, tokens, snapshots, executionTimeMs) {
      this.activeProgram = ast;
      this.snapshots = snapshots;
      this.currentStepIndex = 0;
      this.isPlaying = false;
      this.executionTimeMs = executionTimeMs;
      this.astRenderer.setProgram(ast);
      this.tokenView.setTokens(tokens);
      this.consoleView.setOutput([], executionTimeMs);
      if (snapshots.length > 0) {
        this.syncStep(0);
      }
    }
    syncStep(index) {
      this.currentStepIndex = index;
      const snapshot = this.snapshots[index] ?? null;
      if (snapshot) {
        this.astRenderer.setActiveStep(snapshot.nodeId, snapshot.resultValue);
        this.scopeView.setScopes(snapshot.scopes);
        this.consoleView.setOutput(snapshot.stdoutHistory, this.executionTimeMs);
        const breadcrumbs = this.buildBreadcrumbs(snapshot.nodeId);
        this.toolbar.update(index, this.snapshots.length, this.isPlaying, breadcrumbs);
      }
    }
    buildBreadcrumbs(targetNodeId) {
      if (!this.activeProgram) return ["Program"];
      const path = [];
      const findPath = (node) => {
        path.push(node.type);
        if (node.id === targetNodeId) return true;
        const children = this.getChildren(node);
        for (const child of children) {
          if (findPath(child)) return true;
        }
        path.pop();
        return false;
      };
      findPath(this.activeProgram);
      return path.length > 0 ? path : ["Program"];
    }
    getChildren(node) {
      switch (node.type) {
        case "Program":
          return node.body;
        case "VariableDeclaration":
          return [node.initializer];
        case "Assignment":
          return [node.value];
        case "PrintStatement":
          return [node.expression];
        case "ExpressionStatement":
          return [node.expression];
        case "BlockStatement":
          return node.body;
        case "IfStatement":
          return node.alternate ? [node.condition, node.consequent, node.alternate] : [node.condition, node.consequent];
        case "WhileStatement":
          return [node.condition, node.body];
        case "FunctionDeclaration":
          return [node.body];
        case "ReturnStatement":
          return node.value ? [node.value] : [];
        case "BinaryExpression":
          return [node.left, node.right];
        case "UnaryExpression":
          return [node.argument];
        case "CallExpression":
          return node.args;
        default:
          return [];
      }
    }
  };
  new WebviewApp();
})();
//# sourceMappingURL=webview.js.map
