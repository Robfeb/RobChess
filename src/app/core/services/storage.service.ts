import { Injectable, signal } from '@angular/core';
import { Level } from './puzzle.service';

export interface PuzzlePlay {
  id: string;
  errors: number;
  date: number;
}

export interface Progress {
  solvedIds: Set<string>;
  crowns: Record<string, number>; // level -> crown count
  completedBatches: Record<string, Set<number>>; // level -> set of completed batchIndices
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly SOLVED_KEY = 'rob-chess-solved';
  private readonly CROWNS_KEY = 'rob-chess-crowns';
  private readonly BATCHES_KEY = 'rob-chess-batches';
  private readonly LANG_KEY = 'rob-chess-lang';
  private readonly BOARD_THEME_KEY = 'rob-chess-board-theme';
  private readonly PIECE_SET_KEY = 'rob-chess-piece-set';
  private readonly DARK_MODE_KEY = 'rob-chess-dark-mode';
  private readonly TUTORIAL_SEEN_KEY = 'rob-chess-tutorial-seen';
  private readonly RINGS_KEY = 'rob-chess-rings';
  private readonly SOLVED_COUNT_KEY = 'rob-chess-solved-count';
  private readonly SOUND_KEY = 'rob-chess-sound-enabled';
  private readonly RANDOM_NEXT_KEY = 'rob-chess-random-next';
  private readonly PLAYS_KEY = 'rob-chess-plays';
  private readonly COINS_KEY = 'rob-chess-coins';

  readonly totalCrowns = signal(0);
  readonly totalSolved = signal(0);
  readonly soundEnabled = signal(true);
  readonly randomNext = signal(false);
  readonly totalCoins = signal(0);
  /** Crowns earned in the last puzzle (for overlay display) */
  readonly lastCrownsEarned = signal(0);
  /** Coins earned in the last puzzle (for overlay display) */
  readonly lastCoinsEarned = signal(0);

  constructor() {
    this.totalCrowns.set(this.getAllCrowns());
    this.totalSolved.set(this.getSolvedCount());
    this.soundEnabled.set(this.getSoundEnabled());
    this.randomNext.set(this.getRandomNext());
    this.totalCoins.set(this.getCoins());
  }

  // --- Solved Puzzles ---
  getSolvedIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.SOLVED_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  markSolved(puzzleId: string): void {
    const ids = this.getSolvedIds();
    ids.add(puzzleId);
    localStorage.setItem(this.SOLVED_KEY, JSON.stringify([...ids]));
  }

  isPuzzleSolved(puzzleId: string): boolean {
    return this.getSolvedIds().has(puzzleId);
  }

  // --- Play History ---
  savePlay(puzzleId: string, errors: number): void {
    const plays = this.getAllPlays();
    plays[puzzleId] = {
      id: puzzleId,
      errors: errors,
      date: Date.now()
    };
    localStorage.setItem(this.PLAYS_KEY, JSON.stringify(plays));
    
    // Also mark as solved for batch tracking
    this.markSolved(puzzleId);
  }

  getPlay(puzzleId: string): PuzzlePlay | null {
    return this.getAllPlays()[puzzleId] || null;
  }

  private getAllPlays(): Record<string, PuzzlePlay> {
    try {
      const raw = localStorage.getItem(this.PLAYS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // --- Crowns ---
  getCrowns(level: Level): number {
    try {
      const raw = localStorage.getItem(this.CROWNS_KEY);
      const crowns: Record<string, number> = raw ? JSON.parse(raw) : {};
      return crowns[level] ?? 0;
    } catch {
      return 0;
    }
  }

  private getAllCrowns(): number {
    try {
      const raw = localStorage.getItem(this.CROWNS_KEY);
      if (!raw) return 0;
      const crowns: Record<string, number> = JSON.parse(raw);
      return Object.values(crowns).reduce((sum, v) => sum + v, 0);
    } catch {
      return 0;
    }
  }

  markBatchComplete(level: Level, batchIndex: number): boolean {
    const completed = this.getCompletedBatches(level);
    if (completed.has(batchIndex)) return false; // already counted

    completed.add(batchIndex);
    this.saveCompletedBatches(level, completed);

    // Award 50 crowns for completing a batch
    const BATCH_CROWN_BONUS = 50;
    const raw = localStorage.getItem(this.CROWNS_KEY);
    const crowns: Record<string, number> = raw ? JSON.parse(raw) : {};
    crowns[level] = (crowns[level] ?? 0) + BATCH_CROWN_BONUS;
    localStorage.setItem(this.CROWNS_KEY, JSON.stringify(crowns));
    this.totalCrowns.set(this.getAllCrowns());
    return true;
  }

  getCompletedBatches(level: Level): Set<number> {
    try {
      const raw = localStorage.getItem(`${this.BATCHES_KEY}-${level}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveCompletedBatches(level: Level, batches: Set<number>): void {
    localStorage.setItem(`${this.BATCHES_KEY}-${level}`, JSON.stringify([...batches]));
  }

  // --- Preferences ---
  getLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) ?? 'en';
  }

  setLanguage(lang: string): void {
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getBoardTheme(): string {
    return localStorage.getItem(this.BOARD_THEME_KEY) ?? 'brown';
  }

  setBoardTheme(theme: string): void {
    localStorage.setItem(this.BOARD_THEME_KEY, theme);
  }

  getPieceSet(): string {
    return localStorage.getItem(this.PIECE_SET_KEY) ?? 'cburnett';
  }

  setPieceSet(set: string): void {
    localStorage.setItem(this.PIECE_SET_KEY, set);
  }

  getDarkMode(): boolean {
    return localStorage.getItem(this.DARK_MODE_KEY) !== 'false';
  }

  setDarkMode(val: boolean): void {
    localStorage.setItem(this.DARK_MODE_KEY, String(val));
  }

  // --- Tutorial ---
  hasSeenTutorial(): boolean {
    return localStorage.getItem(this.TUTORIAL_SEEN_KEY) === 'true';
  }

  setTutorialSeen(): void {
    localStorage.setItem(this.TUTORIAL_SEEN_KEY, 'true');
  }

  // --- Sound ---
  getSoundEnabled(): boolean {
    return localStorage.getItem(this.SOUND_KEY) !== 'false';
  }

  setSoundEnabled(val: boolean): void {
    localStorage.setItem(this.SOUND_KEY, String(val));
    this.soundEnabled.set(val);
  }

  // --- Navigation ---
  getRandomNext(): boolean {
    return localStorage.getItem(this.RANDOM_NEXT_KEY) === 'true';
  }

  setRandomNext(val: boolean): void {
    localStorage.setItem(this.RANDOM_NEXT_KEY, String(val));
    this.randomNext.set(val);
  }

  isFirstTime(): boolean {
    return this.getSolvedCount() === 0 && localStorage.length <= 1; // 1 because of maybe some default
  }

  // --- Rings & Global Progress ---
  getSolvedCount(): number {
    return parseInt(localStorage.getItem(this.SOLVED_COUNT_KEY) ?? '0', 10);
  }

  incrementSolvedCount(level: Level): void {
    const nextSolved = this.getSolvedCount() + 1;
    localStorage.setItem(this.SOLVED_COUNT_KEY, String(nextSolved));
    this.totalSolved.set(nextSolved);

    // Award 1 crown every 10 puzzles solved
    if (nextSolved > 0 && nextSolved % 10 === 0) {
      const raw = localStorage.getItem(this.CROWNS_KEY);
      const crowns: Record<string, number> = raw ? JSON.parse(raw) : {};
      crowns[level] = (crowns[level] ?? 0) + 1;
      localStorage.setItem(this.CROWNS_KEY, JSON.stringify(crowns));
      this.totalCrowns.set(this.getAllCrowns());
    }
  }

  // --- Coins ---
  getCoins(): number {
    return parseInt(localStorage.getItem(this.COINS_KEY) ?? '0', 10);
  }

  addCoins(amount: number): void {
    const next = this.getCoins() + amount;
    localStorage.setItem(this.COINS_KEY, String(next));
    this.totalCoins.set(next);
    this.lastCoinsEarned.set(amount);
  }

  addCrowns(level: Level, amount: number): void {
    const raw = localStorage.getItem(this.CROWNS_KEY);
    const crowns: Record<string, number> = raw ? JSON.parse(raw) : {};
    crowns[level] = (crowns[level] ?? 0) + amount;
    localStorage.setItem(this.CROWNS_KEY, JSON.stringify(crowns));
    this.totalCrowns.set(this.getAllCrowns());
    this.lastCrownsEarned.set(amount);
  }
}
