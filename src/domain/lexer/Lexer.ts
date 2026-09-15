import { TokenType } from './TokenType';
import { Token, createToken } from './Token';
import { createSourceLocation, createSourcePosition, SourcePosition } from '../../shared/SourceLocation';

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.LET,
  if: TokenType.IF,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  fn: TokenType.FN,
  return: TokenType.RETURN,
  print: TokenType.PRINT,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
};

export class Lexer {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private lineStart = 0;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    const endPos = this.getPosition(this.current);
    this.tokens.push(createToken(TokenType.EOF, '', null, createSourceLocation(endPos, endPos)));
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.advance();
    switch (char) {
      case '(': this.addToken(TokenType.LPAREN); break;
      case ')': this.addToken(TokenType.RPAREN); break;
      case '{': this.addToken(TokenType.LBRACE); break;
      case '}': this.addToken(TokenType.RBRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '%': this.addToken(TokenType.PERCENT); break;
      case '!':
        this.addToken(this.match('=') ? TokenType.NOT_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL : TokenType.ASSIGN);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
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
          this.addToken(TokenType.ILLEGAL);
        }
    }
  }

  private scanString(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.lineStart = this.current;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.addToken(TokenType.ILLEGAL);
      return;
    }

    this.advance(); // consume closing quote
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private scanNumber(): void {
    while (this.isDigit(this.peek())) this.advance();
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // consume dot
      while (this.isDigit(this.peek())) this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    this.addToken(TokenType.NUMBER, parseFloat(text));
  }

  private scanIdentifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] ?? TokenType.IDENTIFIER;
    let literal: number | string | boolean | null = null;
    if (type === TokenType.TRUE) literal = true;
    if (type === TokenType.FALSE) literal = false;
    this.addToken(type, literal);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    return this.isAtEnd() ? '\0' : this.source.charAt(this.current);
  }

  private peekNext(): string {
    return this.current + 1 >= this.source.length ? '\0' : this.source.charAt(this.current + 1);
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private getPosition(offset: number): SourcePosition {
    return createSourcePosition(this.line, offset - this.lineStart + 1, offset);
  }

  private addToken(type: TokenType, literal: number | string | boolean | null = null): void {
    const lexeme = this.source.substring(this.start, this.current);
    const loc = createSourceLocation(
      createSourcePosition(this.line, this.start - this.lineStart + 1, this.start),
      createSourcePosition(this.line, this.current - this.lineStart + 1, this.current)
    );
    this.tokens.push(createToken(type, lexeme, literal, loc));
  }
}
