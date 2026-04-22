import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { LEVELS } from '../../core/services/puzzle.service';

@Component({
  selector: 'app-crown-tracker',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crown-tracker">
      <div class="total-crowns" title="Total Crowns">
        <span class="crown-icon glow">👑</span>
        <span class="total-count">{{ totalCrowns() }}</span>
      </div>

      <div class="total-rings" title="Total Rings">
        <span class="ring-icon glow">💍</span>
        <span class="total-count">{{ totalRings() }}</span>
      </div>
      
      <div class="level-breakdown">
        @for (level of levels; track level) {
          @if (getCrownsFor(level) > 0) {
            <div class="level-crown" [title]="level">
              <span class="dot" [class]="level"></span>
              <span class="count">{{ getCrownsFor(level) }}</span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .crown-tracker {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--surface);
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }
    .total-crowns, .total-rings {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      font-size: 16px;
      color: var(--text);
    }
    .crown-icon, .ring-icon {
      font-size: 18px;
    }
    .crown-icon.glow {
      filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
    }
    .ring-icon.glow {
      filter: drop-shadow(0 0 4px rgba(0, 191, 255, 0.6));
    }
    .level-breakdown {
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 1px solid var(--border);
      padding-left: 12px;
    }
    .level-crown {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }
    /* Level dot colors */
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot.beginner { background: #4caf50; }
    .dot.intermediate { background: #2196f3; }
    .dot.advanced { background: #9c27b0; }
    .dot.master { background: #ff9800; }
    .dot.grandmaster { background: #f44336; }
  `],
})
export class CrownTrackerComponent {
  private storage = inject(StorageService);
  
  readonly totalCrowns = this.storage.totalCrowns;
  readonly totalRings = this.storage.totalRings;
  readonly levels = LEVELS;

  // Since crowns are local storage based but total is signaled,
  // we will just track them this way and rely on totalCrowns signal change detection mostly
  getCrownsFor(level: string): number {
    return this.storage.getCrowns(level as any);
  }
}
