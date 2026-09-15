import { SourceLocation } from '../../shared/SourceLocation';

export class ParseError extends Error {
  public readonly loc: SourceLocation;

  constructor(message: string, loc: SourceLocation) {
    super(`${message} at line ${loc.start.line}:${loc.start.column}`);
    this.name = 'ParseError';
    this.loc = loc;
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}
