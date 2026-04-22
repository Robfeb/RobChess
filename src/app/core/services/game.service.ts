import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Chess } from 'chess.js';
import { Puzzle } from './puzzle.service';
import { SoundService } from './sound.service';

export interface Square {
  file: string;
  rank: number;
  algebraic: string;
}

export interface BoardState {
  fen: string;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
  inCheck: boolean;
  checkSquare: string | null;
  orientation: 'white' | 'black';
}

export type MoveResult = 'correct' | 'wrong' | 'puzzle-complete';
export type HintMove = { from: string; to: string } | null;

@Injectable({ providedIn: 'root' })
export class GameService {
  private sound = inject(SoundService);
  private chess = new Chess();
  private puzzle: Puzzle | null = null;
  private solutionIndex = 0;
  private selectedSquare: string | null = null;
  private lastMoveFrom: string | null = null;
  private lastMoveTo: string | null = null;
  private _orientation: 'white' | 'black' = 'white';
  private _showLegalMoves = signal(true);
  private _showHint = signal(false);
  private _puzzleComplete = signal(false);
  private _errorSquare = signal<string | null>(null);
  
  private _errorCount = signal(0);
  private _streakCounter = signal(0);

  readonly moveResult$ = new Subject<MoveResult>();
  readonly puzzleComplete$ = new Subject<void>();

  readonly boardState = signal<BoardState>({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    selectedSquare: null,
    legalMoves: [],
    lastMoveFrom: null,
    lastMoveTo: null,
    inCheck: false,
    checkSquare: null,
    orientation: 'white',
  });

  readonly showLegalMoves = this._showLegalMoves.asReadonly();
  readonly showHint = this._showHint.asReadonly();
  readonly puzzleComplete = this._puzzleComplete.asReadonly();
  readonly errorSquare = this._errorSquare.asReadonly();
  readonly errorCount = this._errorCount.asReadonly();
  readonly streakCounter = this._streakCounter.asReadonly();

  loadPuzzle(puzzle: Puzzle): void {
    this.puzzle = puzzle;
    this.solutionIndex = 0;
    this.selectedSquare = null;
    this.lastMoveFrom = null;
    this.lastMoveTo = null;
    this._puzzleComplete.set(false);
    this._showHint.set(false);
    this._errorSquare.set(null);

    this.chess.load(puzzle.fen);
    this.executeSetupMove(puzzle.setup);
  }

  private executeSetupMove(uciMove: string): void {
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove.length === 5 ? uciMove[4] : undefined;

    try {
      this.chess.move({ from, to, promotion });
      this.lastMoveFrom = from;
      this.lastMoveTo = to;

      // After setup move, the player whose turn it is becomes the user
      this._orientation = this.chess.turn() === 'w' ? 'white' : 'black';
    } catch {
      // silent: bad setup move in data
    }

    this.emitBoardState();
  }

  selectSquare(algebraic: string): void {
    if (this._puzzleComplete()) return;

    const currentlySelected = this.selectedSquare;

    // If already have a piece selected, try to move
    if (currentlySelected) {
      const legalMoves = this.getLegalMovesFrom(currentlySelected);
      const isLegalTarget = legalMoves.some(m => m.to === algebraic);

      if (isLegalTarget) {
        this.attemptMove(currentlySelected, algebraic);
        return;
      }

      // Re-select if clicking own piece
      const piece = this.chess.get(algebraic as any);
      if (piece && piece.color === this.chess.turn()) {
        this.selectedSquare = algebraic;
        this.emitBoardState();
        return;
      }

      // Deselect
      this.selectedSquare = null;
      this.emitBoardState();
      return;
    }

    // Select piece
    const piece = this.chess.get(algebraic as any);
    if (piece && piece.color === this.chess.turn()) {
      this.selectedSquare = algebraic;
      this.emitBoardState();
    }
  }

  private getLegalMovesFrom(from: string): { from: string; to: string; promotion?: string }[] {
    return this.chess.moves({ square: from as any, verbose: true }) as any;
  }

  private attemptMove(from: string, to: string): void {
    const solution = this.puzzle?.solution;
    if (!solution) return;

    const expectedUci = solution[this.solutionIndex];
    const expectedFrom = expectedUci.substring(0, 2);
    const expectedTo = expectedUci.substring(2, 4);
    const expectedPromotion = expectedUci.length === 5 ? expectedUci[4] : undefined;

    const moveUci = `${from}${to}`;
    const isCorrect = from === expectedFrom && to === expectedTo;

    if (isCorrect) {
      // Execute the correct move
      const promotion = expectedPromotion || this.detectPromotion(from, to);
      this.chess.move({ from, to, promotion });
      this.lastMoveFrom = from;
      this.lastMoveTo = to;
      this.selectedSquare = null;
      this.solutionIndex++;

      if (this.solutionIndex >= solution.length) {
        // Puzzle complete!
        this._puzzleComplete.set(true);
        this.emitBoardState();
        this.sound.playWin();
        this.moveResult$.next('puzzle-complete');
        this.puzzleComplete$.next();
      } else {
        // Execute opponent's response
        // Increment streak only for correct intermediate moves, not on the final puzzle complete to prevent over-counting if you want per-move tracking. 
        // We'll increment on every correct move.
        this.emitBoardState();
        this.moveResult$.next('correct');
        setTimeout(() => this.executeOpponentMove(), 600);
      }
      this._streakCounter.update(v => v + 1);
    } else {
      // Wrong move — show error and undo
      this._errorSquare.set(to);
      this._streakCounter.set(0);
      this._errorCount.update(v => v + 1);
      this.selectedSquare = null;
      this.sound.playFail();
      this.moveResult$.next('wrong');

      setTimeout(() => {
        this._errorSquare.set(null);
        this.emitBoardState();
      }, 600);
    }
  }

  private detectPromotion(from: string, to: string): string | undefined {
    const piece = this.chess.get(from as any);
    if (!piece || piece.type !== 'p') return undefined;
    const toRank = parseInt(to[1]);
    if ((piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1)) {
      return 'q';
    }
    return undefined;
  }

  private executeOpponentMove(): void {
    const solution = this.puzzle?.solution;
    if (!solution || this.solutionIndex >= solution.length) return;

    const uci = solution[this.solutionIndex];
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promotion = uci.length === 5 ? uci[4] : undefined;

    try {
      this.chess.move({ from, to, promotion });
      this.lastMoveFrom = from;
      this.lastMoveTo = to;
      this.solutionIndex++;
    } catch {
      // bad move data — skip
    }

    this.emitBoardState();
  }

  getHintMove(): HintMove {
    const solution = this.puzzle?.solution;
    if (!solution || this.solutionIndex >= solution.length) return null;

    const uci = solution[this.solutionIndex];
    return {
      from: uci.substring(0, 2),
      to: uci.substring(2, 4),
    };
  }

  toggleLegalMoves(): void {
    this._showLegalMoves.update(v => !v);
  }

  toggleHint(): void {
    this._showHint.update(v => !v);
  }

  get currentFen(): string {
    return this.chess.fen();
  }

  get orientation(): 'white' | 'black' {
    return this._orientation;
  }

  private emitBoardState(): void {
    const legalMoves = this.selectedSquare
      ? this.getLegalMovesFrom(this.selectedSquare).map(m => m.to)
      : [];

    let checkSquare: string | null = null;
    if (this.chess.inCheck()) {
      // Find king's position
      const board = this.chess.board();
      const turn = this.chess.turn();
      outer: for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const cell = board[r][f];
          if (cell && cell.type === 'k' && cell.color === turn) {
            const files = 'abcdefgh';
            checkSquare = `${files[f]}${8 - r}`;
            break outer;
          }
        }
      }
    }

    this.boardState.set({
      fen: this.chess.fen(),
      selectedSquare: this.selectedSquare,
      legalMoves,
      lastMoveFrom: this.lastMoveFrom,
      lastMoveTo: this.lastMoveTo,
      inCheck: this.chess.inCheck(),
      checkSquare,
      orientation: this._orientation,
    });
  }

  reset(): void {
    if (this.puzzle) {
      this.loadPuzzle(this.puzzle);
    }
  }
}
