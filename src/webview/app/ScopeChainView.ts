import { ScopeFrame } from '../../shared/StepSnapshot';

export class ScopeChainView {
  private readonly container: HTMLElement;
  private contentEl!: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  public setScopes(scopes: ScopeFrame[]): void {
    this.contentEl.innerHTML = '';
    if (!scopes || scopes.length === 0) {
      this.contentEl.innerHTML = `<div style="color:var(--text-secondary);font-size:12px;">No active scopes.</div>`;
      return;
    }

    scopes.forEach(scope => {
      const card = document.createElement('div');
      card.className = 'scope-card';

      const title = document.createElement('div');
      title.className = 'scope-title';
      title.textContent = `Scope: ${scope.name} (${scope.scopeId})`;
      card.appendChild(title);

      const keys = Object.keys(scope.bindings);
      if (keys.length === 0) {
        const empty = document.createElement('div');
        empty.style.color = 'var(--text-secondary)';
        empty.style.fontStyle = 'italic';
        empty.style.fontSize = '11px';
        empty.textContent = '(empty scope frame)';
        card.appendChild(empty);
      } else {
        keys.forEach(k => {
          const row = document.createElement('div');
          row.className = 'var-row';
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

  private render(): void {
    const pane = document.createElement('div');
    pane.id = 'tab-scopes';
    pane.className = 'tab-pane';

    this.contentEl = document.createElement('div');
    this.contentEl.className = 'scope-pane-content';
    pane.appendChild(this.contentEl);

    this.container.appendChild(pane);
  }
}
