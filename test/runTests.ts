import assert from 'node:assert';
import { Lexer } from '../src/domain/lexer/Lexer';
import { Parser } from '../src/domain/parser/Parser';
import { TreeWalkEngine } from '../src/domain/interpreter/TreeWalkEngine';
import { TokenType } from '../src/domain/lexer/TokenType';
import { TypeScriptAstAdapter } from '../src/domain/parser/TypeScriptAstAdapter';
import { TreeSitterAstAdapter } from '../src/domain/parser/TreeSitterAstAdapter';
import { AstTableLayout } from '../src/domain/layout/AstTableLayout';
import { InterpreterSession } from '../src/application/InterpreterSession';

async function runAllTests(): Promise<void> {
  console.log('Running AST Visualizer & Interpreter Test Suite...\n');

  // 1. Lexer Tests
  console.log('--- 1. Lexer Test ---');
  const lexer = new Lexer('let x = 42 + 8; // comment\nprint(x);');
  const tokens = lexer.tokenize();
  assert.strictEqual(tokens[0].type, TokenType.LET);
  assert.strictEqual(tokens[1].lexeme, 'x');
  assert.strictEqual(tokens[2].type, TokenType.ASSIGN);
  assert.strictEqual(tokens[3].literal, 42);
  assert.strictEqual(tokens[4].type, TokenType.PLUS);
  assert.strictEqual(tokens[5].literal, 8);
  assert.strictEqual(tokens[6].type, TokenType.SEMICOLON);
  assert.strictEqual(tokens[7].type, TokenType.PRINT);
  console.log('Lexer tests passed.');

  // 2. Parser Tests
  console.log('\n--- 2. Parser Test ---');
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.body.length, 2);
  assert.strictEqual(ast.body[0].type, 'VariableDeclaration');
  assert.strictEqual(ast.body[1].type, 'PrintStatement');
  console.log('Parser tests passed.');

  // 3. TreeWalkEngine & Generator Step Execution
  console.log('\n--- 3. TreeWalkEngine & Step Execution Test ---');
  const code = `
let a = 5;
let b = 10;
fn sum(x, y) {
  return x + y;
}
let c = sum(a, b);
print(c);
`;

  const engineTokens = new Lexer(code).tokenize();
  const engineAst = new Parser(engineTokens).parse();
  const engine = new TreeWalkEngine();
  const generator = engine.execute(engineAst);

  const snapshots = [];
  for (const step of generator) {
    snapshots.push(step);
  }

  assert(snapshots.length > 10, 'Expected multiple execution steps');
  const lastSnapshot = snapshots[snapshots.length - 1];
  assert.strictEqual(lastSnapshot.stdoutHistory.length, 1);
  assert.strictEqual(lastSnapshot.stdoutHistory[0], '15');
  console.log(`TreeWalkEngine executed ${snapshots.length} steps. Standard output: ${lastSnapshot.stdoutHistory[0]}`);

  // 4. Control Flow & Loop Test
  console.log('\n--- 4. While Loop & Conditional Test ---');
  const loopCode = `
let count = 3;
let acc = 0;
while (count > 0) {
  acc = acc + count;
  count = count - 1;
}
print(acc);
`;
  const loopAst = new Parser(new Lexer(loopCode).tokenize()).parse();
  const loopGen = new TreeWalkEngine().execute(loopAst);
  let finalSnap = null;
  for (const s of loopGen) {
    finalSnap = s;
  }
  assert.strictEqual(finalSnap?.stdoutHistory[0], '6');
  console.log('Loop and arithmetic tests passed (3 + 2 + 1 = 6).');

  // 5. TypeScript & TSX AST Adapter Test
  console.log('\n--- 5. TypeScript & TSX AST Parsing Test ---');
  const tsxCode = `
import React, { useState } from 'react';

interface Props {
  initial?: number;
}

export function Counter({ initial = 0 }: Props) {
  const [val, setVal] = useState<number>(initial);
  return <button onClick={() => setVal(val + 1)}>{val}</button>;
}
`;

  const tsResult = TypeScriptAstAdapter.parse(tsxCode, 'Counter.tsx');
  assert.strictEqual(tsResult.ast.type, 'SourceFile');
  assert(tsResult.tokens.length > 20, 'Expected token stream to be generated from TSX');
  assert(tsResult.ast.children.length >= 3, 'Expected imports, interface, and function declaration');

  const tsRows = AstTableLayout.flattenAst(tsResult.ast);
  assert(tsRows.length > 15, 'Expected flattened table rows from TSX AST');

  const tsCategories = new Set(tsRows.map(r => r.category));
  assert(tsCategories.has('Module'), 'Expected Module category for imports/exports');
  assert(tsCategories.has('Fn'), 'Expected Fn category for Counter function');
  assert(tsCategories.has('Type'), 'Expected Type category for Props interface');

  const tsRails = AstTableLayout.computeRails(tsRows);
  assert(tsRails.length > 0, 'Expected SVG rails to be computed for TSX AST');
  console.log(`TypeScript & TSX tests passed: parsed ${tsRows.length} AST rows and ${tsRails.length} rails.`);

  // 6. Tree-sitter Python AST Adapter Test (with comments ignored)
  console.log('\n--- 6. Tree-sitter Python AST Parsing Test ---');
  const pythonCode = `
# Module level comment to ignore
import math

class Calculator:
    # Class docstring/comment
    def __init__(self, precision: int = 2):
        self.precision = precision # inline comment

    def hypotenuse(self, a: float, b: float) -> float:
        return round(math.sqrt(a ** 2 + b ** 2), self.precision)

calc = Calculator(4)
print(calc.hypotenuse(3.0, 4.0))
`;

  assert(TreeSitterAstAdapter.isSupported('python', 'calc.py'));
  const pyResult = await TreeSitterAstAdapter.parse(pythonCode, 'python', 'calc.py');
  assert.strictEqual(pyResult.ast.type, 'module');
  assert(pyResult.tokens.length > 15, 'Expected tokens to be extracted from Python source');
  assert(pyResult.ast.children.length >= 3, 'Expected import, class, and statement nodes');

  // Verify comments are filtered out
  const commentNodes = pyResult.ast.children.filter(c => c.type.includes('comment'));
  assert.strictEqual(commentNodes.length, 0, 'Expected no comment nodes in AST');
  const commentTokens = pyResult.tokens.filter(t => t.lexeme.startsWith('#'));
  assert.strictEqual(commentTokens.length, 0, 'Expected no comment tokens in token stream');

  const pyRows = AstTableLayout.flattenAst(pyResult.ast);
  assert(pyRows.length > 10, 'Expected flattened rows from Python AST');
  const pyCategories = new Set(pyRows.map(r => r.category));
  assert(pyCategories.has('Module'), 'Expected Module category in Python for import');
  assert(pyCategories.has('Type'), 'Expected Type category in Python for class');
  assert(pyCategories.has('Fn'), 'Expected Fn category in Python for functions');

  const pyRails = AstTableLayout.computeRails(pyRows);
  assert(pyRails.length > 0, 'Expected SVG rails for Python AST');
  console.log(`Python AST test passed: parsed ${pyRows.length} rows (comments ignored) and ${pyRails.length} rails (${pyResult.executionTimeMs}ms).`);

  // 7. Tree-sitter C / C++ AST Adapter Test
  console.log('\n--- 7. Tree-sitter C AST Parsing Test ---');
  const cCode = `
// Standard I/O include
#include <stdio.h>

/* Compute factorial */
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Result: %d\\n", factorial(5));
    return 0;
}
`;

  assert(TreeSitterAstAdapter.isSupported('c', 'main.c'));
  const cResult = await TreeSitterAstAdapter.parse(cCode, 'c', 'main.c');
  assert.strictEqual(cResult.ast.type, 'translation_unit');
  assert(cResult.tokens.length > 15, 'Expected tokens from C code');

  const cRows = AstTableLayout.flattenAst(cResult.ast);
  assert(cRows.length > 15, 'Expected rows from C AST');
  const cRails = AstTableLayout.computeRails(cRows);
  assert(cRails.length > 0, 'Expected rails for C AST');
  console.log(`C AST test passed: parsed ${cRows.length} rows and ${cRails.length} rails (${cResult.executionTimeMs}ms).`);

  // 8. Tree-sitter C# AST Adapter Test
  console.log('\n--- 8. Tree-sitter C# AST Parsing Test ---');
  const csCode = `
using System;

namespace DemoApp {
    public class Program {
        public static void Main(string[] args) {
            Console.WriteLine("Hello from C# AST Graph!");
        }
    }
}
`;

  assert(TreeSitterAstAdapter.isSupported('csharp', 'Program.cs'));
  const csResult = await TreeSitterAstAdapter.parse(csCode, 'csharp', 'Program.cs');
  assert.strictEqual(csResult.ast.type, 'compilation_unit');
  assert(csResult.tokens.length > 10, 'Expected tokens from C# code');

  const csRows = AstTableLayout.flattenAst(csResult.ast);
  assert(csRows.length > 10, 'Expected rows from C# AST');
  const csRails = AstTableLayout.computeRails(csRows);
  assert(csRails.length > 0, 'Expected rails for C# AST');
  console.log(`C# AST test passed: parsed ${csRows.length} rows and ${csRails.length} rails (${csResult.executionTimeMs}ms).`);

  // 9. Multi-Language InterpreterSession Routing & AST Traversal Stepping Test
  console.log('\n--- 9. Multi-Language Session Routing & Traversal Stepping Test ---');
  let latestSessionSnapshot: any = null;
  let lastStepIndex = -1;
  let lastTotalSteps = -1;

  const session = new InterpreterSession({
    onStepChanged: (snap, idx, total) => {
      latestSessionSnapshot = snap;
      lastStepIndex = idx;
      lastTotalSteps = total;
    },
    onPlayStateChanged: () => {},
    onError: (err) => { throw new Error(err); },
  });

  // JS/TS routing with traversal stepping
  const jsResult = await session.loadSource('const x = [1, 2, 3].map(n => n * 2);', 'test.js', 'javascript');
  assert(jsResult !== null);
  assert.strictEqual(jsResult.ast.type, 'SourceFile');
  assert(jsResult.snapshots.length > 0, 'Expected AST traversal steps for JavaScript');
  assert.strictEqual(lastStepIndex, 0);
  assert.strictEqual(lastTotalSteps, jsResult.snapshots.length);

  // Python routing with traversal stepping
  const pySessionResult = await session.loadSource('def greet(name):\n    # say hello\n    return f"Hello, {name}"', 'test.py', 'python');
  assert(pySessionResult !== null);
  assert.strictEqual(pySessionResult.ast.type, 'module');
  assert(pySessionResult.snapshots.length > 0, 'Expected AST traversal steps for Python');
  assert.strictEqual(lastStepIndex, 0);
  assert(latestSessionSnapshot !== null);
  assert(latestSessionSnapshot.scopes.length > 0, 'Expected active AST node scope frame');

  // Test stepping controls on Python AST
  session.stepForward();
  assert.strictEqual(lastStepIndex, 1);
  assert(latestSessionSnapshot.nodeId.length > 0);

  // C# routing with traversal stepping
  const csSessionResult = await session.loadSource('class Foo { int Bar = 42; }', 'test.cs', 'csharp');
  assert(csSessionResult !== null);
  assert.strictEqual(csSessionResult.ast.type, 'compilation_unit');
  assert(csSessionResult.snapshots.length > 0, 'Expected AST traversal steps for C#');

  // Toy language stepping execution routing
  const toyResult = await session.loadSource('let y = 10; print(y);', 'test.toy', 'toy');
  assert(toyResult !== null);
  assert.strictEqual(toyResult.ast.type, 'Program');
  assert(toyResult.snapshots.length > 0);
  console.log('Session multi-language routing and AST traversal stepping passed.');

  console.log('\nALL TESTS PASSED SUCCESSFULLY!\n');
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
