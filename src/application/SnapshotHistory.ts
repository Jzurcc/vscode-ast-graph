import { StepSnapshot } from '../shared/StepSnapshot';

export class SnapshotHistory {
  private readonly snapshots: StepSnapshot[];
  private currentIndex = -1;

  constructor(snapshots: StepSnapshot[] = []) {
    this.snapshots = snapshots;
    this.currentIndex = snapshots.length > 0 ? 0 : -1;
  }

  public getCurrent(): StepSnapshot | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.snapshots.length) {
      return this.snapshots[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalSteps(): number {
    return this.snapshots.length;
  }

  public stepForward(): StepSnapshot | null {
    if (this.currentIndex < this.snapshots.length - 1) {
      this.currentIndex++;
      return this.getCurrent();
    }
    return null;
  }

  public stepBackward(): StepSnapshot | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrent();
    }
    return null;
  }

  public jumpTo(index: number): StepSnapshot | null {
    if (index >= 0 && index < this.snapshots.length) {
      this.currentIndex = index;
      return this.getCurrent();
    }
    return null;
  }

  public reset(): StepSnapshot | null {
    this.currentIndex = this.snapshots.length > 0 ? 0 : -1;
    return this.getCurrent();
  }

  public isAtStart(): boolean {
    return this.currentIndex <= 0;
  }

  public isAtEnd(): boolean {
    return this.currentIndex >= this.snapshots.length - 1;
  }

  public getAll(): StepSnapshot[] {
    return this.snapshots;
  }
}
