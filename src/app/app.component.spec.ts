import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { GameService } from './core/services/game.service';
import { PuzzleService } from './core/services/puzzle.service';
import { StorageService } from './core/services/storage.service';
import { ThemeService } from './core/services/theme.service';
import { I18nService } from './core/services/i18n.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  beforeEach(async () => {
    const routeMock = { queryParams: of({}) };
    const routerMock = { navigate: jasmine.createSpy('navigate') };

    const gameServiceMock = {
      puzzleComplete$: of(),
      errorCount: signal(0),
      loadPuzzle: jasmine.createSpy('loadPuzzle'),
      boardState: signal({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        orientation: 'white',
        selectedSquare: null,
        legalMoves: [],
        lastMoveFrom: null,
        lastMoveTo: null,
        inCheck: false,
        checkSquare: null
      }),
      showLegalMoves: signal(true),
      showHint: signal(false),
      errorSquare: signal(null),
      puzzleComplete: signal(false),
      getHintMove: () => null,
      selectSquare: jasmine.createSpy('selectSquare')
    };

    const puzzleServiceMock = {
      getPuzzleByIndex: jasmine.createSpy('getPuzzleByIndex').and.returnValue(Promise.resolve({})),
      getPuzzleById: jasmine.createSpy('getPuzzleById').and.returnValue(Promise.resolve(null)),
      getRandomPuzzle: jasmine.createSpy('getRandomPuzzle').and.returnValue(Promise.resolve({ batchIndex: 0, puzzle: {} })),
      getPuzzleIndexInBatch: jasmine.createSpy('getPuzzleIndexInBatch').and.returnValue(Promise.resolve(0)),
      getBatchPuzzleCount: jasmine.createSpy('getBatchPuzzleCount').and.returnValue(Promise.resolve(1)),
      getNextPuzzleInBatch: jasmine.createSpy('getNextPuzzleInBatch').and.returnValue(Promise.resolve({ puzzle: {}, batchIndex: 0 }))
    };

    const storageServiceMock = {
      addCoins: jasmine.createSpy('addCoins'),
      addCrowns: jasmine.createSpy('addCrowns'),
      savePlay: jasmine.createSpy('savePlay'),
      incrementSolvedCount: jasmine.createSpy('incrementSolvedCount'),
      markBatchComplete: jasmine.createSpy('markBatchComplete').and.returnValue(false),
      getPlay: jasmine.createSpy('getPlay').and.returnValue(null),
      isFirstTime: jasmine.createSpy('isFirstTime').and.returnValue(false),
      hasSeenTutorial: jasmine.createSpy('hasSeenTutorial').and.returnValue(true),
      randomNext: signal(false),
      setSoundEnabled: jasmine.createSpy('setSoundEnabled'),
      soundEnabled: signal(true),
      setRandomNext: jasmine.createSpy('setRandomNext'),
      lastCrownsEarned: signal(0),
      totalCrowns: signal(0),
      totalCoins: signal(0)
    };

    const themeServiceMock = {
      boardTheme: signal({ light: '#fff', dark: '#000', selected: 'red', legal: 'green', lastMove: 'blue', check: 'yellow' }),
      getPieceUrl: () => 'url'
    };

    const i18nServiceMock = {
      t: jasmine.createSpy('t').and.callFake((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: PuzzleService, useValue: puzzleServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: I18nService, useValue: i18nServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
