import * as vscode from 'vscode';
import { InterpreterSession } from '../application/InterpreterSession';
import { WebviewRpcBridge } from './WebviewRpcBridge';

export class WebviewPanelManager {
  private panel: vscode.WebviewPanel | null = null;
  private bridge: WebviewRpcBridge | null = null;
  private session: InterpreterSession | null = null;
  private targetUri: vscode.Uri | null = null;
  private readonly extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  public show(sourceCode: string, activeEditor: vscode.TextEditor | undefined): void {
    if (activeEditor) {
      this.targetUri = activeEditor.document.uri;
    }

    const column = vscode.ViewColumn.Active;

    if (this.panel) {
      this.panel.reveal(column);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'astGraph',
        'AST Graph',
        column,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [this.extensionUri],
        }
      );

      this.panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'resources', 'icon.png');

      this.session = new InterpreterSession({
        onStepChanged: (_snapshot, index) => {
          this.bridge?.postMessage({
            type: 'UPDATE_STEP',
            payload: { stepIndex: index },
          });
        },
        onPlayStateChanged: (isPlaying) => {
          this.bridge?.postMessage({
            type: 'PLAY_STATE_CHANGED',
            payload: { isPlaying },
          });
        },
        onError: (message, loc) => {
          this.bridge?.postMessage({
            type: 'REPORT_ERROR',
            payload: { message, loc },
          });
        },
      });

      this.bridge = new WebviewRpcBridge(
        this.panel.webview,
        this.session,
        () => vscode.window.activeTextEditor,
        () => this.targetUri ?? undefined
      );

      this.panel.webview.html = this.getHtmlContent(this.panel.webview);

      this.panel.onDidDispose(() => {
        this.session?.dispose();
        this.panel = null;
        this.bridge = null;
        this.session = null;
      });
    }

    if (this.session && this.bridge) {
      const fileName = activeEditor?.document.fileName ?? 'source.toy';
      const languageId = activeEditor?.document.languageId ?? 'toy';
      const result = this.session.loadSource(sourceCode, fileName, languageId);
      if (result) {
        this.bridge.postMessage({
          type: 'INIT_PROGRAM',
          payload: {
            ast: result.ast,
            code: sourceCode,
            tokens: result.tokens,
            snapshots: result.snapshots,
            executionTimeMs: result.executionTimeMs,
          },
        });
      }
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src data:; img-src data: https:;">
  <title>AST Visualizer</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
