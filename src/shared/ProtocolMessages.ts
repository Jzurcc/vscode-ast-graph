import { ProgramNode } from './AstNodeTypes';
import { StepSnapshot } from './StepSnapshot';
import { SourceLocation } from './SourceLocation';
import { Token } from '../domain/lexer/Token';

export type HostToWebviewMsg =
  | {
      type: 'INIT_PROGRAM';
      payload: {
        ast: ProgramNode;
        code: string;
        tokens: Token[];
        snapshots: StepSnapshot[];
        executionTimeMs: number;
      };
    }
  | {
      type: 'UPDATE_STEP';
      payload: {
        stepIndex: number;
      };
    }
  | {
      type: 'PLAY_STATE_CHANGED';
      payload: {
        isPlaying: boolean;
      };
    }
  | {
      type: 'EXECUTION_COMPLETE';
      payload: {
        totalSteps: number;
      };
    }
  | {
      type: 'REPORT_ERROR';
      payload: {
        message: string;
        loc?: SourceLocation;
      };
    };

export type WebviewToHostMsg =
  | { type: 'WEBVIEW_READY' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'JUMP_TO_STEP'; payload: { stepIndex: number } }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SELECT_NODE'; payload: { nodeId: string; loc: SourceLocation } };
