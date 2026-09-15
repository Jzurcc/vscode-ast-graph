"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// test/runTests.ts
var import_node_assert = __toESM(require("node:assert"));

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
  constructor(tokens2) {
    this.tokens = tokens2;
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
  constructor(tokens2) {
    this.stream = new TokenStream(tokens2);
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

// test/runTests.ts
console.log("\u{1F9EA} Running AST Visualizer & Interpreter Test Suite...\n");
console.log("--- 1. Lexer Test ---");
var lexer = new Lexer("let x = 42 + 8; // comment\nprint(x);");
var tokens = lexer.tokenize();
import_node_assert.default.strictEqual(tokens[0].type, "LET" /* LET */);
import_node_assert.default.strictEqual(tokens[1].lexeme, "x");
import_node_assert.default.strictEqual(tokens[2].type, "ASSIGN" /* ASSIGN */);
import_node_assert.default.strictEqual(tokens[3].literal, 42);
import_node_assert.default.strictEqual(tokens[4].type, "PLUS" /* PLUS */);
import_node_assert.default.strictEqual(tokens[5].literal, 8);
import_node_assert.default.strictEqual(tokens[6].type, "SEMICOLON" /* SEMICOLON */);
import_node_assert.default.strictEqual(tokens[7].type, "PRINT" /* PRINT */);
console.log("\u2705 Lexer tests passed.");
console.log("\n--- 2. Parser Test ---");
var parser = new Parser(tokens);
var ast = parser.parse();
import_node_assert.default.strictEqual(ast.type, "Program");
import_node_assert.default.strictEqual(ast.body.length, 2);
import_node_assert.default.strictEqual(ast.body[0].type, "VariableDeclaration");
import_node_assert.default.strictEqual(ast.body[1].type, "PrintStatement");
console.log("\u2705 Parser tests passed.");
console.log("\n--- 3. TreeWalkEngine & Step Execution Test ---");
var code = `
let a = 5;
let b = 10;
fn sum(x, y) {
  return x + y;
}
let c = sum(a, b);
print(c);
`;
var engineTokens = new Lexer(code).tokenize();
var engineAst = new Parser(engineTokens).parse();
var engine = new TreeWalkEngine();
var generator = engine.execute(engineAst);
var snapshots = [];
for (const step of generator) {
  snapshots.push(step);
}
(0, import_node_assert.default)(snapshots.length > 10, "Expected multiple execution steps");
var lastSnapshot = snapshots[snapshots.length - 1];
import_node_assert.default.strictEqual(lastSnapshot.stdoutHistory.length, 1);
import_node_assert.default.strictEqual(lastSnapshot.stdoutHistory[0], "15");
console.log(`\u2705 TreeWalkEngine executed ${snapshots.length} steps. Standard output: ${lastSnapshot.stdoutHistory[0]}`);
console.log("\n--- 4. While Loop & Conditional Test ---");
var loopCode = `
let count = 3;
let acc = 0;
while (count > 0) {
  acc = acc + count;
  count = count - 1;
}
print(acc);
`;
var loopAst = new Parser(new Lexer(loopCode).tokenize()).parse();
var loopGen = new TreeWalkEngine().execute(loopAst);
var finalSnap = null;
for (const s of loopGen) {
  finalSnap = s;
}
import_node_assert.default.strictEqual(finalSnap?.stdoutHistory[0], "6");
console.log("\u2705 Loop and arithmetic tests passed (3 + 2 + 1 = 6).");
console.log("\n\u{1F389} ALL TESTS PASSED SUCCESSFULLY!\n");
//# sourceMappingURL=test.js.map
