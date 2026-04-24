import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { GameService } from '../../core/services/game.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { I18nService } from '../../core/services/i18n.service';
import { signal } from '@angular/core';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    // Basic mock setup
    const gameServiceMock = {
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

    const themeServiceMock = {
      boardTheme: signal({
        light: '#fff', dark: '#000', selected: 'red', legal: 'green', lastMove: 'blue', check: 'yellow'
      }),
      getPieceUrl: jasmine.createSpy('getPieceUrl').and.returnValue('test-url')
    };

    const storageServiceMock = {
      lastCrownsEarned: signal(1),
      lastCoinsEarned: signal(10)
    };

    const i18nServiceMock = {
      t: jasmine.createSpy('t').and.callFake((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: I18nService, useValue: i18nServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute cells correctly from FEN', () => {
    const cells = component.cells();
    expect(cells.length).toBe(64);

    // Check initial board setup (e.g., a1 is a white rook)
    const a1 = cells.find(c => c.algebraic === 'a1');
    expect(a1?.piece).toEqual({ type: 'r', color: 'w' });

    // Check a8 is a black rook
    const a8 = cells.find(c => c.algebraic === 'a8');
    expect(a8?.piece).toEqual({ type: 'r', color: 'b' });
  });

  it('should flip the board when orientation is black', () => {
    const gameService = TestBed.inject(GameService) as any;

    // Default orientation is white
    expect(component.flipped()).toBeFalse();
    let ranks = component.rankLabels();
    expect(ranks[0]).toBe('8'); // Top rank is 8

    // Change orientation to black
    gameService.boardState.set({
      ...gameService.boardState(),
      orientation: 'black'
    });
    fixture.detectChanges();

    expect(component.flipped()).toBeTrue();
    ranks = component.rankLabels();
    expect(ranks[0]).toBe('1'); // Top rank is 1 when flipped
  });

  it('should trigger selectSquare when a square is clicked', () => {
    const gameService = TestBed.inject(GameService);
    component.onSquareClick('e4');
    expect(gameService.selectSquare).toHaveBeenCalledWith('e4');
  });

  it('should emit nextPuzzle when onNext is called', () => {
    spyOn(component.nextPuzzle, 'emit');
    component.onNext();
    expect(component.nextPuzzle.emit).toHaveBeenCalled();
  });

  it('should emit retryPuzzle when onRetry is called', () => {
    spyOn(component.retryPuzzle, 'emit');
    component.onRetry();
    expect(component.retryPuzzle.emit).toHaveBeenCalled();
  });
});
