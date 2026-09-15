export const APP_STYLES = `
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
