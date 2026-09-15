import assert from 'node:assert';
import { Lexer } from '../src/domain/lexer/Lexer';
import { Parser } from '../src/domain/parser/Parser';
import { TreeWalkEngine } from '../src/domain/interpreter/TreeWalkEngine';
import { TokenType } from '../src/domain/lexer/TokenType';

console.log('🧪 Running AST Visualizer & Interpreter Test Suite...\n');

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
console.log('✅ Lexer tests passed.');

// 2. Parser Tests
console.log('\n--- 2. Parser Test ---');
const parser = new Parser(tokens);
const ast = parser.parse();
assert.strictEqual(ast.type, 'Program');
assert.strictEqual(ast.body.length, 2);
assert.strictEqual(ast.body[0].type, 'VariableDeclaration');
assert.strictEqual(ast.body[1].type, 'PrintStatement');
console.log('✅ Parser tests passed.');

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
console.log(`✅ TreeWalkEngine executed ${snapshots.length} steps. Standard output: ${lastSnapshot.stdoutHistory[0]}`);

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
console.log('✅ Loop and arithmetic tests passed (3 + 2 + 1 = 6).');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
