import { ASTNode, ProgramNode } from '../../shared/AstNodeTypes';

export interface LayoutNode {
  id: string;
  node: ASTNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  children: LayoutNode[];
}

export interface TreeDimensions {
  width: number;
  height: number;
  nodes: Map<string, LayoutNode>;
  root: LayoutNode;
}

export class HierarchyCalculator {
  private static readonly NODE_WIDTH = 180;
  private static readonly NODE_HEIGHT = 44;
  private static readonly HORIZONTAL_GAP = 28;
  private static readonly VERTICAL_GAP = 64;

  public static calculate(program: ProgramNode): TreeDimensions {
    const nodeMap = new Map<string, LayoutNode>();
    const root = this.buildHierarchy(program, 0, nodeMap);
    let currentX = 40;

    const assignPositions = (lNode: LayoutNode, depth: number): number => {
      lNode.y = 40 + depth * (this.NODE_HEIGHT + this.VERTICAL_GAP);

      if (lNode.children.length === 0) {
        lNode.x = currentX;
        currentX += this.NODE_WIDTH + this.HORIZONTAL_GAP;
        return lNode.x;
      }

      const childXs = lNode.children.map(child => assignPositions(child, depth + 1));
      const minChildX = Math.min(...childXs);
      const maxChildX = Math.max(...childXs);
      lNode.x = (minChildX + maxChildX) / 2;
      return lNode.x;
    };

    assignPositions(root, 0);

    let maxX = 0;
    let maxY = 0;
    nodeMap.forEach(n => {
      maxX = Math.max(maxX, n.x + n.width + 40);
      maxY = Math.max(maxY, n.y + n.height + 40);
    });

    return {
      width: Math.max(maxX, 800),
      height: Math.max(maxY, 600),
      nodes: nodeMap,
      root,
    };
  }

  private static buildHierarchy(node: ASTNode, depth: number, map: Map<string, LayoutNode>): LayoutNode {
    const childrenNodes = this.getChildNodes(node);
    const layoutNode: LayoutNode = {
      id: node.id,
      node,
      x: 0,
      y: 0,
      width: this.NODE_WIDTH,
      height: this.NODE_HEIGHT,
      depth,
      children: [],
    };
    map.set(node.id, layoutNode);
    layoutNode.children = childrenNodes.map(c => this.buildHierarchy(c, depth + 1, map));
    return layoutNode;
  }

  private static getChildNodes(node: ASTNode): ASTNode[] {
    switch (node.type) {
      case 'Program': return node.body;
      case 'VariableDeclaration': return [node.initializer];
      case 'Assignment': return [node.value];
      case 'PrintStatement': return [node.expression];
      case 'ExpressionStatement': return [node.expression];
      case 'BlockStatement': return node.body;
      case 'IfStatement': return node.alternate ? [node.condition, node.consequent, node.alternate] : [node.condition, node.consequent];
      case 'WhileStatement': return [node.condition, node.body];
      case 'FunctionDeclaration': return [node.body];
      case 'ReturnStatement': return node.value ? [node.value] : [];
      case 'BinaryExpression': return [node.left, node.right];
      case 'UnaryExpression': return [node.argument];
      case 'CallExpression': return node.args;
      default: return [];
    }
  }
}
