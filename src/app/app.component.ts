import { Component, inject, OnInit, signal, effect, ChangeDetectionStrategy, PLATFORM_ID, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from './core/services/game.service';
import { PuzzleService, Level, Puzzle } from './core/services/puzzle.service';
import { PuzzlePlay, StorageService } from './core/services/storage.service';
import { ThemeService, BOARD_THEMES, PIECE_SETS } from './core/services/theme.service';
import { I18nService } from './core/services/i18n.service';

import { BoardComponent } from './components/board/board.component';
import { PuzzleInfoComponent } from './components/puzzle-info/puzzle-info.component';
import { ControlsComponent } from './components/controls/controls.component';
import { LevelSelectorComponent } from './components/level-selector/level-selector.component';
import { CrownTrackerComponent } from './components/crown-tracker/crown-tracker.component';
import { HelpComponent } from './components/help/help.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { CoinDisplayComponent } from './components/coin-display/coin-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    BoardComponent,
    PuzzleInfoComponent,
    ControlsComponent,
    LevelSelectorComponent,
    CrownTrackerComponent,
    HelpComponent,
    TutorialComponent,
    CoinDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  readonly puzzleService = inject(PuzzleService);
  readonly gameService = inject(GameService);
  readonly storageService = inject(StorageService);
  readonly i18n = inject(I18nService);
  readonly themeService = inject(ThemeService);

  readonly currentPuzzle = signal<Puzzle | null>(null);
  readonly currentLevel = signal<Level>('beginner');
  readonly currentBatchIndex = signal<number>(0);
  readonly currentThemeFilter = signal<string | null>(null);

  readonly puzzleIndexInBatch = signal<number>(0);
  readonly totalInBatch = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly previousPlay = signal<PuzzlePlay | null>(null);
  readonly isSettingsOpen = signal(false);

  readonly boardThemes = BOARD_THEMES;
  readonly pieceSets = PIECE_SETS;

  @ViewChild('tutorialModal') tutorialModal!: TutorialComponent;

  toggleHelp(helpComp: HelpComponent) {
    helpComp.open();
  }

  toggleTutorial(tutorialComp: TutorialComponent) {
    tutorialComp.open();
  }

  constructor() {
    // Listen for puzzle complete
    this.gameService.puzzleComplete$.subscribe(() => {
      const p = this.currentPuzzle();
      if (p) {
        // Calculate Coins
        const levelBaseRewards: Record<Level, number> = {
          beginner: 10,
          intermediate: 20,
          advanced: 30,
          master: 40,
          grandmaster: 50
        };
        const base = levelBaseRewards[this.currentLevel()] || 10;
        const deduction = this.gameService.errorCount() * 5;
        const reward = Math.max(0, base - deduction);
        
        this.storageService.addCoins(reward);

        // Save detailed history
        this.storageService.savePlay(p.id, this.gameService.errorCount());
        this.storageService.incrementSolvedCount();
        
        // Wait briefly to show completion, then update batch status
        const isBatchComplete = this.checkBatchCompletion();
        if (isBatchComplete) {
          this.storageService.markBatchComplete(this.currentLevel(), this.currentBatchIndex());
        }
        
        // Refresh local history view
        this.previousPlay.set(this.storageService.getPlay(p.id));
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Auto-show tutorial if first time
      if (this.storageService.isFirstTime() || !this.storageService.hasSeenTutorial()) {
        setTimeout(() => {
          if (this.tutorialModal) {
            this.tutorialModal.open();
          }
        }, 800);
      }

      this.route.queryParams.subscribe(params => {
        const id = params['id'];
        const theme = params['theme'];

        if (theme) {
          this.currentThemeFilter.set(theme);
        }

        if (id) {
          this.loadPuzzleById(id);
        } else if (this.storageService.isFirstTime()) {
          // First time user: start with the very first puzzle of Beginner
          this.loadFirstPuzzle();
        } else {
          this.loadRandomPuzzle();
        }
      });
    }
  }

  private async loadFirstPuzzle() {
    this.isLoading.set(true);
    const puzzle = await this.puzzleService.getPuzzleByIndex('beginner', 0, 0);
    this.currentLevel.set('beginner');
    this.currentBatchIndex.set(0);
    this.setupPuzzle(puzzle);
    this.updateUrl('beginner', 0, puzzle.id);
    this.isLoading.set(false);
  }

  private async loadPuzzleById(encodedId: string) {
    this.isLoading.set(true);
    const result = await this.puzzleService.getPuzzleById(encodedId);
    if (result) {
      this.currentLevel.set(result.level);
      this.currentBatchIndex.set(result.batchIndex);
      // We keep existing theme filter if one exists, unless it conflicts?
      // Usually deep link for specific ID should prioritize that puzzle.
      this.setupPuzzle(result.puzzle);
    } else {
      this.loadRandomPuzzle();
    }
    this.isLoading.set(false);
  }

  private async loadRandomPuzzle() {
    this.isLoading.set(true);
    const result = await this.puzzleService.getRandomPuzzle(
      this.currentLevel(),
      this.currentThemeFilter() ?? undefined
    );
    this.currentBatchIndex.set(result.batchIndex);
    this.setupPuzzle(result.puzzle);
    this.updateUrl(this.currentLevel(), result.batchIndex, result.puzzle.id);
    this.isLoading.set(false);
  }

  private async setupPuzzle(puzzle: Puzzle) {
    this.currentPuzzle.set(puzzle);
    this.gameService.loadPuzzle(puzzle);
    this.previousPlay.set(this.storageService.getPlay(puzzle.id));

    // Update batch progress
    const idx = await this.puzzleService.getPuzzleIndexInBatch(this.currentLevel(), this.currentBatchIndex(), puzzle.id);
    const total = await this.puzzleService.getBatchPuzzleCount(this.currentLevel(), this.currentBatchIndex());
    this.puzzleIndexInBatch.set(idx);
    this.totalInBatch.set(total);
    this.cdr.markForCheck();
  }

  async onNextPuzzle() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    let nextPuzzle: Puzzle;
    let nextBatch: number;

    const p = this.currentPuzzle();
    const useRandom = this.storageService.randomNext();

    if (p && !useRandom) {
      // Sequential play
      const result = await this.puzzleService.getNextPuzzleInBatch(this.currentLevel(), this.currentBatchIndex(), p.id);
      nextPuzzle = result.puzzle;
      nextBatch = result.batchIndex;
    } else {
      // Random play (within theme if selected)
      const result = await this.puzzleService.getRandomPuzzle(this.currentLevel(), this.currentThemeFilter() ?? undefined);
      nextPuzzle = result.puzzle;
      nextBatch = result.batchIndex;
    }

    this.currentBatchIndex.set(nextBatch);
    this.setupPuzzle(nextPuzzle);
    this.updateUrl(this.currentLevel(), nextBatch, nextPuzzle.id);
    this.isLoading.set(false);
  }

  onRetryPuzzle() {
    this.gameService.reset();
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    // Only trigger if not typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    this.onNextPuzzle();
  }

  toggleSettings() {
    this.isSettingsOpen.update(v => !v);
  }

  toggleSound() {
    this.storageService.setSoundEnabled(!this.storageService.soundEnabled());
  }

  toggleRandomNext() {
    this.storageService.setRandomNext(!this.storageService.randomNext());
  }

  onLevelChange(level: Level) {
    this.currentLevel.set(level);
    this.currentThemeFilter.set(null);
    this.loadRandomPuzzle();
  }

  onThemeChange(theme: string | null) {
    this.currentThemeFilter.set(theme);
    this.loadRandomPuzzle();
  }

  private updateUrl(level: string, batchIndex: number, puzzleId: string) {
    const theme = this.currentThemeFilter();
    this.router.navigate([], {
      queryParams: {
        id: `${level}_${batchIndex}_${puzzleId}`,
        theme: theme || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  async onShare() {
    const url = window.location.href;
    const title = 'Rob Chess Puzzle';
    const text = `Check out this chess puzzle on Rob Chess!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        this.copyToClipboard(url);
      }
    } else {
      this.copyToClipboard(url);
    }
  }

  onCopyLink() {
    this.copyToClipboard(window.location.href);
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert(this.i18n.t('puzzleShared'));
    });
  }

  private checkBatchCompletion(): boolean {
    // In a real app we'd verify every ID in the batch is solved.
    // For now we assume finishing the last index implies finishing the batch.
    return this.puzzleIndexInBatch() === this.totalInBatch() - 1;
  }
}
