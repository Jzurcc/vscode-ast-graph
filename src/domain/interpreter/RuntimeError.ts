import { SourceLocation } from '../../shared/SourceLocation';

export class RuntimeError extends Error {
  public readonly loc: SourceLocation;

  constructor(message: string, loc: SourceLocation) {
    super(`${message} at line ${loc.start.line}:${loc.start.column}`);
    this.name = 'RuntimeError';
    this.loc = loc;
    Object.setPrototypeOf(this, RuntimeError.prototype);
  }
}
