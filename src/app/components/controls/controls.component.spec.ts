import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsComponent } from './controls.component';
import { GameService } from '../../core/services/game.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';
import { signal } from '@angular/core';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;

  let mockGameService: any;
  let mockI18nService: any;

  beforeEach(async () => {
    mockGameService = {
      showHint: signal(false),
      puzzleComplete: signal(false),
      toggleHint: jasmine.createSpy('toggleHint'),
    };

    mockI18nService = {
      t: jasmine.createSpy('t').and.callFake((key: string) => `mock_${key}`),
    };

    const mockThemeService = {};
    const mockStorageService = {};

    await TestBed.configureTestingModule({
      imports: [ControlsComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should emit sharePuzzle when onShare is called', () => {
    spyOn(component.sharePuzzle, 'emit');
    component.onShare();
    expect(component.sharePuzzle.emit).toHaveBeenCalled();
  });

  it('should call game.toggleHint when hint button is clicked', () => {
    const hintButton = fixture.nativeElement.querySelector('.action-buttons button:first-child');
    hintButton.click();
    expect(mockGameService.toggleHint).toHaveBeenCalled();
  });

  it('should add active class to hint button when game.showHint is true', () => {
    mockGameService.showHint.set(true);
    fixture.detectChanges();
    const hintButton = fixture.nativeElement.querySelector('.action-buttons button:first-child');
    expect(hintButton.classList.contains('active')).toBeTrue();
  });

  it('should add pulse class to next button when game.puzzleComplete is true', () => {
    mockGameService.puzzleComplete.set(true);
    fixture.detectChanges();
    const nextButton = fixture.nativeElement.querySelector('.primary-btn');
    expect(nextButton.classList.contains('pulse')).toBeTrue();
  });
});
