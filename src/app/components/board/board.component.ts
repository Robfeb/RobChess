import {
  Component, inject, computed, ChangeDetectionStrategy, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { HintArrowComponent } from '../hint-arrow/hint-arrow.component';
import { I18nService } from '../../core/services/i18n.service';

interface CellData {
  algebraic: string;
  file: string;
  rank: number;
  fileIndex: number;
  rankIndex: number;
  isLight: boolean;
  piece: { type: string; color: 'w' | 'b' } | null;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, HintArrowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="board-container">
      <!-- "You play as" banner above board -->
      <div class="player-color-banner" [class.is-white]="boardState().orientation === 'white'" [class.is-black]="boardState().orientation === 'black'">
        <span class="player-dot" [class.is-white]="boardState().orientation === 'white'" [class.is-black]="boardState().orientation === 'black'"></span>
        <span>{{ i18n.t('youPlayAs') }} <strong>{{ boardState().orientation === 'white' ? i18n.t('white') : i18n.t('black') }}</strong></span>
      </div>

      <div class="board-wrapper" [class.flipped]="flipped()">
        <!-- Rank labels -->
        <div class="rank-labels">
          @for (rank of rankLabels(); track rank) {
            <span class="rank-label">{{ rank }}</span>
          }
        </div>

        <!-- Board grid -->
        <div class="board-grid" [style]="boardGridStyle()">
          @for (cell of cells(); track cell.algebraic) {
            <div
              class="square"
              [id]="'sq-' + cell.algebraic"
              [style.background-color]="getSquareColor(cell)"
              [class.selected]="boardState().selectedSquare === cell.algebraic"
              [class.last-move-from]="boardState().lastMoveFrom === cell.algebraic"
              [class.last-move-to]="boardState().lastMoveTo === cell.algebraic"
              [class.check]="boardState().checkSquare === cell.algebraic"
              [class.error]="errorSquare() === cell.algebraic"
              (click)="onSquareClick(cell.algebraic)"
            >
              <!-- Legal move dot -->
              @if (showLegal() && boardState().legalMoves.includes(cell.algebraic)) {
                <div class="legal-dot" [class.capture-ring]="!!cell.piece"></div>
              }

              <!-- Piece element -->
              @if (cell.piece) {
                <div
                  class="piece"
                  [style.background-image]="getPieceUrl(cell.piece.color, cell.piece.type)"
                  [attr.aria-label]="cell.piece.color + cell.piece.type"
                ></div>
              }

              <!-- Coordinates -->
              @if (cell.fileIndex === 0) {
                <span class="coord coord-rank">{{ cell.rank }}</span>
              }
              @if (cell.rankIndex === 7) {
                <span class="coord coord-file">{{ cell.file }}</span>
              }
            </div>
          }
        </div>

        <!-- File labels -->
        <div class="file-labels">
          @for (file of fileLabels(); track file) {
            <span class="file-label">{{ file }}</span>
          }
        </div>

        <!-- Hint arrow overlay -->
        @if (showHint() && hintMove()) {
          <app-hint-arrow
            [from]="hintMove()!.from"
            [to]="hintMove()!.to"
            [orientation]="boardState().orientation"
          ></app-hint-arrow>
        }

        <!-- Puzzle Complete Overlay -->
        @if (puzzleComplete()) {
          <div class="board-overlay complete-overlay">
            <div class="overlay-content">
              <div class="overlay-crown">👑</div>
              <div class="overlay-title">{{ i18n.t('puzzleComplete') }}</div>
              <!-- Rewards earned -->
              <div class="overlay-rewards">
                <div class="reward-chip crowns-chip">
                  <span class="reward-icon">👑</span>
                  <span class="reward-value">+{{ storage.lastCrownsEarned() }}</span>
                </div>
                <div class="reward-chip coins-chip">
                  <span class="reward-icon">🪙</span>
                  <span class="reward-value">+{{ storage.lastCoinsEarned() }}</span>
                </div>
              </div>
              <div class="overlay-actions">
                <button class="overlay-btn next-btn" (click)="onNext()">
                  {{ i18n.t('nextPuzzle') }} ⏭️
                </button>
                <button class="overlay-btn retry-btn" (click)="onRetry()">
                  🔄 {{ i18n.t('retry') }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './board.component.css',
})
export class BoardComponent {
  @Output() nextPuzzle = new EventEmitter<void>();
  @Output() retryPuzzle = new EventEmitter<void>();

  private game = inject(GameService);
  private theme = inject(ThemeService);
  readonly storage = inject(StorageService);
  readonly i18n = inject(I18nService);

  readonly boardState = this.game.boardState;
  readonly showLegal = this.game.showLegalMoves;
  readonly showHint = this.game.showHint;
  readonly errorSquare = this.game.errorSquare;
  readonly puzzleComplete = this.game.puzzleComplete;

  readonly flipped = computed(() => this.boardState().orientation === 'black');

  readonly hintMove = computed(() => this.game.getHintMove());

  readonly cells = computed<CellData[]>(() => {
    const board = this.parseFen(this.boardState().fen);
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const cells: CellData[] = [];

    const ranks = this.flipped()
      ? [1, 2, 3, 4, 5, 6, 7, 8]
      : [8, 7, 6, 5, 4, 3, 2, 1];

    const orderedFiles = this.flipped()
      ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
      : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      const rank = ranks[rankIdx];
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const file = orderedFiles[fileIdx];
        const algebraic = `${file}${rank}`;
        const isLight = (files.indexOf(file) + rank) % 2 === 1;
        const piece = board[algebraic] ?? null;

        cells.push({
          algebraic,
          file,
          rank,
          fileIndex: fileIdx,
          rankIndex: rankIdx,
          isLight,
          piece,
        });
      }
    }
    return cells;
  });

  readonly rankLabels = computed(() => {
    const orientation = this.boardState().orientation;
    return orientation === 'white'
      ? ['8', '7', '6', '5', '4', '3', '2', '1']
      : ['1', '2', '3', '4', '5', '6', '7', '8'];
  });

  readonly fileLabels = computed(() => {
    const orientation = this.boardState().orientation;
    return orientation === 'white'
      ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  });

  readonly boardGridStyle = computed(() => {
    const t = this.theme.boardTheme();
    return `--sq-light: ${t.light}; --sq-dark: ${t.dark}; --sq-selected: ${t.selected}; --sq-legal: ${t.legal}; --sq-last-move: ${t.lastMove}; --sq-check: ${t.check};`;
  });

  getSquareColor(cell: CellData): string {
    return cell.isLight
      ? this.theme.boardTheme().light
      : this.theme.boardTheme().dark;
  }

  getPieceUrl(color: 'w' | 'b', piece: string): string {
    const url = this.theme.getPieceUrl(color, piece);
    return url.startsWith('var(') ? url : `url("${url}")`;
  }

  onSquareClick(algebraic: string): void {
    this.game.selectSquare(algebraic);
  }

  onNext(): void {
    this.nextPuzzle.emit();
  }

  onRetry(): void {
    this.retryPuzzle.emit();
  }

  private parseFen(fen: string): Record<string, { type: string; color: 'w' | 'b' }> {
    const result: Record<string, { type: string; color: 'w' | 'b' }> = {};
    const ranks = fen.split(' ')[0].split('/');
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      const rank = 8 - rankIdx;
      let fileIdx = 0;
      for (const char of ranks[rankIdx]) {
        if (/\d/.test(char)) {
          fileIdx += parseInt(char);
        } else {
          const algebraic = `${files[fileIdx]}${rank}`;
          result[algebraic] = {
            type: char.toLowerCase(),
            color: char === char.toUpperCase() ? 'w' : 'b',
          };
          fileIdx++;
        }
      }
    }
    return result;
  }
}
