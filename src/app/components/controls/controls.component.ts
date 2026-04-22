import { Component, inject, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls-panel">
      <!-- Top actions -->
      <div class="action-buttons">
        <button 
          class="btn icon-btn" 
          [class.active]="game.showHint()" 
          (click)="game.toggleHint()"
          [title]="i18n.t('hint')"
        >
          💡
        </button>
        <button 
          class="btn icon-btn" 
          (click)="onRetry()"
          [title]="i18n.t('retry')"
        >
          🔄
        </button>
        <button 
          class="btn icon-btn" 
          (click)="onShare()"
          [title]="i18n.t('share')"
        >
          📤
        </button>
        <button 
          class="btn primary-btn" 
          [class.pulse]="game.puzzleComplete()"
          (click)="onNext()"
        >
          {{ i18n.t('nextPuzzle') }} ⏭️
        </button>
      </div>
    </div>
  `,
  styleUrl: './controls.component.css',
})
export class ControlsComponent {
  @Output() nextPuzzle = new EventEmitter<void>();
  @Output() retryPuzzle = new EventEmitter<void>();
  @Output() sharePuzzle = new EventEmitter<void>();

  readonly game = inject(GameService);
  readonly theme = inject(ThemeService);
  readonly storage = inject(StorageService);
  readonly i18n = inject(I18nService);

  onNext() {
    this.nextPuzzle.emit();
  }

  onRetry() {
    this.retryPuzzle.emit();
  }

  onShare() {
    this.sharePuzzle.emit();
  }
}

