import { TokenType } from './TokenType';
import { SourceLocation } from '../../shared/SourceLocation';

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: number | string | boolean | null;
  loc: SourceLocation;
}

export const createToken = (
  type: TokenType,
  lexeme: string,
  literal: number | string | boolean | null,
  loc: SourceLocation
): Token => ({
  type,
  lexeme,
  literal,
  loc,
});
