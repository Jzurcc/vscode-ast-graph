import {
  ASTNode, ProgramNode, StatementNode, ExpressionNode, BinaryExpressionNode,
  UnaryExpressionNode, CallExpressionNode
} from '../../shared/AstNodeTypes';
import { Environment } from './Environment';
import { RuntimeValue, formatRuntimeValue, ReturnSignal, FunctionValue } from './RuntimeValue';
import { RuntimeError } from './RuntimeError';
import { StepSnapshot, StepEventType } from '../../shared/StepSnapshot';

export class TreeWalkEngine {
  private stepCount = 0;
  private readonly stdoutHistory: string[] = [];
  private loopIterations = 0;
  private readonly MAX_LOOP_LIMIT = 2000;

  public *execute(program: ProgramNode, env: Environment = new Environment('Global')): Generator<StepSnapshot, RuntimeValue, void> {
    this.stepCount = 0;
    this.stdoutHistory.length = 0;
    this.loopIterations = 0;
    yield* this.yieldSnapshot('ENTER', program, 'Starting execution', env);

    let lastResult: RuntimeValue = null;
    try {
      for (const stmt of program.body) {
        lastResult = yield* this.executeStatement(stmt, env);
      }
    } catch (err) {
      if (err instanceof ReturnSignal) {
        lastResult = err.value;
      } else {
        throw err;
      }
    }

    yield* this.yieldSnapshot('EXIT', program, 'Execution finished', env, formatRuntimeValue(lastResult));
    return lastResult;
  }

  private *executeStatement(stmt: StatementNode, env: Environment): Generator<StepSnapshot, RuntimeValue, void> {
    yield* this.yieldSnapshot('ENTER', stmt, `Executing ${stmt.type}`, env);
    let result: RuntimeValue = null;

    switch (stmt.type) {
      case 'VariableDeclaration': {
        const val = yield* this.evaluateExpression(stmt.initializer, env);
        env.define(stmt.identifier, val);
        result = val;
        yield* this.yieldSnapshot('SCOPE_MUTATION', stmt, `Defined '${stmt.identifier}' = ${formatRuntimeValue(val)}`, env, formatRuntimeValue(val));
        break;
      }
      case 'Assignment': {
        const val = yield* this.evaluateExpression(stmt.value, env);
        env.assign(stmt.identifier, val, stmt.loc);
        result = val;
        yield* this.yieldSnapshot('SCOPE_MUTATION', stmt, `Assigned '${stmt.identifier}' = ${formatRuntimeValue(val)}`, env, formatRuntimeValue(val));
        break;
      }
      case 'PrintStatement': {
        const val = yield* this.evaluateExpression(stmt.expression, env);
        const formatted = formatRuntimeValue(val);
        this.stdoutHistory.push(formatted);
        yield* this.yieldSnapshot('STDOUT', stmt, `Printed: ${formatted}`, env, formatted);
        result = val;
        break;
      }
      case 'IfStatement': {
        const cond = yield* this.evaluateExpression(stmt.condition, env);
        if (Boolean(cond)) {
          result = yield* this.executeStatement(stmt.consequent, env);
        } else if (stmt.alternate) {
          result = yield* this.executeStatement(stmt.alternate, env);
        }
        break;
      }
      case 'WhileStatement': {
        while (Boolean(yield* this.evaluateExpression(stmt.condition, env))) {
          if (++this.loopIterations > this.MAX_LOOP_LIMIT) {
            throw new RuntimeError('Infinite loop protection triggered (exceeded 2,000 iterations)', stmt.loc);
          }
          yield* this.executeStatement(stmt.body, env);
        }
        break;
      }
      case 'BlockStatement': {
        const blockEnv = new Environment('Block', env);
        for (const s of stmt.body) {
          yield* this.executeStatement(s, blockEnv);
        }
        break;
      }
      case 'FunctionDeclaration': {
        const fnVal: FunctionValue = {
          type: 'Function',
          name: stmt.name,
          params: stmt.params,
          body: stmt.body,
          closure: env,
        };
        env.define(stmt.name, fnVal);
        result = fnVal;
        break;
      }
      case 'ReturnStatement': {
        const val = stmt.value ? yield* this.evaluateExpression(stmt.value, env) : null;
        throw new ReturnSignal(val);
      }
      case 'ExpressionStatement': {
        result = yield* this.evaluateExpression(stmt.expression, env);
        break;
      }
    }

    yield* this.yieldSnapshot('EXIT', stmt, `Completed ${stmt.type}`, env, formatRuntimeValue(result));
    return result;
  }

  private *evaluateExpression(expr: ExpressionNode, env: Environment): Generator<StepSnapshot, RuntimeValue, void> {
    yield* this.yieldSnapshot('ENTER', expr, `Evaluating ${expr.type}`, env);
    let result: RuntimeValue = null;

    switch (expr.type) {
      case 'Literal':
        result = expr.value;
        break;
      case 'Identifier':
        result = env.get(expr.name, expr.loc);
        break;
      case 'UnaryExpression':
        result = yield* this.evaluateUnary(expr, env);
        break;
      case 'BinaryExpression':
        result = yield* this.evaluateBinary(expr, env);
        break;
      case 'CallExpression':
        result = yield* this.evaluateCall(expr, env);
        break;
    }

    yield* this.yieldSnapshot('EXIT', expr, `Evaluated ${expr.type} -> ${formatRuntimeValue(result)}`, env, formatRuntimeValue(result));
    return result;
  }

  private *evaluateUnary(expr: UnaryExpressionNode, env: Environment): Generator<StepSnapshot, RuntimeValue, void> {
    const val = yield* this.evaluateExpression(expr.argument, env);
    if (expr.operator === '-') {
      if (typeof val !== 'number') throw new RuntimeError("Operand must be a number for '-'", expr.loc);
      return -val;
    }
    if (expr.operator === '!') return !Boolean(val);
    throw new RuntimeError(`Unknown unary operator '${expr.operator}'`, expr.loc);
  }

  private *evaluateBinary(expr: BinaryExpressionNode, env: Environment): Generator<StepSnapshot, RuntimeValue, void> {
    const left = yield* this.evaluateExpression(expr.left, env);
    const right = yield* this.evaluateExpression(expr.right, env);
    switch (expr.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        return String(left ?? '') + String(right ?? '');
      case '-': return Number(left) - Number(right);
      case '*': return Number(left) * Number(right);
      case '/':
        if (Number(right) === 0) throw new RuntimeError('Division by zero', expr.loc);
        return Number(left) / Number(right);
      case '%': return Number(left) % Number(right);
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return Number(left) < Number(right);
      case '<=': return Number(left) <= Number(right);
      case '>': return Number(left) > Number(right);
      case '>=': return Number(left) >= Number(right);
    }
  }

  private *evaluateCall(expr: CallExpressionNode, env: Environment): Generator<StepSnapshot, RuntimeValue, void> {
    const fnVal = env.get(expr.callee, expr.loc);
    if (!fnVal || typeof fnVal !== 'object' || fnVal.type !== 'Function') {
      throw new RuntimeError(`'${expr.callee}' is not a callable function`, expr.loc);
    }
    const evaluatedArgs: RuntimeValue[] = [];
    for (const arg of expr.args) {
      evaluatedArgs.push(yield* this.evaluateExpression(arg, env));
    }
    const callEnv = new Environment(`fn: ${expr.callee}`, fnVal.closure);
    for (let i = 0; i < fnVal.params.length; i++) {
      callEnv.define(fnVal.params[i], evaluatedArgs[i] ?? null);
    }
    try {
      yield* this.executeStatement(fnVal.body, callEnv);
      return null;
    } catch (err) {
      if (err instanceof ReturnSignal) return err.value;
      throw err;
    }
  }

  private *yieldSnapshot(eventType: StepEventType, node: ASTNode, description: string, env: Environment, resultValue?: string): Generator<StepSnapshot, void, void> {
    this.stepCount++;
    yield {
      stepIndex: this.stepCount,
      eventType,
      nodeId: node.id,
      nodeType: node.type,
      description,
      loc: node.loc,
      resultValue,
      scopes: env.toScopeFrames(),
      stdoutHistory: [...this.stdoutHistory],
    };
  }
}
