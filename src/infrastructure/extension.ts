import * as vscode from 'vscode';
import { WebviewPanelManager } from './WebviewPanelManager';

const DEFAULT_SAMPLE = `// Sample Toy Program for AST & Tree-Walk Execution
let count = 3;
let total = 0;

fn addSquare(base, num) {
  return base + (num * num);
}

while (count > 0) {
  total = addSquare(total, count);
  print(total);
  count = count - 1;
}

if (total > 10) {
  print("Execution finished with grand total!");
}
`;

export function activate(context: vscode.ExtensionContext): void {
  const panelManager = new WebviewPanelManager(context.extensionUri);

  const openVisualizer = async () => {
    const editor = vscode.window.activeTextEditor;
    const code = editor ? editor.document.getText() : DEFAULT_SAMPLE;
    await panelManager.show(code, editor);
  };

  const primaryCmd = vscode.commands.registerCommand('astGraph.view', openVisualizer);
  const legacyCmd = vscode.commands.registerCommand('astVisualizer.open', openVisualizer);

  context.subscriptions.push(primaryCmd, legacyCmd);
}

export function deactivate(): void {}
