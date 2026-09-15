import Parser from 'web-tree-sitter';
import * as fs from 'fs';
import * as path from 'path';
import { SourceLocation, createSourceLocation, createSourcePosition } from '../../shared/SourceLocation';
import { Token } from '../lexer/Token';
import { GenericAstNode } from './TypeScriptAstAdapter';

export class TreeSitterAstAdapter {
  private static initialized = false;
  private static parsers: Map<string, Parser> = new Map();
  private static languages: Map<string, Parser.Language> = new Map();

  public static isSupported(languageId: string, fileName = ''): boolean {
    return this.getLanguageWasmName(languageId, fileName) !== null;
  }

  public static async parse(
    sourceCode: string,
    languageId: string,
    fileName = 'source'
  ): Promise<{ ast: GenericAstNode; tokens: Token[]; executionTimeMs: number }> {
    const startTime = performance.now();
    await this.ensureInitialized();

    const wasmName = this.getLanguageWasmName(languageId, fileName);
    if (!wasmName) {
      throw new Error(`Unsupported Tree-sitter language: ${languageId || fileName}`);
    }

    const parser = await this.getParser(wasmName);
    const tree = parser.parse(sourceCode);

    let nextNodeId = 1;

    const convert = (node: Parser.SyntaxNode, slot = 'root'): GenericAstNode => {
      const id = `node_${nextNodeId++}`;
      const category = this.getCategory(node);
      const label = this.getLabel(node);
      const loc = createSourceLocation(
        createSourcePosition(node.startPosition.row + 1, node.startPosition.column + 1, node.startIndex),
        createSourcePosition(node.endPosition.row + 1, node.endPosition.column + 1, node.endIndex)
      );

      const children: GenericAstNode[] = [];
      const count = node.namedChildCount > 0 ? node.namedChildCount : node.childCount;

      for (let i = 0; i < count; i++) {
        const child = node.namedChildCount > 0 ? node.namedChild(i)! : node.child(i)!;
        const fieldName = node.fieldNameForChild(i);
        const childSlot = fieldName ?? (node.namedChildCount > 0 ? `child[${i}]` : `token[${i}]`);
        children.push(convert(child, childSlot));
      }

      return {
        id,
        type: node.type,
        category,
        label,
        slot,
        loc,
        children,
      };
    };

    const ast = convert(tree.rootNode, 'root');
    const tokens: Token[] = [];
    this.extractTokens(tree.rootNode, tokens);
    const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    return { ast, tokens, executionTimeMs };
  }

  private static async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const mainWasmPath = this.findWasm('tree-sitter.wasm');
    await Parser.init({
      locateFile: (scriptName) => {
        if (scriptName === 'tree-sitter.wasm') return mainWasmPath;
        return this.findWasm(scriptName);
      },
    });

    this.initialized = true;
  }

  private static async getParser(wasmName: string): Promise<Parser> {
    const existing = this.parsers.get(wasmName);
    if (existing) return existing;

    let lang = this.languages.get(wasmName);
    if (!lang) {
      const wasmPath = this.findWasm(wasmName);
      lang = await Parser.Language.load(wasmPath);
      this.languages.set(wasmName, lang);
    }

    const parser = new Parser();
    parser.setLanguage(lang);
    this.parsers.set(wasmName, parser);
    return parser;
  }

  private static getLanguageWasmName(languageId: string, fileName: string): string | null {
    const lid = (languageId || '').toLowerCase();
    const ext = path.extname(fileName).toLowerCase();

    // Python
    if (lid === 'python' || ext === '.py') return 'tree-sitter-python.wasm';

    // C
    if (lid === 'c' || ext === '.c' || ext === '.h') return 'tree-sitter-c.wasm';

    // C++
    if (
      lid === 'cpp' ||
      ext === '.cpp' ||
      ext === '.cc' ||
      ext === '.cxx' ||
      ext === '.hpp' ||
      ext === '.hxx'
    ) {
      return 'tree-sitter-cpp.wasm';
    }

    // C#
    if (lid === 'csharp' || lid === 'c#' || ext === '.cs') return 'tree-sitter-c_sharp.wasm';

    // Rust
    if (lid === 'rust' || ext === '.rs') return 'tree-sitter-rust.wasm';

    // Go
    if (lid === 'go' || ext === '.go') return 'tree-sitter-go.wasm';

    // Java
    if (lid === 'java' || ext === '.java') return 'tree-sitter-java.wasm';

    // Ruby
    if (lid === 'ruby' || ext === '.rb') return 'tree-sitter-ruby.wasm';

    // PHP
    if (lid === 'php' || ext === '.php') return 'tree-sitter-php.wasm';

    // Bash / Shell
    if (lid === 'shellscript' || lid === 'bash' || ext === '.sh' || ext === '.bash') {
      return 'tree-sitter-bash.wasm';
    }

    // JSON
    if (lid === 'json' || ext === '.json') return 'tree-sitter-json.wasm';

    // YAML
    if (lid === 'yaml' || ext === '.yaml' || ext === '.yml') return 'tree-sitter-yaml.wasm';

    // TOML
    if (lid === 'toml' || ext === '.toml') return 'tree-sitter-toml.wasm';

    return null;
  }

  private static findWasm(filename: string): string {
    const candidates = [
      path.join(__dirname, 'wasm', filename),
      path.join(__dirname, '..', 'wasm', filename),
      path.join(__dirname, '..', '..', 'wasm', filename),
      path.join(__dirname, '..', '..', 'dist', 'wasm', filename),
      path.join(__dirname, '..', '..', '..', 'dist', 'wasm', filename),
      path.join(process.cwd(), 'dist', 'wasm', filename),
      filename === 'tree-sitter.wasm'
        ? path.join(process.cwd(), 'node_modules', 'web-tree-sitter', 'tree-sitter.wasm')
        : path.join(process.cwd(), 'node_modules', 'tree-sitter-wasms', 'out', filename),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }

    throw new Error(`Tree-sitter WASM binary not found: ${filename}`);
  }

  private static getCategory(node: Parser.SyntaxNode): 'Stmt' | 'Expr' | 'Literal' | 'Ident' | 'Fn' | 'Type' | 'Module' {
    const t = node.type.toLowerCase();

    if (t.includes('function') || t.includes('method') || t.includes('constructor') || t.includes('lambda')) {
      return 'Fn';
    }

    if (
      t.includes('type') ||
      t.includes('class') ||
      t.includes('struct') ||
      t.includes('interface') ||
      t.includes('enum') ||
      t.includes('typedef')
    ) {
      return 'Type';
    }

    if (
      t.includes('import') ||
      t.includes('include') ||
      t.includes('using') ||
      t.includes('package') ||
      t.includes('namespace') ||
      t.includes('export')
    ) {
      return 'Module';
    }

    if (t.includes('identifier') || t === 'name' || t === 'field_identifier' || t === 'type_identifier') {
      return 'Ident';
    }

    if (
      t.includes('literal') ||
      t.includes('string') ||
      t.includes('number') ||
      t === 'integer' ||
      t === 'float' ||
      t === 'true' ||
      t === 'false' ||
      t === 'null' ||
      t === 'none'
    ) {
      return 'Literal';
    }

    if (t.includes('expression') || t.includes('call') || t.includes('binary') || t.includes('unary')) {
      return 'Expr';
    }

    return 'Stmt';
  }

  private static getLabel(node: Parser.SyntaxNode): string {
    const type = node.type;

    if (node.namedChildCount === 0) {
      const text = node.text.replace(/\r?\n/g, ' ').trim();
      return text.length > 25 ? text.slice(0, 22) + '…' : text || type;
    }

    if (type.includes('function') || type.includes('method')) {
      const nameNode = node.childForFieldName('name') || node.children.find(c => c.type.includes('identifier'));
      return nameNode ? `fn ${nameNode.text}(…)` : 'fn (…)';
    }

    if (type.includes('class') || type.includes('struct')) {
      const nameNode = node.childForFieldName('name') || node.children.find(c => c.type.includes('identifier'));
      return nameNode ? `${type.replace(/_/g, ' ')} ${nameNode.text}` : type;
    }

    if (type.includes('import') || type.includes('include')) {
      const mod = node.childForFieldName('module') || node.childForFieldName('path') || node.namedChild(0);
      return mod ? `${type.replace(/_/g, ' ')} ${mod.text}` : type;
    }

    if (type.includes('binary')) {
      const op = node.childForFieldName('operator');
      return op ? `op '${op.text}'` : type;
    }

    if (type.includes('call')) {
      const fn = node.childForFieldName('function') || node.namedChild(0);
      const name = fn ? fn.text : 'call';
      const truncated = name.length > 20 ? name.slice(0, 17) + '…' : name;
      return `${truncated}(…)`;
    }

    return type.replace(/_/g, ' ');
  }

  private static extractTokens(node: Parser.SyntaxNode, tokens: Token[]): void {
    if (node.childCount === 0) {
      const text = node.text.trim();
      if (text.length > 0) {
        tokens.push({
          type: node.type as any,
          lexeme: node.text,
          literal: null,
          loc: createSourceLocation(
            createSourcePosition(node.startPosition.row + 1, node.startPosition.column + 1, node.startIndex),
            createSourcePosition(node.endPosition.row + 1, node.endPosition.column + 1, node.endIndex)
          ),
        });
      }
    } else {
      for (let i = 0; i < node.childCount; i++) {
        this.extractTokens(node.child(i)!, tokens);
      }
    }
  }
}
