import { TokenStream } from './TokenStream';
import { TokenType } from '../lexer/TokenType';
import { ParseError } from './ParseError';
import {
  ExpressionNode, BinaryOperator, UnaryOperator,
} from '../../shared/AstNodeTypes';
import { createSourceLocation } from '../../shared/SourceLocation';

export class ExpressionParser {
  private readonly stream: TokenStream;
  private readonly genId: (prefix: string) => string;

  constructor(stream: TokenStream, genId: (prefix: string) => string) {
    this.stream = stream;
    this.genId = genId;
  }

  public parse(): ExpressionNode {
    return this.equality();
  }

  private equality(): ExpressionNode {
    let expr = this.comparison();
    while (this.stream.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const op = this.stream.previous().lexeme as BinaryOperator;
      const right = this.comparison();
      expr = {
        id: this.genId('bin'),
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end),
      };
    }
    return expr;
  }

  private comparison(): ExpressionNode {
    let expr = this.term();
    while (this.stream.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const op = this.stream.previous().lexeme as BinaryOperator;
      const right = this.term();
      expr = {
        id: this.genId('bin'),
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end),
      };
    }
    return expr;
  }

  private term(): ExpressionNode {
    let expr = this.factor();
    while (this.stream.match(TokenType.PLUS, TokenType.MINUS)) {
      const op = this.stream.previous().lexeme as BinaryOperator;
      const right = this.factor();
      expr = {
        id: this.genId('bin'),
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end),
      };
    }
    return expr;
  }

  private factor(): ExpressionNode {
    let expr = this.unary();
    while (this.stream.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const op = this.stream.previous().lexeme as BinaryOperator;
      const right = this.unary();
      expr = {
        id: this.genId('bin'),
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
        loc: createSourceLocation(expr.loc.start, right.loc.end),
      };
    }
    return expr;
  }

  private unary(): ExpressionNode {
    if (this.stream.match(TokenType.BANG, TokenType.MINUS)) {
      const opToken = this.stream.previous();
      const op = opToken.lexeme as UnaryOperator;
      const right = this.unary();
      return {
        id: this.genId('unary'),
        type: 'UnaryExpression',
        operator: op,
        argument: right,
        loc: createSourceLocation(opToken.loc.start, right.loc.end),
      };
    }
    return this.callOrPrimary();
  }

  private callOrPrimary(): ExpressionNode {
    const primary = this.primary();
    if (primary.type === 'Identifier' && this.stream.match(TokenType.LPAREN)) {
      const args: ExpressionNode[] = [];
      if (!this.stream.check(TokenType.RPAREN)) {
        do {
          args.push(this.parse());
        } while (this.stream.match(TokenType.COMMA));
      }
      this.stream.consume(TokenType.RPAREN, "Expect ')' after arguments");
      return {
        id: this.genId('call'),
        type: 'CallExpression',
        callee: primary.name,
        args,
        loc: createSourceLocation(primary.loc.start, this.stream.previous().loc.end),
      };
    }
    return primary;
  }

  private primary(): ExpressionNode {
    const tok = this.stream.peek();
    if (this.stream.match(TokenType.NUMBER, TokenType.STRING, TokenType.TRUE, TokenType.FALSE, TokenType.NULL)) {
      return {
        id: this.genId('lit'),
        type: 'Literal',
        value: this.stream.previous().literal,
        raw: this.stream.previous().lexeme,
        loc: this.stream.previous().loc,
      };
    }
    if (this.stream.match(TokenType.IDENTIFIER)) {
      return {
        id: this.genId('id'),
        type: 'Identifier',
        name: this.stream.previous().lexeme,
        loc: this.stream.previous().loc,
      };
    }
    if (this.stream.match(TokenType.LPAREN)) {
      const expr = this.parse();
      this.stream.consume(TokenType.RPAREN, "Expect ')' after expression");
      return expr;
    }
    throw new ParseError(`Unexpected token '${tok.lexeme}'`, tok.loc);
  }
}
