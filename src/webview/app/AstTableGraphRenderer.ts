import { ProgramNode, ASTNode } from '../../shared/AstNodeTypes';
import { SourceLocation } from '../../shared/SourceLocation';
import { AstTableLayout, AstTableRow, SvgRailPath } from '../../domain/layout/AstTableLayout';

export class AstTableGraphRenderer {
  private readonly container: HTMLElement;
  private readonly onSelectNode: (nodeId: string, loc: SourceLocation) => void;
  private rows: AstTableRow[] = [];
  private activeRowIndex = 0;
  private expandedRowIndex = -1;
  private expandedHeight = 0;
  private svgElem!: SVGSVGElement;
  private tableElem!: HTMLElement;
  private tbodyElem!: HTMLTableSectionElement;
  private activeResultValues: Map<string, string> = new Map();

  constructor(container: HTMLElement, onSelectNode: (nodeId: string, loc: SourceLocation) => void) {
    this.container = container;
    this.onSelectNode = onSelectNode;
    this.renderContainers();
  }

  public setProgram(program: ProgramNode): void {
    this.rows = AstTableLayout.flattenAst(program);
    this.expandedRowIndex = -1;
    this.expandedHeight = 0;
    this.activeResultValues.clear();
    this.renderTable();
    this.renderGraph();
  }

  public setActiveStep(nodeId: string, resultValue?: string): AstTableRow | null {
    const foundIndex = this.rows.findIndex(r => r.nodeId === nodeId);
    if (foundIndex >= 0) {
      this.activeRowIndex = foundIndex;
      if (resultValue !== undefined) {
        this.activeResultValues.set(nodeId, resultValue);
      }
      this.updateRowHighlights();
      this.renderGraph();

      const activeTr = this.tbodyElem.querySelector(`tr[data-row-index="${foundIndex}"]`) as HTMLElement | null;
      activeTr?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return this.rows[foundIndex];
    }
    return null;
  }

  private renderContainers(): void {
    const pane = document.createElement('div');
    pane.id = 'tab-ast';
    pane.className = 'tab-pane active';

    const content = document.createElement('div');
    content.id = 'content';

    this.svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElem.id = 'commitGraph';
    content.appendChild(this.svgElem);

    this.tableElem = document.createElement('div');
    this.tableElem.id = 'commitTable';
    content.appendChild(this.tableElem);

    pane.appendChild(content);
    this.container.appendChild(pane);
  }

  private renderTable(): void {
    const maxRail = Math.max(...this.rows.map(r => r.railIndex), 0);
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

    this.rows.forEach(row => {
      const isExpanded = this.expandedRowIndex === row.rowIndex;
      const val = this.activeResultValues.get(row.nodeId);
      const valHtml = val ? `<span class="val-pill">${this.escape(val)}</span>` : '-';
      const locText = `L${row.loc.start.line}:${row.loc.start.column}`;

      html += `
        <tr class="ast-row ${row.rowIndex === this.activeRowIndex ? 'active-step' : ''}" data-row-index="${row.rowIndex}">
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
    this.tbodyElem = this.tableElem.querySelector('tbody')!;
    this.attachTableListeners();
  }

  private renderGraph(): void {
    const maxRail = Math.max(...this.rows.map(r => r.railIndex), 0);
    const graphWidth = Math.max(80, AstTableLayout.RAIL_OFFSET_X + (maxRail + 1) * AstTableLayout.RAIL_SPACING + 20);

    // Measure exact Y centers from the DOM rows so graph alignment is always 100% accurate
    const rowYPositions: number[] = [];
    for (let i = 0; i < this.rows.length; i++) {
      const tr = this.tbodyElem?.querySelector(`tr.ast-row[data-row-index="${i}"]`) as HTMLElement | null;
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

    this.svgElem.setAttribute('width', String(graphWidth));
    this.svgElem.setAttribute('height', String(totalHeight));
    this.svgElem.innerHTML = '';

    const rails: SvgRailPath[] = AstTableLayout.computeRails(
      this.rows,
      rowYPositions
    );

    // 1. Draw Bezier Railway Tracks
    rails.forEach(rail => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', rail.pathD);
      path.setAttribute('class', 'rail');
      path.setAttribute('stroke', rail.color);
      this.svgElem.appendChild(path);
    });

    // 2. Draw Commit Vertex Circles
    this.rows.forEach(row => {
      const cy = rowYPositions[row.rowIndex] ?? (row.rowIndex * AstTableLayout.ROW_HEIGHT + AstTableLayout.ROW_HEIGHT / 2);
      const cx = AstTableLayout.RAIL_OFFSET_X + row.railIndex * AstTableLayout.RAIL_SPACING;
      const isActive = row.rowIndex === this.activeRowIndex;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(cx));
      circle.setAttribute('cy', String(cy));
      circle.setAttribute('r', isActive ? '6' : '4');
      circle.setAttribute('fill', isActive ? '#38bdf8' : '#1e293b');
      circle.setAttribute('stroke', '#38bdf8');
      circle.setAttribute('stroke-width', isActive ? '2.5' : '1.5');
      if (isActive) circle.setAttribute('class', 'active');

      circle.addEventListener('click', () => {
        this.onSelectNode(row.nodeId, row.loc);
      });

      this.svgElem.appendChild(circle);
    });
  }

  private updateRowHighlights(): void {
    const trs = this.tbodyElem.querySelectorAll('tr.ast-row');
    trs.forEach(tr => {
      const idx = parseInt(tr.getAttribute('data-row-index') || '-1', 10);
      tr.classList.toggle('active-step', idx === this.activeRowIndex);
    });
  }

  private attachTableListeners(): void {
    this.tbodyElem.querySelectorAll('tr.ast-row').forEach(tr => {
      tr.addEventListener('click', () => {
        const idx = parseInt(tr.getAttribute('data-row-index') || '-1', 10);
        if (idx >= 0) {
          const row = this.rows[idx];
          this.onSelectNode(row.nodeId, row.loc);

          // Toggle inline expansion
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

    this.tbodyElem.querySelectorAll('.cdv-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.expandedRowIndex = -1;
        this.expandedHeight = 0;
        this.renderTable();
        this.renderGraph();
      });
    });
  }

  private getMutationSummary(node: ASTNode): string {
    if (node.type === 'VariableDeclaration') return `let ${node.identifier}`;
    if (node.type === 'Assignment') return `${node.identifier} = …`;
    return '-';
  }

  private escape(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
