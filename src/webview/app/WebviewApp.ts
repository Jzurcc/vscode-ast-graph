import { APP_STYLES } from '../styles/styles';
import { HostToWebviewMsg, WebviewToHostMsg } from '../../shared/ProtocolMessages';
import { StepSnapshot } from '../../shared/StepSnapshot';
import { ProgramNode, ASTNode } from '../../shared/AstNodeTypes';
import { Token } from '../../domain/lexer/Token';
import { TopControlsToolbar } from './TopControlsToolbar';
import { AstTableGraphRenderer } from './AstTableGraphRenderer';
import { TokenMatrixView } from './TokenMatrixView';
import { ScopeChainView } from './ScopeChainView';
import { ConsoleOutputView } from './ConsoleOutputView';

declare function acquireVsCodeApi(): {
  postMessage: (msg: WebviewToHostMsg) => void;
  setState: (state: any) => void;
  getState: () => any;
};

class WebviewApp {
  private readonly vscode = acquireVsCodeApi();
  private toolbar!: TopControlsToolbar;
  private astRenderer!: AstTableGraphRenderer;
  private tokenView!: TokenMatrixView;
  private scopeView!: ScopeChainView;
  private consoleView!: ConsoleOutputView;
  private snapshots: StepSnapshot[] = [];
  private currentStepIndex = 0;
  private isPlaying = false;
  private activeProgram: ProgramNode | null = null;
  private executionTimeMs = 0;

  constructor() {
    this.injectStyles();
    this.buildDom();
    this.setupMessageBridge();
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  private injectStyles(): void {
    const styleEl = document.createElement('style');
    styleEl.textContent = APP_STYLES;
    document.head.appendChild(styleEl);
  }

  private buildDom(): void {
    const root = document.getElementById('root') || document.body;
    root.innerHTML = '';

    const view = document.createElement('div');
    view.id = 'view';

    // 1. Top Controls Toolbar
    this.toolbar = new TopControlsToolbar(view, {
      onStepForward: () => this.vscode.postMessage({ type: 'STEP_FORWARD' }),
      onStepBackward: () => this.vscode.postMessage({ type: 'STEP_BACKWARD' }),
      onTogglePlay: () => {
        this.isPlaying = !this.isPlaying;
        this.toolbar.updatePlayButton(this.isPlaying);
        this.vscode.postMessage({ type: this.isPlaying ? 'PLAY' : 'PAUSE' });
      },
      onReset: () => {
        this.isPlaying = false;
        this.toolbar.updatePlayButton(false);
        this.vscode.postMessage({ type: 'RESET' });
      },
      onTabSelect: (tabId) => this.switchTab(tabId),
    });

    // 2. Tab Viewport Container
    const tabViewport = document.createElement('div');
    tabViewport.className = 'tab-viewport';

    this.astRenderer = new AstTableGraphRenderer(tabViewport, (_nodeId, loc) => {
      this.vscode.postMessage({ type: 'SELECT_NODE', payload: { nodeId: _nodeId, loc } });
    });

    this.tokenView = new TokenMatrixView(tabViewport, (loc) => {
      this.vscode.postMessage({ type: 'SELECT_NODE', payload: { nodeId: '', loc } });
    });

    this.scopeView = new ScopeChainView(tabViewport);
    this.consoleView = new ConsoleOutputView(tabViewport);

    view.appendChild(tabViewport);
    root.appendChild(view);
  }

  private switchTab(tabId: 'ast' | 'tokens' | 'scopes' | 'console'): void {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`tab-${tabId}`);
    target?.classList.add('active');
  }

  private setupMessageBridge(): void {
    window.addEventListener('message', (event) => {
      const msg = event.data as HostToWebviewMsg;
      switch (msg.type) {
        case 'INIT_PROGRAM':
          this.initProgram(msg.payload.ast, msg.payload.tokens, msg.payload.snapshots, msg.payload.executionTimeMs);
          break;
        case 'UPDATE_STEP':
          this.syncStep(msg.payload.stepIndex);
          break;
        case 'PLAY_STATE_CHANGED':
          this.isPlaying = msg.payload.isPlaying;
          this.toolbar.updatePlayButton(this.isPlaying);
          break;
        case 'REPORT_ERROR':
          alert(`Error: ${msg.payload.message}`);
          break;
      }
    });

    this.vscode.postMessage({ type: 'WEBVIEW_READY' });
  }

  private initProgram(ast: ProgramNode, tokens: Token[], snapshots: StepSnapshot[], executionTimeMs: number): void {
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

  private syncStep(index: number): void {
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

  private buildBreadcrumbs(targetNodeId: string): string[] {
    if (!this.activeProgram) return ['Program'];
    const path: string[] = [];

    const findPath = (node: ASTNode): boolean => {
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
    return path.length > 0 ? path : ['Program'];
  }

  private getChildren(node: ASTNode): ASTNode[] {
    switch (node.type) {
      case 'Program': return node.body;
      case 'VariableDeclaration': return [node.initializer];
      case 'Assignment': return [node.value];
      case 'PrintStatement': return [node.expression];
      case 'ExpressionStatement': return [node.expression];
      case 'BlockStatement': return node.body;
      case 'IfStatement': return node.alternate ? [node.condition, node.consequent, node.alternate] : [node.condition, node.consequent];
      case 'WhileStatement': return [node.condition, node.body];
      case 'FunctionDeclaration': return [node.body];
      case 'ReturnStatement': return node.value ? [node.value] : [];
      case 'BinaryExpression': return [node.left, node.right];
      case 'UnaryExpression': return [node.argument];
      case 'CallExpression': return node.args;
      default: return [];
    }
  }
}

// Instantiate on load
new WebviewApp();
