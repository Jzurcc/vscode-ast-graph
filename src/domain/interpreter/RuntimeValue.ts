import { BlockStatementNode } from '../../shared/AstNodeTypes';
import { Environment } from './Environment';

export type RuntimePrimitive = number | string | boolean | null;

export interface FunctionValue {
  type: 'Function';
  name: string;
  params: string[];
  body: BlockStatementNode;
  closure: Environment;
}

export type RuntimeValue = RuntimePrimitive | FunctionValue;

export const formatRuntimeValue = (val: RuntimeValue): string => {
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return `<fn ${val.name}>`;
};

export class ReturnSignal {
  public readonly value: RuntimeValue;
  constructor(value: RuntimeValue) {
    this.value = value;
  }
}
