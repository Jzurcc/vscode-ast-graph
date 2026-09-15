export interface SourcePosition {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: SourcePosition;
  end: SourcePosition;
}

export const createSourcePosition = (line: number, column: number, offset: number): SourcePosition => ({
  line,
  column,
  offset,
});

export const createSourceLocation = (start: SourcePosition, end: SourcePosition): SourceLocation => ({
  start,
  end,
});
