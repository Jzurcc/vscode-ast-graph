export interface Point {
  x: number;
  y: number;
}

export class BezierPathBuilder {
  private static readonly RAIL_PALETTE = [
    '#38bdf8', // Cyan
    '#34d399', // Emerald
    '#a78bfa', // Purple
    '#fbbf24', // Amber
    '#f472b6', // Rose
    '#60a5fa', // Blue
  ];

  public static buildSmoothRail(from: Point, to: Point): string {
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  }

  public static getRailColor(depth: number): string {
    return this.RAIL_PALETTE[depth % this.RAIL_PALETTE.length];
  }
}
