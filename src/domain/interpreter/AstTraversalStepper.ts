import { AstTableLayout } from '../layout/AstTableLayout';
import { StepSnapshot, ScopeFrame } from '../../shared/StepSnapshot';

export class AstTraversalStepper {
  public static generateSteps(ast: any): StepSnapshot[] {
    const rows = AstTableLayout.flattenAst(ast);
    if (!rows || rows.length === 0) {
      return [];
    }

    const snapshots: StepSnapshot[] = [];
    const discoveredSymbols: Record<string, string> = {};

    rows.forEach((row, index) => {
      // Track discovered functions, types, and variables as we traverse
      if (row.category === 'Fn') {
        discoveredSymbols[row.label] = 'function';
      } else if (row.category === 'Type') {
        discoveredSymbols[row.label] = 'type/class';
      } else if (row.category === 'Ident' && row.label.length < 30) {
        if (!discoveredSymbols[row.label]) {
          discoveredSymbols[row.label] = 'symbol';
        }
      }

      const scopes: ScopeFrame[] = [
        {
          scopeId: 'ast_node',
          name: 'Active AST Node',
          bindings: {
            'Node Type': row.type,
            'Category': row.category,
            'Slot': row.slot,
            'Label': row.label,
            'Location': `Line ${row.loc.start.line}, Col ${row.loc.start.column}`,
          },
        },
      ];

      if (Object.keys(discoveredSymbols).length > 0) {
        scopes.push({
          scopeId: 'ast_symbols',
          name: 'Discovered Symbols',
          bindings: { ...discoveredSymbols },
        });
      }

      snapshots.push({
        stepIndex: index,
        eventType: 'ENTER',
        nodeId: row.nodeId,
        nodeType: row.type,
        description: `${row.category} ${row.type}: ${row.label} (${row.slot})`,
        loc: row.loc,
        resultValue: row.category === 'Literal' ? row.label : undefined,
        scopes,
        stdoutHistory: [],
      });
    });

    return snapshots;
  }
}
