import { Component, Input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hint-arrow',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="hint-svg" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="rgba(255,220,0,0.9)" />
        </marker>
      </defs>
      @if (arrowPath()) {
        <line
          [attr.x1]="arrowPath()!.x1"
          [attr.y1]="arrowPath()!.y1"
          [attr.x2]="arrowPath()!.x2"
          [attr.y2]="arrowPath()!.y2"
          stroke="rgba(255,220,0,0.85)"
          stroke-width="18"
          stroke-linecap="round"
          stroke-dasharray="28 14"
          marker-end="url(#arrowhead)"
          class="hint-line"
        />
      }
    </svg>
  `,
  styles: [`
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
    }
    .hint-svg {
      width: 100%;
      height: 100%;
    }
    .hint-line {
      animation: dashFlow 1s linear infinite;
    }
    @keyframes dashFlow {
      to { stroke-dashoffset: -42; }
    }
  `],
})
export class HintArrowComponent {
  @Input() from = '';
  @Input() to = '';
  @Input() orientation: 'white' | 'black' = 'white';

  readonly arrowPath = computed(() => {
    if (!this.from || !this.to) return null;
    return this.computeArrow(this.from, this.to, this.orientation);
  });

  private squareToXY(sq: string, orientation: 'white' | 'black'): { x: number; y: number } {
    const files = 'abcdefgh';
    const fileIdx = files.indexOf(sq[0]);
    const rankIdx = parseInt(sq[1]) - 1;
    const cellSize = 100;

    const col = orientation === 'white' ? fileIdx : 7 - fileIdx;
    const row = orientation === 'white' ? 7 - rankIdx : rankIdx;

    return {
      x: col * cellSize + cellSize / 2,
      y: row * cellSize + cellSize / 2,
    };
  }

  private computeArrow(from: string, to: string, orientation: 'white' | 'black') {
    const start = this.squareToXY(from, orientation);
    const end = this.squareToXY(to, orientation);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    const shrink = 20;
    const scale = (len - shrink) / len;

    return {
      x1: start.x + (dx * 0.15),
      y1: start.y + (dy * 0.15),
      x2: start.x + dx * scale,
      y2: start.y + dy * scale,
    };
  }
}
