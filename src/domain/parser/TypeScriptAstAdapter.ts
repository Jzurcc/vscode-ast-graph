import * as ts from 'typescript';
import { SourceLocation, createSourceLocation, createSourcePosition } from '../../shared/SourceLocation';
import { Token } from '../lexer/Token';

export interface GenericAstNode {
  id: string;
  type: string;
  category: 'Stmt' | 'Expr' | 'Literal' | 'Ident' | 'Fn' | 'Type' | 'Module';
  label: string;
  slot: string;
  loc: SourceLocation;
  children: GenericAstNode[];
  raw?: any;
}

export class TypeScriptAstAdapter {
  public static parse(
    sourceCode: string,
    fileName = 'source.tsx'
  ): { ast: GenericAstNode; tokens: Token[]; executionTimeMs: number } {
    const startTime = performance.now();
    const scriptKind = this.getScriptKind(fileName);

    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ true,
      scriptKind
    );

    let nextNodeId = 1;

    const convertNode = (node: ts.Node, slot = 'root'): GenericAstNode => {
      const id = `ts_${nextNodeId++}`;
      const kindName = ts.SyntaxKind[node.kind];
      const category = this.getCategory(node);
      const label = this.getLabel(node, sourceFile);
      const loc = this.getSourceLocation(node, sourceFile);

      const children: GenericAstNode[] = [];
      let childIdx = 0;

      ts.forEachChild(node, child => {
        if (child.kind !== ts.SyntaxKind.EndOfFileToken) {
          const childSlot = this.getChildSlot(node, child, childIdx++);
          children.push(convertNode(child, childSlot));
        }
      });

      return {
        id,
        type: kindName,
        category,
        label,
        slot,
        loc,
        children,
      };
    };

    const ast = convertNode(sourceFile, 'root');
    const tokens = this.extractTokens(sourceCode, sourceFile, scriptKind);
    const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return { ast, tokens, executionTimeMs };
  }

  private static getScriptKind(fileName: string): ts.ScriptKind {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.tsx')) return ts.ScriptKind.TSX;
    if (lower.endsWith('.jsx')) return ts.ScriptKind.JSX;
    if (lower.endsWith('.ts')) return ts.ScriptKind.TS;
    if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return ts.ScriptKind.JS;
    return ts.ScriptKind.TSX;
  }

  private static getSourceLocation(node: ts.Node, sourceFile: ts.SourceFile): SourceLocation {
    const startPos = node.getStart(sourceFile);
    const endPos = node.getEnd();
    const start = sourceFile.getLineAndCharacterOfPosition(startPos);
    const end = sourceFile.getLineAndCharacterOfPosition(endPos);

    return createSourceLocation(
      createSourcePosition(start.line + 1, start.character + 1, startPos),
      createSourcePosition(end.line + 1, end.character + 1, endPos)
    );
  }

  private static getCategory(node: ts.Node): 'Stmt' | 'Expr' | 'Literal' | 'Ident' | 'Fn' | 'Type' | 'Module' {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node)
    ) {
      return 'Fn';
    }

    if (
      ts.isTypeNode(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      return 'Type';
    }

    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isExportAssignment(node) ||
      ts.isImportEqualsDeclaration(node)
    ) {
      return 'Module';
    }

    if (ts.isIdentifier(node)) {
      return 'Ident';
    }

    if (
      ts.isLiteralExpression(node) ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword
    ) {
      return 'Literal';
    }

    if (ts.isExpression(node) || ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      return 'Expr';
    }

    return 'Stmt';
  }

  private static getLabel(node: ts.Node, sourceFile: ts.SourceFile): string {
    const kind = node.kind;

    if (ts.isSourceFile(node)) {
      return 'SourceFile';
    }

    if (ts.isIdentifier(node)) {
      return node.text;
    }

    if (ts.isLiteralExpression(node)) {
      return node.text;
    }

    if (ts.isVariableStatement(node)) {
      const decls = node.declarationList.declarations;
      const names = decls.map(d => d.name.getText(sourceFile)).join(', ');
      const keyword = node.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let';
      return `${keyword} ${names}`;
    }

    if (ts.isFunctionDeclaration(node)) {
      const name = node.name ? node.name.text : 'anonymous';
      return `fn ${name}(…)`;
    }

    if (ts.isArrowFunction(node)) {
      return 'arrow (… => …)';
    }

    if (ts.isClassDeclaration(node)) {
      return `class ${node.name ? node.name.text : ''}`;
    }

    if (ts.isImportDeclaration(node)) {
      return `import from ${node.moduleSpecifier.getText(sourceFile)}`;
    }

    if (ts.isExportDeclaration(node)) {
      return 'export …';
    }

    if (ts.isBinaryExpression(node)) {
      return `op '${node.operatorToken.getText(sourceFile)}'`;
    }

    if (ts.isCallExpression(node)) {
      const exprName = node.expression.getText(sourceFile);
      const truncated = exprName.length > 20 ? exprName.slice(0, 17) + '…' : exprName;
      return `${truncated}(…)`;
    }

    if (ts.isJsxElement(node)) {
      return `<${node.openingElement.tagName.getText(sourceFile)}> … </${node.closingElement.tagName.getText(sourceFile)}>`;
    }

    if (ts.isJsxSelfClosingElement(node)) {
      return `<${node.tagName.getText(sourceFile)} />`;
    }

    if (ts.isIfStatement(node)) {
      return 'if (condition)';
    }

    if (ts.isWhileStatement(node) || ts.isForStatement(node) || ts.isForOfStatement(node)) {
      return 'loop';
    }

    if (ts.isReturnStatement(node)) {
      return node.expression ? 'return expr' : 'return';
    }

    return ts.SyntaxKind[kind];
  }

  private static getChildSlot(parent: ts.Node, child: ts.Node, index: number): string {
    if (ts.isSourceFile(parent)) return `stmt[${index}]`;
    if (ts.isBlock(parent)) return `stmt[${index}]`;
    if (ts.isBinaryExpression(parent)) {
      if (child === parent.left) return 'left';
      if (child === parent.right) return 'right';
      if (child === parent.operatorToken) return 'operator';
    }
    if (ts.isCallExpression(parent)) {
      if (child === parent.expression) return 'callee';
      return `arg[${index - 1}]`;
    }
    if (ts.isIfStatement(parent)) {
      if (child === parent.expression) return 'condition';
      if (child === parent.thenStatement) return 'then';
      if (child === parent.elseStatement) return 'else';
    }
    if (ts.isReturnStatement(parent)) return 'value';
    if (ts.isVariableStatement(parent)) return 'declarations';
    if (ts.isVariableDeclaration(parent)) {
      if (child === parent.name) return 'name';
      if (child === parent.initializer) return 'init';
    }
    return `child[${index}]`;
  }

  private static extractTokens(sourceCode: string, sourceFile: ts.SourceFile, scriptKind: ts.ScriptKind): Token[] {
    const isJsx = scriptKind === ts.ScriptKind.TSX || scriptKind === ts.ScriptKind.JSX;
    const scanner = ts.createScanner(
      ts.ScriptTarget.Latest,
      /*skipTrivia*/ true,
      isJsx ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard,
      sourceCode
    );

    const tokens: Token[] = [];
    let token = scanner.scan();

    while (token !== ts.SyntaxKind.EndOfFileToken) {
      const start = scanner.getTokenPos();
      const end = scanner.getTextPos();
      const text = scanner.getTokenText();
      const startLc = sourceFile.getLineAndCharacterOfPosition(start);
      const endLc = sourceFile.getLineAndCharacterOfPosition(end);

      tokens.push({
        type: ts.SyntaxKind[token] as any,
        lexeme: text,
        literal: null,
        loc: createSourceLocation(
          createSourcePosition(startLc.line + 1, startLc.character + 1, start),
          createSourcePosition(endLc.line + 1, endLc.character + 1, end)
        ),
      });

      token = scanner.scan();
    }

    return tokens;
  }
}
