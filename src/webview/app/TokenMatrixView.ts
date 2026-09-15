import { Token } from '../../domain/lexer/Token';
import { TokenType } from '../../domain/lexer/TokenType';
import { SourceLocation } from '../../shared/SourceLocation';

export class TokenMatrixView {
  private readonly container: HTMLElement;
  private readonly onSelectToken: (loc: SourceLocation) => void;
  private tokens: Token[] = [];
  private activeCategory = 'ALL';
  private tbody!: HTMLTableSectionElement;
  private filterPillsContainer!: HTMLElement;

  constructor(container: HTMLElement, onSelectToken: (loc: SourceLocation) => void) {
    this.container = container;
    this.onSelectToken = onSelectToken;
    this.render();
  }

  public setTokens(tokens: Token[]): void {
    this.tokens = tokens;
    this.updateCategoryPills();
    this.renderTableRows();
  }

  private render(): void {
    const pane = document.createElement('div');
    pane.id = 'tab-tokens';
    pane.className = 'tab-pane';

    // Toolbar with Category Pills
    const toolbar = document.createElement('div');
    toolbar.className = 'pane-toolbar';

    this.filterPillsContainer = document.createElement('div');
    this.filterPillsContainer.className = 'category-pills-bar';
    toolbar.appendChild(this.filterPillsContainer);
    pane.appendChild(toolbar);

    // Matrix Table
    const tableContainer = document.createElement('div');
    tableContainer.style.overflowY = 'auto';
    tableContainer.style.maxHeight = 'calc(100vh - 80px)';

    const table = document.createElement('table');
    table.className = 'matrix-table';
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

    this.tbody = document.createElement('tbody');
    table.appendChild(this.tbody);
    tableContainer.appendChild(table);
    pane.appendChild(tableContainer);

    this.container.appendChild(pane);
    this.updateCategoryPills();
  }

  private updateCategoryPills(): void {
    const categories = ['All', 'Keyword', 'Ident', 'Literal', 'Operator', 'Punct'];
    this.filterPillsContainer.innerHTML = '';

    categories.forEach(cat => {
      const count = cat === 'All'
        ? this.tokens.length
        : this.tokens.filter(t => this.getTokenCategory(t.type) === cat).length;

      const pill = document.createElement('button');
      pill.className = `cat-pill ${this.activeCategory === cat ? 'active' : ''}`;
      pill.textContent = `${cat} (${count})`;
      pill.addEventListener('click', () => {
        this.activeCategory = cat;
        this.updateCategoryPills();
        this.renderTableRows();
      });
      this.filterPillsContainer.appendChild(pill);
    });
  }

  private renderTableRows(): void {
    this.tbody.innerHTML = '';
    const filtered = this.tokens.filter(t => {
      if (this.activeCategory === 'All') return true;
      return this.getTokenCategory(t.type) === this.activeCategory;
    });

    if (filtered.length === 0) {
      this.tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:16px;">No matching tokens.</td></tr>`;
      return;
    }

    filtered.forEach((tok, i) => {
      const tr = document.createElement('tr');
      const cat = this.getTokenCategory(tok.type);
      const locText = `L${tok.loc.start.line}:${tok.loc.start.column}`;

      tr.innerHTML = `
        <td style="color:var(--text-secondary);font-family:var(--font-mono);">${i}</td>
        <td><span class="cat-badge ${cat}">${tok.type}</span></td>
        <td style="font-family:var(--font-mono);font-weight:600;">${this.escape(tok.lexeme)}</td>
        <td style="font-family:var(--font-mono);color:#34d399;">${tok.literal !== null ? this.escape(String(tok.literal)) : '-'}</td>
        <td style="color:var(--text-secondary);font-family:var(--font-mono);">${locText}</td>
        <td><span class="cat-pill">${cat}</span></td>
      `;

      tr.addEventListener('click', () => this.onSelectToken(tok.loc));
      this.tbody.appendChild(tr);
    });
  }

  private getTokenCategory(type: TokenType): string {
    switch (type) {
      case TokenType.LET:
      case TokenType.IF:
      case TokenType.ELSE:
      case TokenType.WHILE:
      case TokenType.FN:
      case TokenType.RETURN:
      case TokenType.PRINT:
        return 'Keyword';
      case TokenType.IDENTIFIER:
        return 'Ident';
      case TokenType.NUMBER:
      case TokenType.STRING:
      case TokenType.TRUE:
      case TokenType.FALSE:
      case TokenType.NULL:
        return 'Literal';
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.STAR:
      case TokenType.SLASH:
      case TokenType.PERCENT:
      case TokenType.ASSIGN:
      case TokenType.EQUAL:
      case TokenType.NOT_EQUAL:
      case TokenType.LESS:
      case TokenType.LESS_EQUAL:
      case TokenType.GREATER:
      case TokenType.GREATER_EQUAL:
      case TokenType.BANG:
        return 'Operator';
      default:
        return 'Punct';
    }
  }

  private escape(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
