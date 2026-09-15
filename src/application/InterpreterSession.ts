import { Lexer } from '../domain/lexer/Lexer';
import { Token } from '../domain/lexer/Token';
import { Parser } from '../domain/parser/Parser';
import { TreeWalkEngine } from '../domain/interpreter/TreeWalkEngine';
import { ProgramNode } from '../shared/AstNodeTypes';
import { StepSnapshot } from '../shared/StepSnapshot';
import { SnapshotHistory } from './SnapshotHistory';
import { SourceLocation } from '../shared/SourceLocation';

export interface SessionListeners {
  onStepChanged: (snapshot: StepSnapshot, index: number, total: number) => void;
  onPlayStateChanged: (isPlaying: boolean) => void;
  onError: (message: string, loc?: SourceLocation) => void;
}

export class InterpreterSession {
  private program: ProgramNode | null = null;
  private history: SnapshotHistory = new SnapshotHistory();
  private isPlaying = false;
  private playTimer: NodeJS.Timeout | null = null;
  private playbackSpeedMs = 350;
  private listeners: SessionListeners;

  constructor(listeners: SessionListeners) {
    this.listeners = listeners;
  }

  public loadSource(source: string): { ast: ProgramNode; tokens: Token[]; snapshots: StepSnapshot[]; executionTimeMs: number } | null {
    this.stopPlayback();
    const startTime = performance.now();
    try {
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      this.program = parser.parse();

      const engine = new TreeWalkEngine();
      const generator = engine.execute(this.program);
      const collectedSnapshots: StepSnapshot[] = [];

      for (const snapshot of generator) {
        collectedSnapshots.push(snapshot);
      }

      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      this.history = new SnapshotHistory(collectedSnapshots);
      const initial = this.history.getCurrent();
      if (initial) {
        this.listeners.onStepChanged(initial, 0, collectedSnapshots.length);
      }
      return { ast: this.program, tokens, snapshots: collectedSnapshots, executionTimeMs };
    } catch (err: any) {
      this.listeners.onError(err.message ?? String(err), err.loc);
      return null;
    }
  }

  public stepForward(): void {
    const next = this.history.stepForward();
    if (next) {
      this.listeners.onStepChanged(next, this.history.getCurrentIndex(), this.history.getTotalSteps());
    } else {
      this.stopPlayback();
    }
  }

  public stepBackward(): void {
    this.stopPlayback();
    const prev = this.history.stepBackward();
    if (prev) {
      this.listeners.onStepChanged(prev, this.history.getCurrentIndex(), this.history.getTotalSteps());
    }
  }

  public jumpToStep(index: number): void {
    this.stopPlayback();
    const target = this.history.jumpTo(index);
    if (target) {
      this.listeners.onStepChanged(target, this.history.getCurrentIndex(), this.history.getTotalSteps());
    }
  }

  public reset(): void {
    this.stopPlayback();
    const initial = this.history.reset();
    if (initial) {
      this.listeners.onStepChanged(initial, 0, this.history.getTotalSteps());
    }
  }

  public startPlayback(): void {
    if (this.isPlaying || this.history.isAtEnd()) return;
    this.isPlaying = true;
    this.listeners.onPlayStateChanged(true);
    this.runPlaybackLoop();
  }

  public stopPlayback(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
    this.listeners.onPlayStateChanged(false);
  }

  public setSpeed(ms: number): void {
    this.playbackSpeedMs = Math.max(50, Math.min(ms, 2000));
  }

  private runPlaybackLoop(): void {
    if (!this.isPlaying) return;
    if (this.history.isAtEnd()) {
      this.stopPlayback();
      return;
    }
    this.stepForward();
    this.playTimer = setTimeout(() => this.runPlaybackLoop(), this.playbackSpeedMs);
  }

  public dispose(): void {
    this.stopPlayback();
  }
}
