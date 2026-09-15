export class ConsoleOutputView {
  private readonly container: HTMLElement;
  private consoleBox!: HTMLElement;
  private stdoutHistory: string[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  public getHistory(): string[] {
    return this.stdoutHistory;
  }

  public setOutput(stdoutHistory: string[], executionTimeMs?: number): void {
    this.stdoutHistory = stdoutHistory;
    this.consoleBox.innerHTML = '';

    if (stdoutHistory.length === 0) {
      this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// No output produced yet...</span>`;
      return;
    }

    const lines = stdoutHistory.map(line => `&gt; ${this.escape(line)}`).join('\n');
    let timingHtml = '';
    if (executionTimeMs !== undefined) {
      timingHtml = `\n\n<span style="color:var(--text-secondary);font-size:11px;">[Execution time: ${executionTimeMs} ms]</span>`;
    }
    this.consoleBox.innerHTML = lines + timingHtml;
  }

  public clear(): void {
    this.stdoutHistory = [];
    this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// Output cleared.</span>`;
  }

  private render(): void {
    const pane = document.createElement('div');
    pane.id = 'tab-console';
    pane.className = 'tab-pane';

    const content = document.createElement('div');
    content.className = 'console-pane-content';

    this.consoleBox = document.createElement('pre');
    this.consoleBox.className = 'console-box';
    this.consoleBox.innerHTML = `<span style="color:var(--text-secondary);font-style:italic;">// Console output will appear here...</span>`;

    content.appendChild(this.consoleBox);
    pane.appendChild(content);
    this.container.appendChild(pane);
  }

  private escape(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
