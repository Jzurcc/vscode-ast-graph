import { SourceLocation } from './SourceLocation';

export type StepEventType =
  | 'ENTER'
  | 'EVAL_CHILD'
  | 'EXIT'
  | 'SCOPE_MUTATION'
  | 'STDOUT'
  | 'ERROR';

export interface ScopeFrame {
  scopeId: string;
  name: string;
  bindings: Record<string, string>;
}

export interface StepSnapshot {
  stepIndex: number;
  eventType: StepEventType;
  nodeId: string;
  nodeType: string;
  description: string;
  loc: SourceLocation;
  resultValue?: string;
  scopes: ScopeFrame[];
  stdoutHistory: string[];
}
