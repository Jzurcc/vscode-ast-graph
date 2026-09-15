export interface ToolbarCallbacks {
  onStepForward: () => void;
  onStepBackward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onTabSelect: (tabId: 'ast' | 'tokens' | 'scopes' | 'console') => void;
}

const ICONS = {
  reset: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M12.75 8a4.75 4.75 0 1 1-1.39-3.36l1.06-1.06A6.25 6.25 0 1 0 14.25 8h-1.5z"/><path d="M11 2h4v4l-1.5-1.5L11 2z"/></svg>`,
  back: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h2v12H3V2zm10 1L6 8l7 5V3z"/></svg>`,
  play: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5-9-5.5z"/></svg>`,
  pause: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 2h3v12h-3V2zm6 0h3v12h-3V2z"/></svg>`,
  step: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2h-2v12h2V2zM3 3l7 5-7 5V3z"/></svg>`,
  ast: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2H3v3h3V2zM2 1h5v5H2V1zm11 9h-3v3h3v-3zm-4-1h5v5H9V9zm-4 2H3v3h2v-3zm-1-1h4v5H4v-5z"/><path d="M4.5 5.5v4h1v-4h-1zm0 4.5h5v1h-5v-1z"/></svg>`,
  tokens: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.5H2V3zm0 4h12v1.5H2V7zm0 4h12v1.5H2V11z"/></svg>`,
  scopes: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l6 3.5v7L8 15l-6-3.5v-7L8 1zm0 1.2L3.2 4.9 8 7.7l4.8-2.8L8 2.2zm5 3.5L8.5 8.3v5.5l4.5-2.6V5.7zm-5.5 8.1V8.3L3 5.7v5.5l4.5 2.6z"/></svg>`,
  console: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3l5 5-5 5V3zm6 9h6v1.5H8V12z"/></svg>`,
};

export class TopControlsToolbar {
  private readonly container: HTMLElement;
  private readonly callbacks: ToolbarCallbacks;
  private playBtn!: HTMLButtonElement;
  private stepCounter!: HTMLElement;
  private breadcrumbsContainer!: HTMLElement;
  private tabButtons: Map<string, HTMLButtonElement> = new Map();

  constructor(container: HTMLElement, callbacks: ToolbarCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  public update(
    stepIndex: number,
    totalSteps: number,
    isPlaying: boolean,
    breadcrumbs: string[] = ['Program']
  ): void {
    this.updatePlayButton(isPlaying);
    this.stepCounter.textContent = totalSteps > 0 ? `Step ${stepIndex + 1}/${totalSteps}` : 'Ready';

    this.breadcrumbsContainer.innerHTML = '';
    breadcrumbs.forEach((crumb, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = '>';
        this.breadcrumbsContainer.appendChild(sep);
      }
      const span = document.createElement('span');
      span.className = 'breadcrumb-crumb';
      span.textContent = crumb;
      this.breadcrumbsContainer.appendChild(span);
    });
  }

  public updatePlayButton(isPlaying: boolean): void {
    this.playBtn.innerHTML = isPlaying
      ? `${ICONS.pause} <span>Pause</span>`
      : `${ICONS.play} <span>Play</span>`;
    if (isPlaying) {
      this.playBtn.classList.remove('primary');
    } else {
      this.playBtn.classList.add('primary');
    }
  }

  public setActiveTab(tabId: 'ast' | 'tokens' | 'scopes' | 'console'): void {
    this.tabButtons.forEach((btn, id) => {
      btn.classList.toggle('active', id === tabId);
    });
  }

  private render(): void {
    const controls = document.createElement('div');
    controls.id = 'controls';

    // 1. Player Controls
    const playerGroup = document.createElement('div');
    playerGroup.className = 'controls-group';

    const resetBtn = this.createBtn(ICONS.reset, 'Reset', () => this.callbacks.onReset());
    const backBtn = this.createBtn(ICONS.back, 'Back', () => this.callbacks.onStepBackward());
    this.playBtn = this.createBtn(ICONS.play, 'Play', () => this.callbacks.onTogglePlay(), true);
    const stepBtn = this.createBtn(ICONS.step, 'Step', () => this.callbacks.onStepForward());

    this.stepCounter = document.createElement('span');
    this.stepCounter.className = 'step-counter-badge';
    this.stepCounter.textContent = 'Step 0/0';

    playerGroup.appendChild(resetBtn);
    playerGroup.appendChild(backBtn);
    playerGroup.appendChild(this.playBtn);
    playerGroup.appendChild(stepBtn);
    playerGroup.appendChild(this.stepCounter);
    controls.appendChild(playerGroup);

    // 2. Breadcrumbs Bar
    this.breadcrumbsContainer = document.createElement('div');
    this.breadcrumbsContainer.className = 'breadcrumbs-bar';
    controls.appendChild(this.breadcrumbsContainer);

    // 3. Tab Switcher
    const tabSwitcher = document.createElement('div');
    tabSwitcher.className = 'tab-switcher';

    const tabs: Array<{ id: 'ast' | 'tokens' | 'scopes' | 'console'; icon: string; label: string }> = [
      { id: 'ast', icon: ICONS.ast, label: 'AST Graph' },
      { id: 'tokens', icon: ICONS.tokens, label: 'Tokens' },
      { id: 'scopes', icon: ICONS.scopes, label: 'Scopes' },
      { id: 'console', icon: ICONS.console, label: 'Console' },
    ];

    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${t.id === 'ast' ? 'active' : ''}`;
      btn.innerHTML = `${t.icon} <span>${t.label}</span>`;
      btn.addEventListener('click', () => {
        this.setActiveTab(t.id);
        this.callbacks.onTabSelect(t.id);
      });
      this.tabButtons.set(t.id, btn);
      tabSwitcher.appendChild(btn);
    });

    controls.appendChild(tabSwitcher);
    this.container.appendChild(controls);
  }

  private createBtn(icon: string, label: string, onClick: () => void, isPrimary = false): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = isPrimary ? 'ctrl-btn primary' : 'ctrl-btn';
    btn.innerHTML = `${icon} <span>${label}</span>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }
}
