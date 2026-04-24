import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  let store: { [key: string]: string } = {};

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize signals with correct defaults', () => {
      // Create a fresh instance for initialization test
      const s = new StorageService();
      expect(s.totalCrowns()).toBe(0);
      expect(s.totalSolved()).toBe(0);
      expect(s.soundEnabled()).toBe(true);
      expect(s.randomNext()).toBe(false);
      expect(s.totalCoins()).toBe(0);
    });
  });

  describe('Solved Puzzles', () => {
    it('should return empty Set if no solved IDs in localStorage', () => {
      expect(service.getSolvedIds().size).toBe(0);
    });

    it('should return Set of IDs from localStorage', () => {
      store['rob-chess-solved'] = '["puzzle1","puzzle2"]';
      const ids = service.getSolvedIds();
      expect(ids.size).toBe(2);
      expect(ids.has('puzzle1')).toBeTrue();
      expect(ids.has('puzzle2')).toBeTrue();
    });

    it('should handle invalid JSON in getSolvedIds gracefully', () => {
      store['rob-chess-solved'] = 'invalid json';
      expect(service.getSolvedIds().size).toBe(0);
    });

    it('should mark puzzle as solved', () => {
      store['rob-chess-solved'] = '["puzzle1"]';
      service.markSolved('puzzle2');
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-solved', '["puzzle1","puzzle2"]');
    });

    it('should check if puzzle is solved', () => {
      store['rob-chess-solved'] = '["puzzle1"]';
      expect(service.isPuzzleSolved('puzzle1')).toBeTrue();
      expect(service.isPuzzleSolved('puzzle2')).toBeFalse();
    });
  });

  describe('Play History', () => {
    it('should return null for getPlay if no play exists', () => {
      expect(service.getPlay('puzzle1')).toBeNull();
    });

    it('should save and get play', () => {
      const mockDate = 1234567890;
      spyOn(Date, 'now').and.returnValue(mockDate);

      service.savePlay('puzzle1', 2);

      const expectedPlays = {
        'puzzle1': {
          id: 'puzzle1',
          errors: 2,
          date: mockDate
        }
      };
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-plays', JSON.stringify(expectedPlays));

      // Setup the return for getPlay
      store['rob-chess-plays'] = JSON.stringify(expectedPlays);
      const play = service.getPlay('puzzle1');
      expect(play).toEqual(expectedPlays['puzzle1']);
    });

    it('should handle invalid JSON in getAllPlays gracefully', () => {
      store['rob-chess-plays'] = 'invalid json';
      expect(service.getPlay('puzzle1')).toBeNull();
    });
  });

  describe('Crowns & Batches', () => {
    it('should get 0 crowns if none exist', () => {
      expect(service.getCrowns('beginner')).toBe(0);
    });

    it('should get correct crowns for level', () => {
      store['rob-chess-crowns'] = JSON.stringify({ 'beginner': 150, 'advanced': 50 });
      expect(service.getCrowns('beginner')).toBe(150);
      expect(service.getCrowns('advanced')).toBe(50);
      expect(service.getCrowns('master')).toBe(0);
    });

    it('should handle invalid JSON in getCrowns gracefully', () => {
      store['rob-chess-crowns'] = 'invalid json';
      expect(service.getCrowns('beginner')).toBe(0);
    });

    it('should return false if batch already complete', () => {
      store['rob-chess-batches-beginner'] = JSON.stringify([0, 1]);
      expect(service.markBatchComplete('beginner', 1)).toBeFalse();
    });

    it('should return true, add 50 crowns, and update totalCrowns signal when marking new batch complete', () => {
      // Mock existing completed batches
      store['rob-chess-batches-beginner'] = JSON.stringify([0]);
      // Mock existing crowns
      store['rob-chess-crowns'] = JSON.stringify({ 'beginner': 100 });

      // Need to re-trigger internal updates or manually test the behavior here.
      // Given how the service stores things, we should just test the method.
      const res = service.markBatchComplete('beginner', 1);

      expect(res).toBeTrue();
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-batches-beginner', '[0,1]');
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-crowns', JSON.stringify({ 'beginner': 150 }));
      expect(service.totalCrowns()).toBe(150); // totalCrowns signal updates via getAllCrowns reading from store which was just populated by setItem hook
    });

    it('should get completed batches', () => {
      store['rob-chess-batches-beginner'] = JSON.stringify([0, 2]);
      const batches = service.getCompletedBatches('beginner');
      expect(batches.size).toBe(2);
      expect(batches.has(0)).toBeTrue();
      expect(batches.has(2)).toBeTrue();
    });

    it('should handle invalid JSON in getCompletedBatches gracefully', () => {
      store['rob-chess-batches-beginner'] = 'invalid json';
      expect(service.getCompletedBatches('beginner').size).toBe(0);
    });
  });

  describe('Preferences & Settings', () => {
    it('should get language with default en', () => {
      expect(service.getLanguage()).toBe('en');
      store['rob-chess-lang'] = 'fr';
      expect(service.getLanguage()).toBe('fr');
    });

    it('should set language', () => {
      service.setLanguage('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-lang', 'es');
    });

    it('should get board theme with default brown', () => {
      expect(service.getBoardTheme()).toBe('brown');
      store['rob-chess-board-theme'] = 'blue';
      expect(service.getBoardTheme()).toBe('blue');
    });

    it('should set board theme', () => {
      service.setBoardTheme('green');
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-board-theme', 'green');
    });

    it('should get piece set with default cburnett', () => {
      expect(service.getPieceSet()).toBe('cburnett');
      store['rob-chess-piece-set'] = 'alpha';
      expect(service.getPieceSet()).toBe('alpha');
    });

    it('should set piece set', () => {
      service.setPieceSet('merida');
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-piece-set', 'merida');
    });

    it('should get dark mode with default true', () => {
      expect(service.getDarkMode()).toBeTrue(); // 'false' string check
      store['rob-chess-dark-mode'] = 'false';
      expect(service.getDarkMode()).toBeFalse();
    });

    it('should set dark mode', () => {
      service.setDarkMode(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-dark-mode', 'false');
    });

    it('should track tutorial seen', () => {
      expect(service.hasSeenTutorial()).toBeFalse();
      store['rob-chess-tutorial-seen'] = 'true';
      expect(service.hasSeenTutorial()).toBeTrue();

      service.setTutorialSeen();
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-tutorial-seen', 'true');
    });

    it('should track sound enabled', () => {
      expect(service.getSoundEnabled()).toBeTrue();
      store['rob-chess-sound-enabled'] = 'false';
      expect(service.getSoundEnabled()).toBeFalse();

      service.setSoundEnabled(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-sound-enabled', 'false');
      expect(service.soundEnabled()).toBeFalse();
    });

    it('should track random next', () => {
      expect(service.getRandomNext()).toBeFalse();
      store['rob-chess-random-next'] = 'true';
      expect(service.getRandomNext()).toBeTrue();

      service.setRandomNext(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-random-next', 'true');
      expect(service.randomNext()).toBeTrue();
    });
  });

  describe('Global Progress & Coins', () => {
    it('should check isFirstTime', () => {
      expect(service.isFirstTime()).toBeTrue();
      store['rob-chess-solved-count'] = '1';
      expect(service.isFirstTime()).toBeFalse();
    });

    it('should get solved count', () => {
      expect(service.getSolvedCount()).toBe(0);
      store['rob-chess-solved-count'] = '5';
      expect(service.getSolvedCount()).toBe(5);
    });

    it('should increment solved count and award crown every 10 puzzles', () => {
      // Mock solved count to 9, so next is 10
      store['rob-chess-solved-count'] = '9';
      // Mock existing crowns
      store['rob-chess-crowns'] = JSON.stringify({ 'advanced': 10 });

      service.incrementSolvedCount('advanced');

      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-solved-count', '10');
      expect(service.totalSolved()).toBe(10);
      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-crowns', JSON.stringify({ 'advanced': 11 }));
      expect(service.totalCrowns()).toBe(11);
    });

    it('should increment solved count without awarding crown if not multiple of 10', () => {
      // Mock solved count to 5, so next is 6
      store['rob-chess-solved-count'] = '5';

      // We clear the setItem call history so we don't accidentally match earlier things
      (localStorage.setItem as jasmine.Spy).calls.reset();

      service.incrementSolvedCount('advanced');

      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-solved-count', '6');
      expect(service.totalSolved()).toBe(6);

      // Need to iterate through the calls and make sure none are for 'rob-chess-crowns'
      const setItemCalls = (localStorage.setItem as jasmine.Spy).calls.allArgs();
      const crownCalls = setItemCalls.filter(args => args[0] === 'rob-chess-crowns');
      expect(crownCalls.length).toBe(0);
    });

    it('should get coins', () => {
      expect(service.getCoins()).toBe(0);
      store['rob-chess-coins'] = '150';
      expect(service.getCoins()).toBe(150);
    });

    it('should add coins', () => {
      store['rob-chess-coins'] = '100';

      service.addCoins(50);

      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-coins', '150');
      expect(service.totalCoins()).toBe(150);
      expect(service.lastCoinsEarned()).toBe(50);
    });

    it('should add crowns', () => {
      store['rob-chess-crowns'] = JSON.stringify({ 'master': 10 });

      service.addCrowns('master', 5);

      expect(localStorage.setItem).toHaveBeenCalledWith('rob-chess-crowns', JSON.stringify({ 'master': 15 }));
      expect(service.totalCrowns()).toBe(15);
      expect(service.lastCrownsEarned()).toBe(5);
    });
  });
});
