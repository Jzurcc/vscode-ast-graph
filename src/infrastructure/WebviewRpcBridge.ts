import * as vscode from 'vscode';
import { HostToWebviewMsg, WebviewToHostMsg } from '../shared/ProtocolMessages';
import { InterpreterSession } from '../application/InterpreterSession';

export class WebviewRpcBridge {
  private readonly webview: vscode.Webview;
  private readonly session: InterpreterSession;
  private readonly getEditor: () => vscode.TextEditor | undefined;
  private readonly getDocumentUri?: () => vscode.Uri | undefined;

  constructor(
    webview: vscode.Webview,
    session: InterpreterSession,
    getEditor: () => vscode.TextEditor | undefined,
    getDocumentUri?: () => vscode.Uri | undefined
  ) {
    this.webview = webview;
    this.session = session;
    this.getEditor = getEditor;
    this.getDocumentUri = getDocumentUri;
    this.setupListener();
  }

  public postMessage(message: HostToWebviewMsg): void {
    this.webview.postMessage(message);
  }

  private setupListener(): void {
    this.webview.onDidReceiveMessage((msg: WebviewToHostMsg) => {
      switch (msg.type) {
        case 'STEP_FORWARD':
          this.session.stepForward();
          break;
        case 'STEP_BACKWARD':
          this.session.stepBackward();
          break;
        case 'JUMP_TO_STEP':
          this.session.jumpToStep(msg.payload.stepIndex);
          break;
        case 'PLAY':
          this.session.startPlayback();
          break;
        case 'PAUSE':
          this.session.stopPlayback();
          break;
        case 'RESET':
          this.session.reset();
          break;
        case 'SELECT_NODE':
          this.revealInEditor(msg.payload.loc);
          break;
      }
    });
  }

  private async revealInEditor(loc: { start: { line: number; column: number }; end: { line: number; column: number } }): Promise<void> {
    let editor = this.getEditor();
    if (!editor && this.getDocumentUri) {
      const uri = this.getDocumentUri();
      if (uri) {
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
        } catch {
          // Ignore if document cannot be opened
        }
      }
    }
    if (!editor) return;

    const startPos = new vscode.Position(Math.max(0, loc.start.line - 1), Math.max(0, loc.start.column - 1));
    const endPos = new vscode.Position(Math.max(0, loc.end.line - 1), Math.max(0, loc.end.column - 1));
    const range = new vscode.Range(startPos, endPos);

    editor.selection = new vscode.Selection(startPos, endPos);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }
}
