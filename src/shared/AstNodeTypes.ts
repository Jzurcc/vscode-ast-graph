import { SourceLocation } from './SourceLocation';

export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=';
export type UnaryOperator = '-' | '!';

export interface BaseNode {
  id: string;
  type: string;
  loc: SourceLocation;
}

export interface ProgramNode extends BaseNode {
  type: 'Program';
  body: StatementNode[];
}

export interface VariableDeclarationNode extends BaseNode {
  type: 'VariableDeclaration';
  identifier: string;
  initializer: ExpressionNode;
}

export interface AssignmentNode extends BaseNode {
  type: 'Assignment';
  identifier: string;
  value: ExpressionNode;
}

export interface PrintStatementNode extends BaseNode {
  type: 'PrintStatement';
  expression: ExpressionNode;
}

export interface BlockStatementNode extends BaseNode {
  type: 'BlockStatement';
  body: StatementNode[];
}

export interface IfStatementNode extends BaseNode {
  type: 'IfStatement';
  condition: ExpressionNode;
  consequent: BlockStatementNode;
  alternate?: BlockStatementNode | IfStatementNode;
}

export interface WhileStatementNode extends BaseNode {
  type: 'WhileStatement';
  condition: ExpressionNode;
  body: BlockStatementNode;
}

export interface FunctionDeclarationNode extends BaseNode {
  type: 'FunctionDeclaration';
  name: string;
  params: string[];
  body: BlockStatementNode;
}

export interface ReturnStatementNode extends BaseNode {
  type: 'ReturnStatement';
  value?: ExpressionNode;
}

export type StatementNode =
  | VariableDeclarationNode
  | AssignmentNode
  | PrintStatementNode
  | BlockStatementNode
  | IfStatementNode
  | WhileStatementNode
  | FunctionDeclarationNode
  | ReturnStatementNode
  | ExpressionStatementNode;

export interface ExpressionStatementNode extends BaseNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
}

export interface BinaryExpressionNode extends BaseNode {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface UnaryExpressionNode extends BaseNode {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  argument: ExpressionNode;
}

export interface LiteralNode extends BaseNode {
  type: 'Literal';
  value: number | string | boolean | null;
  raw: string;
}

export interface IdentifierNode extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface CallExpressionNode extends BaseNode {
  type: 'CallExpression';
  callee: string;
  args: ExpressionNode[];
}

export type ExpressionNode =
  | BinaryExpressionNode
  | UnaryExpressionNode
  | LiteralNode
  | IdentifierNode
  | CallExpressionNode;

export type ASTNode = ProgramNode | StatementNode | ExpressionNode;
