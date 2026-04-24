import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelSelectorComponent } from './level-selector.component';
import { I18nService } from '../../core/services/i18n.service';
import { PuzzleService, Level } from '../../core/services/puzzle.service';

describe('LevelSelectorComponent', () => {
  let component: LevelSelectorComponent;
  let fixture: ComponentFixture<LevelSelectorComponent>;
  let mockI18nService: jasmine.SpyObj<I18nService>;
  let mockPuzzleService: jasmine.SpyObj<PuzzleService>;

  beforeEach(async () => {
    mockI18nService = jasmine.createSpyObj('I18nService', ['t']);
    mockI18nService.t.and.callFake((key: string) => key);

    mockPuzzleService = jasmine.createSpyObj('PuzzleService', ['getThemes']);
    mockPuzzleService.getThemes.and.returnValue(Promise.resolve({
      'mateIn1': [0, 1],
      'fork': [2]
    }));

    await TestBed.configureTestingModule({
      imports: [LevelSelectorComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: PuzzleService, useValue: mockPuzzleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LevelSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load themes for the current level', async () => {
      component.currentLevel = 'intermediate';
      component.ngOnInit();
      await fixture.whenStable();

      expect(mockPuzzleService.getThemes).toHaveBeenCalledWith('intermediate');
      expect(component.availableThemes()).toEqual(['fork', 'mateIn1']); // Sorted alphabetically
    });

    it('should set filterTabActive to true if currentTheme is provided', () => {
      component.currentTheme = 'fork';
      component.ngOnInit();
      expect(component.filterTabActive()).toBeTrue();
    });

    it('should leave filterTabActive as false if currentTheme is null', () => {
      component.currentTheme = null;
      component.ngOnInit();
      expect(component.filterTabActive()).toBeFalse();
    });
  });

  describe('toggleFilterTab', () => {
    it('should toggle filterTabActive state', () => {
      expect(component.filterTabActive()).toBeFalse();
      component.toggleFilterTab();
      expect(component.filterTabActive()).toBeTrue();
      component.toggleFilterTab();
      expect(component.filterTabActive()).toBeFalse();
    });
  });

  describe('onLevelSelect', () => {
    beforeEach(() => {
      spyOn(component.levelChange, 'emit');
    });

    it('should update level, clear theme, and emit when a new level is selected', async () => {
      component.currentLevel = 'beginner';
      component.currentTheme = 'fork';
      component.filterTabActive.set(true);

      component.onLevelSelect('advanced');

      expect(component.filterTabActive()).toBeFalse();
      expect(component.currentLevel).toBe('advanced');
      expect(component.currentTheme).toBeNull();
      expect(mockPuzzleService.getThemes).toHaveBeenCalledWith('advanced');
      expect(component.levelChange.emit).toHaveBeenCalledWith('advanced');
    });

    it('should only set filterTabActive to false if the same level is selected', () => {
      component.currentLevel = 'beginner';
      component.filterTabActive.set(true);

      component.onLevelSelect('beginner');

      expect(component.filterTabActive()).toBeFalse();
      expect(component.levelChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('onMobileSelect', () => {
    it('should set filterTabActive to true when __filter__ is selected', () => {
      component.onMobileSelect('__filter__');
      expect(component.filterTabActive()).toBeTrue();
    });

    it('should call onLevelSelect when a normal level is selected', () => {
      spyOn(component, 'onLevelSelect');
      component.onMobileSelect('master');
      expect(component.onLevelSelect).toHaveBeenCalledWith('master');
    });
  });

  describe('onThemeChange', () => {
    beforeEach(() => {
      spyOn(component.themeChange, 'emit');
    });

    it('should update theme and emit when a new theme is selected', () => {
      component.currentTheme = null;
      component.onThemeChange('mateIn2');

      expect(component.currentTheme as string | null).toEqual('mateIn2');
      expect(component.themeChange.emit).toHaveBeenCalledWith('mateIn2');
    });

    it('should set currentTheme to null and emit null when an empty string is selected', () => {
      component.currentTheme = 'fork';
      component.onThemeChange('');

      expect(component.currentTheme).toBeNull();
      expect(component.themeChange.emit).toHaveBeenCalledWith(null);
    });

    it('should not emit if the same theme is selected', () => {
      component.currentTheme = 'fork';
      component.onThemeChange('fork');

      expect(component.themeChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('clearTheme', () => {
    it('should set currentTheme to null and emit null', () => {
      spyOn(component.themeChange, 'emit');
      component.currentTheme = 'fork';

      component.clearTheme();

      expect(component.currentTheme).toBeNull();
      expect(component.themeChange.emit).toHaveBeenCalledWith(null);
    });
  });

  describe('formatTheme', () => {
    it('should format camelCase theme string correctly', () => {
      expect(component.formatTheme('mateIn1')).toBe('Mate In1');
      expect(component.formatTheme('kingsideAttack')).toBe('Kingside Attack');
      expect(component.formatTheme('fork')).toBe('Fork');
    });
  });

  describe('getEmoji', () => {
    it('should return correct emoji for each level', () => {
      expect(component.getEmoji('beginner')).toBe('🌱');
      expect(component.getEmoji('intermediate')).toBe('📈');
      expect(component.getEmoji('advanced')).toBe('🔥');
      expect(component.getEmoji('master')).toBe('🎓');
      expect(component.getEmoji('grandmaster')).toBe('🏆');
      expect(component.getEmoji('unknown' as Level)).toBe('♟️');
    });
  });
});
