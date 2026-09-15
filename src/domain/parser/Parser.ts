import { Token } from '../lexer/Token';
import { TokenType } from '../lexer/TokenType';
import { TokenStream } from './TokenStream';
import { ExpressionParser } from './ExpressionParser';
import {
  ProgramNode, StatementNode, VariableDeclarationNode,
  PrintStatementNode, BlockStatementNode, IfStatementNode,
  WhileStatementNode, FunctionDeclarationNode, ReturnStatementNode,
  ExpressionNode
} from '../../shared/AstNodeTypes';
import { createSourceLocation } from '../../shared/SourceLocation';

let nextNodeId = 1;
const genId = (prefix: string) => `${prefix}_${nextNodeId++}`;

export class Parser {
  private readonly stream: TokenStream;
  private readonly exprParser: ExpressionParser;

  constructor(tokens: Token[]) {
    this.stream = new TokenStream(tokens);
    nextNodeId = 1;
    this.exprParser = new ExpressionParser(this.stream, genId);
  }

  public parse(): ProgramNode {
    const statements: StatementNode[] = [];
    const startLoc = this.stream.peek().loc;
    while (!this.stream.isAtEnd()) {
      statements.push(this.statement());
    }
    const endLoc = this.stream.previous().loc;
    return {
      id: genId('program'),
      type: 'Program',
      body: statements,
      loc: createSourceLocation(startLoc.start, endLoc.end),
    };
  }

  private statement(): StatementNode {
    if (this.stream.match(TokenType.LET)) return this.varDeclaration();
    if (this.stream.match(TokenType.IF)) return this.ifStatement();
    if (this.stream.match(TokenType.WHILE)) return this.whileStatement();
    if (this.stream.match(TokenType.FN)) return this.fnDeclaration();
    if (this.stream.match(TokenType.RETURN)) return this.returnStatement();
    if (this.stream.match(TokenType.PRINT)) return this.printStatement();
    if (this.stream.match(TokenType.LBRACE)) return this.blockStatement();
    return this.expressionOrAssignment();
  }

  private varDeclaration(): VariableDeclarationNode {
    const startLoc = this.stream.previous().loc;
    const nameToken = this.stream.consume(TokenType.IDENTIFIER, "Expect variable name after 'let'");
    this.stream.consume(TokenType.ASSIGN, "Expect '=' after variable name");
    const init = this.exprParser.parse();
    this.stream.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return {
      id: genId('var'),
      type: 'VariableDeclaration',
      identifier: nameToken.lexeme,
      initializer: init,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private ifStatement(): IfStatementNode {
    const startLoc = this.stream.previous().loc;
    this.stream.consume(TokenType.LPAREN, "Expect '(' after 'if'");
    const condition = this.exprParser.parse();
    this.stream.consume(TokenType.RPAREN, "Expect ')' after if condition");
    const consequent = this.blockStatement();
    let alternate: BlockStatementNode | IfStatementNode | undefined;
    if (this.stream.match(TokenType.ELSE)) {
      alternate = this.stream.match(TokenType.IF) ? this.ifStatement() : this.blockStatement();
    }
    return {
      id: genId('if'),
      type: 'IfStatement',
      condition,
      consequent,
      alternate,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private whileStatement(): WhileStatementNode {
    const startLoc = this.stream.previous().loc;
    this.stream.consume(TokenType.LPAREN, "Expect '(' after 'while'");
    const condition = this.exprParser.parse();
    this.stream.consume(TokenType.RPAREN, "Expect ')' after condition");
    const body = this.blockStatement();
    return {
      id: genId('while'),
      type: 'WhileStatement',
      condition,
      body,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private fnDeclaration(): FunctionDeclarationNode {
    const startLoc = this.stream.previous().loc;
    const nameToken = this.stream.consume(TokenType.IDENTIFIER, "Expect function name");
    this.stream.consume(TokenType.LPAREN, "Expect '(' after function name");
    const params: string[] = [];
    if (!this.stream.check(TokenType.RPAREN)) {
      do {
        params.push(this.stream.consume(TokenType.IDENTIFIER, "Expect parameter name").lexeme);
      } while (this.stream.match(TokenType.COMMA));
    }
    this.stream.consume(TokenType.RPAREN, "Expect ')' after parameters");
    const body = this.blockStatement();
    return {
      id: genId('fn'),
      type: 'FunctionDeclaration',
      name: nameToken.lexeme,
      params,
      body,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private returnStatement(): ReturnStatementNode {
    const startLoc = this.stream.previous().loc;
    let value: ExpressionNode | undefined;
    if (!this.stream.check(TokenType.SEMICOLON)) value = this.exprParser.parse();
    this.stream.consume(TokenType.SEMICOLON, "Expect ';' after return statement");
    return {
      id: genId('ret'),
      type: 'ReturnStatement',
      value,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private printStatement(): PrintStatementNode {
    const startLoc = this.stream.previous().loc;
    const hasParen = this.stream.match(TokenType.LPAREN);
    const expr = this.exprParser.parse();
    if (hasParen) this.stream.consume(TokenType.RPAREN, "Expect ')' after print argument");
    this.stream.consume(TokenType.SEMICOLON, "Expect ';' after print statement");
    return {
      id: genId('print'),
      type: 'PrintStatement',
      expression: expr,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private blockStatement(): BlockStatementNode {
    const startLoc = this.stream.previous().loc;
    const statements: StatementNode[] = [];
    this.stream.consume(TokenType.LBRACE, "Expect '{' before block");
    while (!this.stream.check(TokenType.RBRACE) && !this.stream.isAtEnd()) {
      statements.push(this.statement());
    }
    this.stream.consume(TokenType.RBRACE, "Expect '}' after block");
    return {
      id: genId('block'),
      type: 'BlockStatement',
      body: statements,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }

  private expressionOrAssignment(): StatementNode {
    const startLoc = this.stream.peek().loc;
    const expr = this.exprParser.parse();
    if (expr.type === 'Identifier' && this.stream.match(TokenType.ASSIGN)) {
      const val = this.exprParser.parse();
      this.stream.consume(TokenType.SEMICOLON, "Expect ';' after assignment");
      return {
        id: genId('assign'),
        type: 'Assignment',
        identifier: expr.name,
        value: val,
        loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
      };
    }
    this.stream.consume(TokenType.SEMICOLON, "Expect ';' after expression");
    return {
      id: genId('expr_stmt'),
      type: 'ExpressionStatement',
      expression: expr,
      loc: createSourceLocation(startLoc.start, this.stream.previous().loc.end),
    };
  }
}
