import {
  Component, inject, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { Puzzle, Level } from '../../core/services/puzzle.service';
import { StorageService, PuzzlePlay } from '../../core/services/storage.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-puzzle-info',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="puzzle-info" [class.complete]="isComplete">
      <!-- Rating badge -->
      <div class="info-row">
        <div class="rating-badge">
          <span class="rating-icon">⚡</span>
          <span class="rating-value">{{ puzzle?.rating }}</span>
          <span class="rating-label">{{ i18n.t('rating') }}</span>
        </div>

        @if (puzzle?.id) {
          <a
            class="lichess-link"
            [href]="'https://lichess.org/training/' + puzzle?.id"
            target="_blank"
            rel="noopener"
            [title]="i18n.t('viewOnLichess')"
          >
            <svg width="18" height="18" viewBox="0 0 50 50" fill="currentColor">
              <path d="M5.375 0C2.41 0 0 2.41 0 5.375v39.25C0 47.59 2.41 50 5.375 50h39.25C47.59 50 50 47.59 50 44.625V5.375C50 2.41 47.59 0 44.625 0H5.375z M25 10 a15 15 0 1 0 0 30 a15 15 0 1 0 0 -30"/>
            </svg>
            <span>Lichess</span>
          </a>
        }
      </div>

      <!-- Progress bar -->
      @if (totalInBatch > 0) {
        <div class="progress-bar-wrapper">
          <div class="progress-label">
            {{ i18n.t('puzzle') }} {{ puzzleIndexInBatch + 1 }} {{ i18n.t('of') }} {{ totalInBatch }}
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="progressPercent"
            ></div>
          </div>
        </div>
      }

      <!-- Themes -->
      @if (puzzle?.themes?.length) {
        <div class="themes-row">
          @for (theme of puzzle!.themes.slice(0, 5); track theme) {
            <button class="theme-chip clickable" (click)="onThemeClick(theme)">
              {{ formatTheme(theme) }}
            </button>
          }
        </div>
      }

      <!-- Game Stats -->
      <div class="stats-row orientation-row">
        <!-- Orientation -->
        <div class="stat-item orientation-badge" [class.is-white]="game.boardState().orientation === 'white'" [class.is-black]="game.boardState().orientation === 'black'">
          <span class="stat-dot" [class.is-white]="game.boardState().orientation === 'white'" [class.is-black]="game.boardState().orientation === 'black'"></span>
          <span class="stat-text">{{ i18n.t('youPlayAs') }} <strong>{{ game.boardState().orientation === 'white' ? i18n.t('white') : i18n.t('black') }}</strong></span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item badges">
          <span class="stat-badge error" [title]="i18n.t('errors')">
            ❌ {{ game.errorCount() }}
          </span>
          <span class="stat-badge streak" [title]="i18n.t('streak')">
            🔥 {{ game.streakCounter() }}
          </span>
        </div>
      </div>

      <!-- Completion overlay -->
      @if (isComplete) {
        <div class="complete-banner">
          <span class="crown">👑</span>
          <span>{{ i18n.t('puzzleComplete') }}</span>
        </div>
      }

      <!-- Already solved badge -->
      @if (isSolved && !isComplete && !previousPlay) {
        <div class="solved-badge">
          <span>✓ {{ i18n.t('solved') }}</span>
        </div>
      }

      <!-- Performance History -->
      @if (previousPlay && !isComplete) {
        <div class="history-banner">
          <div class="history-header">
            <span class="history-icon">📜</span>
            <strong>{{ i18n.t('alreadyPlayed') }}</strong>
          </div>
          <div class="history-stats">
            <span>{{ i18n.t('previousErrors', { count: previousPlay.errors }) }}</span>
            <span class="history-hint">{{ i18n.t('playAgain') }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './puzzle-info.component.css',
})
export class PuzzleInfoComponent {
  @Input() puzzle: Puzzle | null = null;
  @Input() level: Level = 'beginner';
  @Input() batchIndex = 0;
  @Input() puzzleIndexInBatch = 0;
  @Input() totalInBatch = 0;
  @Input() isComplete = false;
  @Input() previousPlay: PuzzlePlay | null = null;
  @Output() themeSelect = new EventEmitter<string>();

  readonly i18n = inject(I18nService);
  private storage = inject(StorageService);
  readonly game = inject(GameService);

  get isSolved(): boolean {
    return this.puzzle ? this.storage.isPuzzleSolved(this.puzzle.id) : false;
  }

  get progressPercent(): number {
    return this.totalInBatch > 0
      ? ((this.puzzleIndexInBatch + 1) / this.totalInBatch) * 100
      : 0;
  }

  formatTheme(theme: string): string {
    return theme
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  onThemeClick(theme: string) {
    this.themeSelect.emit(theme);
  }
}
