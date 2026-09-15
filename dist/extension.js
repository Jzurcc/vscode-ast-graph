"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/infrastructure/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode3 = __toESM(require("vscode"));

// src/infrastructure/WebviewPanelManager.ts
var vscode2 = __toESM(require("vscode"));

// src/domain/lexer/Token.ts
var createToken = (type, lexeme, literal, loc) => ({
  type,
  lexeme,
  literal,
  loc
});

// src/shared/SourceLocation.ts
var createSourcePosition = (line, column, offset) => ({
  line,
  column,
  offset
});
var createSourceLocation = (start, end) => ({
  start,
  end
});

// src/domain/lexer/Lexer.ts
var KEYWORDS = {
  let: "LET" /* LET */,
  if: "IF" /* IF */,
  else: "ELSE" /* ELSE */,
  while: "WHILE" /* WHILE */,
  fn: "FN" /* FN */,
  return: "RETURN" /* RETURN */,
  print: "PRINT" /* PRINT */,
  true: "TRUE" /* TRUE */,
  false: "FALSE" /* FALSE */,
  null: "NULL" /* NULL */
};
var Lexer = class {
  source;
  tokens = [];
  start = 0;
  current = 0;
  line = 1;
  lineStart = 0;
  constructor(source) {
    this.source = source;
  }
  tokenize() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    const endPos = this.getPosition(this.current);
    this.tokens.push(createToken("EOF" /* EOF */, "", null, createSourceLocation(endPos, endPos)));
    return this.tokens;
  }
  scanToken() {
    const char = this.advance();
    switch (char) {
      case "(":
        this.addToken("LPAREN" /* LPAREN */);
        break;
      case ")":
        this.addToken("RPAREN" /* RPAREN */);
        break;
      case "{":
        this.addToken("LBRACE" /* LBRACE */);
        break;
      case "}":
        this.addToken("RBRACE" /* RBRACE */);
        break;
      case ",":
        this.addToken("COMMA" /* COMMA */);
        break;
      case ";":
        this.addToken("SEMICOLON" /* SEMICOLON */);
        break;
      case "+":
        this.addToken("PLUS" /* PLUS */);
        break;
      case "-":
        this.addToken("MINUS" /* MINUS */);
        break;
      case "*":
        this.addToken("STAR" /* STAR */);
        break;
      case "%":
        this.addToken("PERCENT" /* PERCENT */);
        break;
      case "!":
        this.addToken(this.match("=") ? "NOT_EQUAL" /* NOT_EQUAL */ : "BANG" /* BANG */);
        break;
      case "=":
        this.addToken(this.match("=") ? "EQUAL" /* EQUAL */ : "ASSIGN" /* ASSIGN */);
        break;
      case "<":
        this.addToken(this.match("=") ? "LESS_EQUAL" /* LESS_EQUAL */ : "LESS" /* LESS */);
        break;
      case ">":
        this.addToken(this.match("=") ? "GREATER_EQUAL" /* GREATER_EQUAL */ : "GREATER" /* GREATER */);
        break;
      case "/":
        if (this.match("/")) {
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken("SLASH" /* SLASH */);
        }
        break;
      case " ":
      case "\r":
      case "	":
        break;
      case "\n":
        this.line++;
        this.lineStart = this.current;
        break;
      case '"':
        this.scanString();
        break;
      default:
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char)) {
          this.scanIdentifier();
        } else {
          this.addToken("ILLEGAL" /* ILLEGAL */);
        }
    }
  }
  scanString() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.lineStart = this.current;
      }
      this.advance();
    }
    if (this.isAtEnd()) {
      this.addToken("ILLEGAL" /* ILLEGAL */);
      return;
    }
    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken("STRING" /* STRING */, value);
  }
  scanNumber() {
    while (this.isDigit(this.peek())) this.advance();
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    this.addToken("NUMBER" /* NUMBER */, parseFloat(text));
  }
  scanIdentifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] ?? "IDENTIFIER" /* IDENTIFIER */;
    let literal = null;
    if (type === "TRUE" /* TRUE */) literal = true;
    if (type === "FALSE" /* FALSE */) literal = false;
    this.addToken(type, literal);
  }
  match(expected) {
    if (this.isAtEnd() || this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }
  peek() {
    return this.isAtEnd() ? "\0" : this.source.charAt(this.current);
  }
  peekNext() {
    return this.current + 1 >= this.source.length ? "\0" : this.source.charAt(this.current + 1);
  }
  advance() {
    return this.source.charAt(this.current++);
  }
  isAtEnd() {
    return this.current >= this.source.length;
  }
  isDigit(char) {
    return char >= "0" && char <= "9";
  }
  isAlpha(char) {
    return char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char === "_";
  }
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }
  getPosition(offset) {
    return createSourcePosition(this.line, offset - this.lineStart + 1, offset);
  }
  addToken(type, literal = null) {
    const lexeme = this.source.substring(this.start, this.current);
    const loc = createSourceLocation(
      createSourcePosition(this.line, this.start - this.lineStart + 1, this.start),
      createSourcePosition(this.line, this.current - this.lineStart + 1, this.current)
    );
    this.tokens.push(createToken(type, lexeme, literal, loc));
  }
};

// src/domain/parser/ParseError.ts
var ParseError = class _ParseError extends Error {
  loc;
  constructor(message, loc) {
    super(`${message} at line ${loc.start.line}:${loc.start.column}`);
    this.name = "ParseError";
    this.loc = loc;
    Object.setPrototypeOf(this, _ParseError.prototype);
  }
};

// src/domain/parser/TokenStream.ts
var TokenStream = class {
  tokens;
  current = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  isAtEnd() {
    return this.peek().type === "EOF" /* EOF */;
  }
  peek() {
    return this.tokens[this.current];
  }
  previous() {
    return this.tokens[this.current - 1];
  }
  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new ParseError(message, this.peek().loc);
  }
};

// src/domain/parser/ExpressionParser.ts
var ExpressionParser = class {
  stream;
  genId;
  constructor(stream, genId2) {
    this.stream = stream;
    this.genId = genId2;
  }
  parse() {
    return this.equality();
  }
  equality() {
    let expr = this.comparison();
    while (this.stream.match("EQUAL" /* EQUAL */, "NOT_EQUAL" /* NOT_EQUAL */)) {
      const op = this.stream.previous().lexeme;
      const right = this.comparison();
      expr = {
        id: this.genId("bin"),
        type: "BinaryExpression",
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end)
      };
    }
    return expr;
  }
  comparison() {
    let expr = this.term();
    while (this.stream.match("GREATER" /* GREATER */, "GREATER_EQUAL" /* GREATER_EQUAL */, "LESS" /* LESS */, "LESS_EQUAL" /* LESS_EQUAL */)) {
      const op = this.stream.previous().lexeme;
      const right = this.term();
      expr = {
        id: this.genId("bin"),
        type: "BinaryExpression",
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end)
      };
    }
    return expr;
  }
  term() {
    let expr = this.factor();
    while (this.stream.match("PLUS" /* PLUS */, "MINUS" /* MINUS */)) {
      const op = this.stream.previous().lexeme;
      const right = this.factor();
      expr = {
        id: this.genId("bin"),
        type: "BinaryExpression",
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end)
      };
    }
    return expr;
  }
  factor() {
    let expr = this.unary();
    while (this.stream.match("STAR" /* STAR */, "SLASH" /* SLASH */, "PERCENT" /* PERCENT */)) {
      const op = this.stream.previous().lexeme;
      const right = this.unary();
      expr = {
        id: this.genId("bin"),
        type: "BinaryExpression",
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end)
      };
    }
    return expr;
  }
  unary() {
    if (this.stream.match("BANG" /* BANG */, "MINUS" /* MINUS */)) {
      const opToken = this.stream.previous();
      const op = opToken.lexeme;
      const right = this.unary();
      return {
        id: this.genId("unary"),
        type: "UnaryExpression",
        operator: op,
        argument: right,
        loc: createSourceLocation(opToken.loc.start, right.loc.end)
      };
    }
    return this.callOrPrimary();
  }
  callOrPrimary() {
    const primary = this.primary();
    if (primary.type === "Identifier" && this.stream.match("LPAREN" /* LPAREN */)) {
      const args = [];
      if (!this.stream.check("RPAREN" /* RPAREN */)) {
        do {
          args.push(this.parse());
        } while (this.stream.match("COMMA" /* COMMA */));
      }
      this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after arguments");
      return {
        id: this.genId("call"),
        type: "CallExpression",
        callee: primary.name,
        args,
        loc: createSourceLocation(primary.loc.start, this.stream.previous().loc.end)
      };
    }
    return primary;
  }
  primary() {
    const tok = this.stream.peek();
    if (this.stream.match("NUMBER" /* NUMBER */, "STRING" /* STRING */, "TRUE" /* TRUE */, "FALSE" /* FALSE */, "NULL" /* NULL */)) {
      return {
        id: this.genId("lit"),
        type: "Literal",
        value: this.stream.previous().literal,
        raw: this.stream.previous().lexeme,
        loc: this.stream.previous().loc
      };
    }
    if (this.stream.match("IDENTIFIER" /* IDENTIFIER */)) {
      return {
        id: this.genId("id"),
        type: "Identifier",
        name: this.stream.previous().lexeme,
        loc: this.stream.previous().loc
      };
    }
    if (this.stream.match("LPAREN" /* LPAREN */)) {
      const expr = this.parse();
      this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after expression");
      return expr;
    }
    throw new ParseError(`Unexpected token '${tok.lexeme}'`, tok.loc);
  }
};

// src/domain/parser/Parser.ts
var nextNodeId = 1;
var genId = (prefix) => `${prefix}_${nextNodeId++}`;
var Parser = class {
  stream;
  exprParser;
  constructor(tokens) {
    this.stream = new TokenStream(tokens);
    nextNodeId = 1;
    this.exprParser = new ExpressionParser(this.stream, genId);
  }
  parse() {
    const statements = [];
    const startLoc = this.stream.peek().loc;
    while (!this.stream.isAtEnd()) {
      statements.push(this.statement());
    }
    const endLoc = this.stream.previous().loc;
    return {
      id: genId("program"),
      type: "Program",
      body: statements,
      loc: createSourceLocation(startLoc.start, endLoc.end)
    };
  }
  statement() {
    if (this.stream.match("LET" /* LET */)) return this.varDeclaration();
    if (this.stream.match("IF" /* IF */)) return this.ifStatement();
    if (this.stream.match("WHILE" /* WHILE */)) return this.whileStatement();
    if (this.stream.match("FN" /* FN */)) return this.fnDeclaration();
    if (this.stream.match("RETURN" /* RETURN */)) return this.returnStatement();
    if (this.stream.match("PRINT" /* PRINT */)) return this.printStatement();
    if (this.stream.match("LBRACE" /* LBRACE */)) return this.blockStatement();
    return this.expressionOrAssignment();
  }
  varDeclaration() {
    const startLoc = this.stream.previous().loc;
    const nameToken = this.stream.consume("IDENTIFIER" /* IDENTIFIER */, "Expect variable name after 'let'");
    this.stream.consume("ASSIGN" /* ASSIGN */, "Expect '=' after variable name");
    const init = this.exprParser.parse();
    this.stream.consume("SEMICOLON" /* SEMICOLON */, "Expect ';' after variable declaration");
    return {
      id: genId("var"),
      type: "VariableDeclaration",
      identifier: nameToken.lexeme,
      initializer: init,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  ifStatement() {
    const startLoc = this.stream.previous().loc;
    this.stream.consume("LPAREN" /* LPAREN */, "Expect '(' after 'if'");
    const condition = this.exprParser.parse();
    this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after if condition");
    const consequent = this.blockStatement();
    let alternate;
    if (this.stream.match("ELSE" /* ELSE */)) {
      alternate = this.stream.match("IF" /* IF */) ? this.ifStatement() : this.blockStatement();
    }
    return {
      id: genId("if"),
      type: "IfStatement",
      condition,
      consequent,
      alternate,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  whileStatement() {
    const startLoc = this.stream.previous().loc;
    this.stream.consume("LPAREN" /* LPAREN */, "Expect '(' after 'while'");
    const condition = this.exprParser.parse();
    this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after condition");
    const body = this.blockStatement();
    return {
      id: genId("while"),
      type: "WhileStatement",
      condition,
      body,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  fnDeclaration() {
    const startLoc = this.stream.previous().loc;
    const nameToken = this.stream.consume("IDENTIFIER" /* IDENTIFIER */, "Expect function name");
    this.stream.consume("LPAREN" /* LPAREN */, "Expect '(' after function name");
    const params = [];
    if (!this.stream.check("RPAREN" /* RPAREN */)) {
      do {
        params.push(this.stream.consume("IDENTIFIER" /* IDENTIFIER */, "Expect parameter name").lexeme);
      } while (this.stream.match("COMMA" /* COMMA */));
    }
    this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after parameters");
    const body = this.blockStatement();
    return {
      id: genId("fn"),
      type: "FunctionDeclaration",
      name: nameToken.lexeme,
      params,
      body,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  returnStatement() {
    const startLoc = this.stream.previous().loc;
    let value;
    if (!this.stream.check("SEMICOLON" /* SEMICOLON */)) value = this.exprParser.parse();
    this.stream.consume("SEMICOLON" /* SEMICOLON */, "Expect ';' after return statement");
    return {
      id: genId("ret"),
      type: "ReturnStatement",
      value,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  printStatement() {
    const startLoc = this.stream.previous().loc;
    const hasParen = this.stream.match("LPAREN" /* LPAREN */);
    const expr = this.exprParser.parse();
    if (hasParen) this.stream.consume("RPAREN" /* RPAREN */, "Expect ')' after print argument");
    this.stream.consume("SEMICOLON" /* SEMICOLON */, "Expect ';' after print statement");
    return {
      id: genId("print"),
      type: "PrintStatement",
      expression: expr,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  blockStatement() {
    const startLoc = this.stream.previous().loc;
    const statements = [];
    this.stream.consume("LBRACE" /* LBRACE */, "Expect '{' before block");
    while (!this.stream.check("RBRACE" /* RBRACE */) && !this.stream.isAtEnd()) {
      statements.push(this.statement());
    }
    this.stream.consume("RBRACE" /* RBRACE */, "Expect '}' after block");
    return {
      id: genId("block"),
      type: "BlockStatement",
      body: statements,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
  expressionOrAssignment() {
    const startLoc = this.stream.peek().loc;
    const expr = this.exprParser.parse();
    if (expr.type === "Identifier" && this.stream.match("ASSIGN" /* ASSIGN */)) {
      const val = this.exprParser.parse();
      this.stream.consume("SEMICOLON" /* SEMICOLON */, "Expect ';' after assignment");
      return {
        id: genId("assign"),
        type: "Assignment",
        identifier: expr.name,
        value: val,
        loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
      };
    }
    this.stream.consume("SEMICOLON" /* SEMICOLON */, "Expect ';' after expression");
    return {
      id: genId("expr_stmt"),
      type: "ExpressionStatement",
      expression: expr,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end)
    };
  }
};

// src/domain/interpreter/RuntimeValue.ts
var formatRuntimeValue = (val) => {
  if (val === null) return "null";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return `<fn ${val.name}>`;
};
var ReturnSignal = class {
  value;
  constructor(value) {
    this.value = value;
  }
};

// src/domain/interpreter/RuntimeError.ts
var RuntimeError = class _RuntimeError extends Error {
  loc;
  constructor(message, loc) {
    super(`${message} at line ${loc.start.line}:${loc.start.column}`);
    this.name = "RuntimeError";
    this.loc = loc;
    Object.setPrototypeOf(this, _RuntimeError.prototype);
  }
};

// src/domain/interpreter/Environment.ts
var nextEnvId = 1;
var Environment = class {
  id;
  name;
  parent;
  values = /* @__PURE__ */ new Map();
  constructor(name = "Global", parent) {
    this.id = `env_${nextEnvId++}`;
    this.name = name;
    this.parent = parent;
  }
  define(name, value) {
    this.values.set(name, value);
  }
  assign(name, value, loc) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value, loc);
      return;
    }
    throw new RuntimeError(`Undefined variable '${name}'`, loc);
  }
  get(name, loc) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name, loc);
    }
    throw new RuntimeError(`Undefined variable '${name}'`, loc);
  }
  toScopeFrames() {
    const frames = [];
    let current = this;
    while (current) {
      const bindings = {};
      current.values.forEach((v, k) => {
        bindings[k] = formatRuntimeValue(v);
      });
      frames.push({
        scopeId: current.id,
        name: current.name,
        bindings
      });
      current = current.parent;
    }
    return frames;
  }
};

// src/domain/interpreter/TreeWalkEngine.ts
var TreeWalkEngine = class {
  stepCount = 0;
  stdoutHistory = [];
  loopIterations = 0;
  MAX_LOOP_LIMIT = 2e3;
  *execute(program, env = new Environment("Global")) {
    this.stepCount = 0;
    this.stdoutHistory.length = 0;
    this.loopIterations = 0;
    yield* this.yieldSnapshot("ENTER", program, "Starting execution", env);
    let lastResult = null;
    try {
      for (const stmt of program.body) {
        lastResult = yield* this.executeStatement(stmt, env);
      }
    } catch (err) {
      if (err instanceof ReturnSignal) {
        lastResult = err.value;
      } else {
        throw err;
      }
    }
    yield* this.yieldSnapshot("EXIT", program, "Execution finished", env, formatRuntimeValue(lastResult));
    return lastResult;
  }
  *executeStatement(stmt, env) {
    yield* this.yieldSnapshot("ENTER", stmt, `Executing ${stmt.type}`, env);
    let result = null;
    switch (stmt.type) {
      case "VariableDeclaration": {
        const val = yield* this.evaluateExpression(stmt.initializer, env);
        env.define(stmt.identifier, val);
        result = val;
        yield* this.yieldSnapshot("SCOPE_MUTATION", stmt, `Defined '${stmt.identifier}' = ${formatRuntimeValue(val)}`, env, formatRuntimeValue(val));
        break;
      }
      case "Assignment": {
        const val = yield* this.evaluateExpression(stmt.value, env);
        env.assign(stmt.identifier, val, stmt.loc);
        result = val;
        yield* this.yieldSnapshot("SCOPE_MUTATION", stmt, `Assigned '${stmt.identifier}' = ${formatRuntimeValue(val)}`, env, formatRuntimeValue(val));
        break;
      }
      case "PrintStatement": {
        const val = yield* this.evaluateExpression(stmt.expression, env);
        const formatted = formatRuntimeValue(val);
        this.stdoutHistory.push(formatted);
        yield* this.yieldSnapshot("STDOUT", stmt, `Printed: ${formatted}`, env, formatted);
        result = val;
        break;
      }
      case "IfStatement": {
        const cond = yield* this.evaluateExpression(stmt.condition, env);
        if (Boolean(cond)) {
          result = yield* this.executeStatement(stmt.consequent, env);
        } else if (stmt.alternate) {
          result = yield* this.executeStatement(stmt.alternate, env);
        }
        break;
      }
      case "WhileStatement": {
        while (Boolean(yield* this.evaluateExpression(stmt.condition, env))) {
          if (++this.loopIterations > this.MAX_LOOP_LIMIT) {
            throw new RuntimeError("Infinite loop protection triggered (exceeded 2,000 iterations)", stmt.loc);
          }
          yield* this.executeStatement(stmt.body, env);
        }
        break;
      }
      case "BlockStatement": {
        const blockEnv = new Environment("Block", env);
        for (const s of stmt.body) {
          yield* this.executeStatement(s, blockEnv);
        }
        break;
      }
      case "FunctionDeclaration": {
        const fnVal = {
          type: "Function",
          name: stmt.name,
          params: stmt.params,
          body: stmt.body,
          closure: env
        };
        env.define(stmt.name, fnVal);
        result = fnVal;
        break;
      }
      case "ReturnStatement": {
        const val = stmt.value ? yield* this.evaluateExpression(stmt.value, env) : null;
        throw new ReturnSignal(val);
      }
      case "ExpressionStatement": {
        result = yield* this.evaluateExpression(stmt.expression, env);
        break;
      }
    }
    yield* this.yieldSnapshot("EXIT", stmt, `Completed ${stmt.type}`, env, formatRuntimeValue(result));
    return result;
  }
  *evaluateExpression(expr, env) {
    yield* this.yieldSnapshot("ENTER", expr, `Evaluating ${expr.type}`, env);
    let result = null;
    switch (expr.type) {
      case "Literal":
        result = expr.value;
        break;
      case "Identifier":
        result = env.get(expr.name, expr.loc);
        break;
      case "UnaryExpression":
        result = yield* this.evaluateUnary(expr, env);
        break;
      case "BinaryExpression":
        result = yield* this.evaluateBinary(expr, env);
        break;
      case "CallExpression":
        result = yield* this.evaluateCall(expr, env);
        break;
    }
    yield* this.yieldSnapshot("EXIT", expr, `Evaluated ${expr.type} -> ${formatRuntimeValue(result)}`, env, formatRuntimeValue(result));
    return result;
  }
  *evaluateUnary(expr, env) {
    const val = yield* this.evaluateExpression(expr.argument, env);
    if (expr.operator === "-") {
      if (typeof val !== "number") throw new RuntimeError("Operand must be a number for '-'", expr.loc);
      return -val;
    }
    if (expr.operator === "!") return !Boolean(val);
    throw new RuntimeError(`Unknown unary operator '${expr.operator}'`, expr.loc);
  }
  *evaluateBinary(expr, env) {
    const left = yield* this.evaluateExpression(expr.left, env);
    const right = yield* this.evaluateExpression(expr.right, env);
    switch (expr.operator) {
      case "+":
        if (typeof left === "number" && typeof right === "number") return left + right;
        return String(left ?? "") + String(right ?? "");
      case "-":
        return Number(left) - Number(right);
      case "*":
        return Number(left) * Number(right);
      case "/":
        if (Number(right) === 0) throw new RuntimeError("Division by zero", expr.loc);
        return Number(left) / Number(right);
      case "%":
        return Number(left) % Number(right);
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return Number(left) < Number(right);
      case "<=":
        return Number(left) <= Number(right);
      case ">":
        return Number(left) > Number(right);
      case ">=":
        return Number(left) >= Number(right);
    }
  }
  *evaluateCall(expr, env) {
    const fnVal = env.get(expr.callee, expr.loc);
    if (!fnVal || typeof fnVal !== "object" || fnVal.type !== "Function") {
      throw new RuntimeError(`'${expr.callee}' is not a callable function`, expr.loc);
    }
    const evaluatedArgs = [];
    for (const arg of expr.args) {
      evaluatedArgs.push(yield* this.evaluateExpression(arg, env));
    }
    const callEnv = new Environment(`fn: ${expr.callee}`, fnVal.closure);
    for (let i = 0; i < fnVal.params.length; i++) {
      callEnv.define(fnVal.params[i], evaluatedArgs[i] ?? null);
    }
    try {
      yield* this.executeStatement(fnVal.body, callEnv);
      return null;
    } catch (err) {
      if (err instanceof ReturnSignal) return err.value;
      throw err;
    }
  }
  *yieldSnapshot(eventType, node, description, env, resultValue) {
    this.stepCount++;
    yield {
      stepIndex: this.stepCount,
      eventType,
      nodeId: node.id,
      nodeType: node.type,
      description,
      loc: node.loc,
      resultValue,
      scopes: env.toScopeFrames(),
      stdoutHistory: [...this.stdoutHistory]
    };
  }
};

// src/application/SnapshotHistory.ts
var SnapshotHistory = class {
  snapshots;
  currentIndex = -1;
  constructor(snapshots = []) {
    this.snapshots = snapshots;
    this.currentIndex = snapshots.length > 0 ? 0 : -1;
  }
  getCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.snapshots.length) {
      return this.snapshots[this.currentIndex];
    }
    return null;
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  getTotalSteps() {
    return this.snapshots.length;
  }
  stepForward() {
    if (this.currentIndex < this.snapshots.length - 1) {
      this.currentIndex++;
      return this.getCurrent();
    }
    return null;
  }
  stepBackward() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrent();
    }
    return null;
  }
  jumpTo(index) {
    if (index >= 0 && index < this.snapshots.length) {
      this.currentIndex = index;
      return this.getCurrent();
    }
    return null;
  }
  reset() {
    this.currentIndex = this.snapshots.length > 0 ? 0 : -1;
    return this.getCurrent();
  }
  isAtStart() {
    return this.currentIndex <= 0;
  }
  isAtEnd() {
    return this.currentIndex >= this.snapshots.length - 1;
  }
  getAll() {
    return this.snapshots;
  }
};

// src/application/InterpreterSession.ts
var InterpreterSession = class {
  program = null;
  history = new SnapshotHistory();
  isPlaying = false;
  playTimer = null;
  playbackSpeedMs = 350;
  listeners;
  constructor(listeners) {
    this.listeners = listeners;
  }
  loadSource(source) {
    this.stopPlayback();
    const startTime = performance.now();
    try {
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      this.program = parser.parse();
      const engine = new TreeWalkEngine();
      const generator = engine.execute(this.program);
      const collectedSnapshots = [];
      for (const snapshot of generator) {
        collectedSnapshots.push(snapshot);
      }
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      this.history = new SnapshotHistory(collectedSnapshots);
      const initial = this.history.getCurrent();
      if (initial) {
        this.listeners.onStepChanged(initial, 0, collectedSnapshots.length);
      }
      return { ast: this.program, tokens, snapshots: collectedSnapshots, executionTimeMs };
    } catch (err) {
      this.listeners.onError(err.message ?? String(err), err.loc);
      return null;
    }
  }
  stepForward() {
    const next = this.history.stepForward();
    if (next) {
      this.listeners.onStepChanged(next, this.history.getCurrentIndex(), this.history.getTotalSteps());
    } else {
      this.stopPlayback();
    }
  }
  stepBackward() {
    this.stopPlayback();
    const prev = this.history.stepBackward();
    if (prev) {
      this.listeners.onStepChanged(prev, this.history.getCurrentIndex(), this.history.getTotalSteps());
    }
  }
  jumpToStep(index) {
    this.stopPlayback();
    const target = this.history.jumpTo(index);
    if (target) {
      this.listeners.onStepChanged(target, this.history.getCurrentIndex(), this.history.getTotalSteps());
    }
  }
  reset() {
    this.stopPlayback();
    const initial = this.history.reset();
    if (initial) {
      this.listeners.onStepChanged(initial, 0, this.history.getTotalSteps());
    }
  }
  startPlayback() {
    if (this.isPlaying || this.history.isAtEnd()) return;
    this.isPlaying = true;
    this.listeners.onPlayStateChanged(true);
    this.runPlaybackLoop();
  }
  stopPlayback() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
    this.listeners.onPlayStateChanged(false);
  }
  setSpeed(ms) {
    this.playbackSpeedMs = Math.max(50, Math.min(ms, 2e3));
  }
  runPlaybackLoop() {
    if (!this.isPlaying) return;
    if (this.history.isAtEnd()) {
      this.stopPlayback();
      return;
    }
    this.stepForward();
    this.playTimer = setTimeout(() => this.runPlaybackLoop(), this.playbackSpeedMs);
  }
  dispose() {
    this.stopPlayback();
  }
};

// src/infrastructure/WebviewRpcBridge.ts
var vscode = __toESM(require("vscode"));
var WebviewRpcBridge = class {
  webview;
  session;
  getEditor;
  getDocumentUri;
  constructor(webview, session, getEditor, getDocumentUri) {
    this.webview = webview;
    this.session = session;
    this.getEditor = getEditor;
    this.getDocumentUri = getDocumentUri;
    this.setupListener();
  }
  postMessage(message) {
    this.webview.postMessage(message);
  }
  setupListener() {
    this.webview.onDidReceiveMessage((msg) => {
      switch (msg.type) {
        case "STEP_FORWARD":
          this.session.stepForward();
          break;
        case "STEP_BACKWARD":
          this.session.stepBackward();
          break;
        case "JUMP_TO_STEP":
          this.session.jumpToStep(msg.payload.stepIndex);
          break;
        case "PLAY":
          this.session.startPlayback();
          break;
        case "PAUSE":
          this.session.stopPlayback();
          break;
        case "RESET":
          this.session.reset();
          break;
        case "SELECT_NODE":
          this.revealInEditor(msg.payload.loc);
          break;
      }
    });
  }
  async revealInEditor(loc) {
    let editor = this.getEditor();
    if (!editor && this.getDocumentUri) {
      const uri = this.getDocumentUri();
      if (uri) {
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
        } catch {
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
};

// src/infrastructure/WebviewPanelManager.ts
var WebviewPanelManager = class {
  panel = null;
  bridge = null;
  session = null;
  targetUri = null;
  extensionUri;
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }
  show(sourceCode, activeEditor) {
    if (activeEditor) {
      this.targetUri = activeEditor.document.uri;
    }
    const column = vscode2.ViewColumn.Active;
    if (this.panel) {
      this.panel.reveal(column);
    } else {
      this.panel = vscode2.window.createWebviewPanel(
        "astGraph",
        "AST Graph",
        column,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [this.extensionUri]
        }
      );
      this.panel.iconPath = vscode2.Uri.joinPath(this.extensionUri, "resources", "icon.png");
      this.session = new InterpreterSession({
        onStepChanged: (_snapshot, index) => {
          this.bridge?.postMessage({
            type: "UPDATE_STEP",
            payload: { stepIndex: index }
          });
        },
        onPlayStateChanged: (isPlaying) => {
          this.bridge?.postMessage({
            type: "PLAY_STATE_CHANGED",
            payload: { isPlaying }
          });
        },
        onError: (message, loc) => {
          this.bridge?.postMessage({
            type: "REPORT_ERROR",
            payload: { message, loc }
          });
        }
      });
      this.bridge = new WebviewRpcBridge(
        this.panel.webview,
        this.session,
        () => vscode2.window.activeTextEditor,
        () => this.targetUri ?? void 0
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
      const result = this.session.loadSource(sourceCode);
      if (result) {
        this.bridge.postMessage({
          type: "INIT_PROGRAM",
          payload: {
            ast: result.ast,
            code: sourceCode,
            tokens: result.tokens,
            snapshots: result.snapshots,
            executionTimeMs: result.executionTimeMs
          }
        });
      }
    }
  }
  getHtmlContent(webview) {
    const scriptUri = webview.asWebviewUri(vscode2.Uri.joinPath(this.extensionUri, "dist", "webview.js"));
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
};
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// src/infrastructure/extension.ts
var DEFAULT_SAMPLE = `// Sample Toy Program for AST & Tree-Walk Execution
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
function activate(context) {
  const panelManager = new WebviewPanelManager(context.extensionUri);
  const openVisualizer = () => {
    const editor = vscode3.window.activeTextEditor;
    const code = editor ? editor.document.getText() : DEFAULT_SAMPLE;
    panelManager.show(code, editor);
  };
  const primaryCmd = vscode3.commands.registerCommand("astGraph.view", openVisualizer);
  const legacyCmd = vscode3.commands.registerCommand("astVisualizer.open", openVisualizer);
  context.subscriptions.push(primaryCmd, legacyCmd);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
