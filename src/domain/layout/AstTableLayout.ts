import { ASTNode, ProgramNode } from '../../shared/AstNodeTypes';
import { SourceLocation } from '../../shared/SourceLocation';

export interface AstTableRow {
  id: string;
  nodeId: string;
  rowIndex: number;
  depth: number;
  slot: string;
  category: 'Stmt' | 'Expr' | 'Literal' | 'Ident' | 'Fn';
  label: string;
  parentRowIndex: number;
  railIndex: number;
  node: ASTNode;
  loc: SourceLocation;
}

export interface SvgRailPath {
  pathD: string;
  color: string;
  isStraight: boolean;
}

const RAIL_COLORS = [
  '#38bdf8', // Cyan
  '#34d399', // Emerald
  '#a78bfa', // Purple
  '#fbbf24', // Amber
  '#f472b6', // Rose
  '#60a5fa', // Blue
];

export class AstTableLayout {
  public static readonly ROW_HEIGHT = 28;
  public static readonly RAIL_SPACING = 16;
  public static readonly RAIL_OFFSET_X = 20;

  public static flattenAst(program: ProgramNode): AstTableRow[] {
    const rows: AstTableRow[] = [];
    let currentRowIndex = 0;

    const traverse = (node: ASTNode, depth: number, slot: string, parentIndex: number): void => {
      const rowIndex = currentRowIndex++;
      const category = this.getCategory(node);
      const label = this.getLabel(node);
      const railIndex = depth;

      rows.push({
        id: `row-${rowIndex}`,
        nodeId: node.id,
        rowIndex,
        depth,
        slot,
        category,
        label,
        parentRowIndex: parentIndex,
        railIndex,
        node,
        loc: node.loc,
      });

      const children = this.getChildEntries(node);
      for (const child of children) {
        traverse(child.node, depth + 1, child.slot, rowIndex);
      }
    };

    traverse(program, 0, 'root', -1);
    return rows;
  }

  public static computeRails(
    rows: AstTableRow[],
    rowPositionsOrExpandAt: number[] | number = -1,
    expandHeight = 0
  ): SvgRailPath[] {
    const rails: SvgRailPath[] = [];

    // Calculate Y positions for all rows
    let rowY: number[];
    if (Array.isArray(rowPositionsOrExpandAt)) {
      rowY = rowPositionsOrExpandAt;
    } else {
      const expandAt = rowPositionsOrExpandAt;
      rowY = rows.map(r => {
        let y = r.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2;
        if (expandAt > -1 && r.rowIndex > expandAt) {
          y += expandHeight;
        }
        return y;
      });
    }

    for (const row of rows) {
      if (row.parentRowIndex < 0) continue;

      const parent = rows[row.parentRowIndex];
      const y1 = rowY[parent.rowIndex] ?? (parent.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2);
      const y2 = rowY[row.rowIndex] ?? (row.rowIndex * this.ROW_HEIGHT + this.ROW_HEIGHT / 2);

      const x1 = this.RAIL_OFFSET_X + parent.railIndex * this.RAIL_SPACING;
      const x2 = this.RAIL_OFFSET_X + row.railIndex * this.RAIL_SPACING;
      const color = RAIL_COLORS[row.depth % RAIL_COLORS.length];

      if (x1 === x2) {
        rails.push({
          pathD: `M ${x1} ${y1} L ${x2} ${y2}`,
          color,
          isStraight: true,
        });
      } else {
        // Curve transitions smoothly in the row height preceding the child,
        // rather than stretching across the entire height of expanded sections.
        const curveH = Math.min(28, Math.max(12, y2 - y1));
        const d = curveH * 0.45;
        let pathD: string;

        if (y2 - curveH > y1) {
          pathD = `M ${x1} ${y1} L ${x1} ${y2 - curveH} C ${x1} ${y2 - curveH + d}, ${x2} ${y2 - d}, ${x2} ${y2}`;
        } else {
          pathD = `M ${x1} ${y1} C ${x1} ${y1 + d}, ${x2} ${y2 - d}, ${x2} ${y2}`;
        }

        rails.push({
          pathD,
          color,
          isStraight: false,
        });
      }
    }

    return rails;
  }

  private static getCategory(node: ASTNode): 'Stmt' | 'Expr' | 'Literal' | 'Ident' | 'Fn' {
    switch (node.type) {
      case 'FunctionDeclaration': return 'Fn';
      case 'Literal': return 'Literal';
      case 'Identifier': return 'Ident';
      case 'BinaryExpression':
      case 'UnaryExpression':
      case 'CallExpression':
        return 'Expr';
      default:
        return 'Stmt';
    }
  }

  private static getLabel(node: ASTNode): string {
    switch (node.type) {
      case 'Program': return 'Program';
      case 'VariableDeclaration': return `let ${node.identifier} = …`;
      case 'Assignment': return `${node.identifier} = …`;
      case 'PrintStatement': return 'print(…)';
      case 'IfStatement': return 'if (condition)';
      case 'WhileStatement': return 'while (condition)';
      case 'BlockStatement': return '{ block }';
      case 'FunctionDeclaration': return `fn ${node.name}(${node.params.join(', ')})`;
      case 'ReturnStatement': return node.value ? 'return expression' : 'return';
      case 'BinaryExpression': return `op '${node.operator}'`;
      case 'UnaryExpression': return `op '${node.operator}'`;
      case 'Literal': return String(node.raw ?? node.value);
      case 'Identifier': return node.name;
      case 'CallExpression': return `${node.callee}(…)`;
      default: return (node as any).type;
    }
  }

  private static getChildEntries(node: ASTNode): Array<{ node: ASTNode; slot: string }> {
    switch (node.type) {
      case 'Program':
        return node.body.map((s, i) => ({ node: s, slot: `stmt[${i}]` }));
      case 'VariableDeclaration':
        return [{ node: node.initializer, slot: 'init' }];
      case 'Assignment':
        return [{ node: node.value, slot: 'value' }];
      case 'PrintStatement':
        return [{ node: node.expression, slot: 'expr' }];
      case 'ExpressionStatement':
        return [{ node: node.expression, slot: 'expr' }];
      case 'BlockStatement':
        return node.body.map((s, i) => ({ node: s, slot: `stmt[${i}]` }));
      case 'IfStatement': {
        const entries: Array<{ node: ASTNode; slot: string }> = [
          { node: node.condition, slot: 'condition' },
          { node: node.consequent, slot: 'consequent' },
        ];
        if (node.alternate) entries.push({ node: node.alternate, slot: 'alternate' });
        return entries;
      }
      case 'WhileStatement':
        return [
          { node: node.condition, slot: 'condition' },
          { node: node.body, slot: 'body' },
        ];
      case 'FunctionDeclaration':
        return [{ node: node.body, slot: 'body' }];
      case 'ReturnStatement':
        return node.value ? [{ node: node.value, slot: 'value' }] : [];
      case 'BinaryExpression':
        return [
          { node: node.left, slot: 'left' },
          { node: node.right, slot: 'right' },
        ];
      case 'UnaryExpression':
        return [{ node: node.argument, slot: 'arg' }];
      case 'CallExpression':
        return node.args.map((a, i) => ({ node: a, slot: `arg[${i}]` }));
      default:
        return [];
    }
  }
}
