import { RuntimeValue, formatRuntimeValue } from './RuntimeValue';
import { RuntimeError } from './RuntimeError';
import { SourceLocation } from '../../shared/SourceLocation';
import { ScopeFrame } from '../../shared/StepSnapshot';

let nextEnvId = 1;

export class Environment {
  public readonly id: string;
  public readonly name: string;
  public readonly parent?: Environment;
  private readonly values: Map<string, RuntimeValue> = new Map();

  constructor(name = 'Global', parent?: Environment) {
    this.id = `env_${nextEnvId++}`;
    this.name = name;
    this.parent = parent;
  }

  public define(name: string, value: RuntimeValue): void {
    this.values.set(name, value);
  }

  public assign(name: string, value: RuntimeValue, loc: SourceLocation): void {
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

  public get(name: string, loc: SourceLocation): RuntimeValue {
    if (this.values.has(name)) {
      return this.values.get(name)!;
    }
    if (this.parent) {
      return this.parent.get(name, loc);
    }
    throw new RuntimeError(`Undefined variable '${name}'`, loc);
  }

  public toScopeFrames(): ScopeFrame[] {
    const frames: ScopeFrame[] = [];
    let current: Environment | undefined = this;
    while (current) {
      const bindings: Record<string, string> = {};
      current.values.forEach((v, k) => {
        bindings[k] = formatRuntimeValue(v);
      });
      frames.push({
        scopeId: current.id,
        name: current.name,
        bindings,
      });
      current = current.parent;
    }
    return frames;
  }
}
