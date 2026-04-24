
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { PuzzleService, Level, Structure, Puzzle } from './puzzle.service';

describe('PuzzleService', () => {
  let service: PuzzleService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  const mockStructure: Structure = {
    levels: { beginner: 10, intermediate: 20 },
    shard_size: 5
  };

  const mockPuzzles: Puzzle[] = [
    {
      id: 'puzzle1',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      setup: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      solution: ['e2e4'],
      rating: 1000,
      themes: ['mate'],
      total_moves: 1
    },
    {
      id: 'puzzle2',
      fen: '8/8/8/8/8/8/8/K1k5 w - - 0 1',
      setup: '8/8/8/8/8/8/8/K1k5 w - - 0 1',
      solution: ['a1a2'],
      rating: 1500,
      themes: ['endgame'],
      total_moves: 1
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PuzzleService,
        { provide: HttpClient, useValue: spy }
      ]
    });
    service = TestBed.inject(PuzzleService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStructure', () => {
    it('should fetch structure and cache it', async () => {
      // Mock HTTP response using true RxJS observables
      httpClientSpy.get.and.returnValue(of(mockStructure));

      const structure1 = await service.getStructure();
      expect(structure1).toEqual(mockStructure);
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
      expect(httpClientSpy.get).toHaveBeenCalledWith('./puzzles_data/structure.json');

      const structure2 = await service.getStructure();
      expect(structure2).toEqual(mockStructure);
      // Still 1 time because of cache
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getThemes', () => {
    it('should fetch themes for a level and cache it', async () => {
      const mockThemes = { mate: [0, 1], endgame: [2] };
      httpClientSpy.get.and.returnValue(of(mockThemes));

      const themes1 = await service.getThemes('beginner');
      expect(themes1).toEqual(mockThemes);
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
      expect(httpClientSpy.get).toHaveBeenCalledWith('./puzzles_data/themes_beginner.json');

      const themes2 = await service.getThemes('beginner');
      expect(themes2).toEqual(mockThemes);
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBatch', () => {
    it('should calculate shard correctly and fetch batch', async () => {
      httpClientSpy.get.and.callFake(((url: string): Observable<any> => {
        if (url.includes('structure.json')) return of(mockStructure);
        if (url.includes('batch_7.json')) return of(mockPuzzles);
        return of(null);
      }) as any);

      const batch = await service.getBatch('beginner', 7);
      expect(batch).toEqual(mockPuzzles);
      expect(httpClientSpy.get).toHaveBeenCalledWith('./puzzles_data/beginner/1/batch_7.json');

      const cachedBatch = await service.getBatch('beginner', 7);
      expect(cachedBatch).toEqual(mockPuzzles);
      // 1 for structure, 1 for batch = 2 total requests
      expect(httpClientSpy.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPuzzleById', () => {
    beforeEach(() => {
      httpClientSpy.get.and.callFake(((url: string): Observable<any> => {
        if (url.includes('structure.json')) return of(mockStructure);
        if (url.includes('batch_7.json')) return of(mockPuzzles);
        return of(null);
      }) as any);
    });

    it('should parse valid encoded id and return puzzle', async () => {
      const result = await service.getPuzzleById('beginner_7_puzzle2');
      expect(result).toEqual({ puzzle: mockPuzzles[1], level: 'beginner', batchIndex: 7 });
    });

    it('should return null for invalid encoded id format', async () => {
      expect(await service.getPuzzleById('invalidformat')).toBeNull();
      expect(await service.getPuzzleById('beginner_invalid')).toBeNull();
    });

    it('should return null for non-existent level', async () => {
      expect(await service.getPuzzleById('expert_7_puzzle2')).toBeNull();
    });

    it('should return null if puzzle not found in batch', async () => {
      const result = await service.getPuzzleById('beginner_7_puzzle3');
      expect(result).toBeNull();
    });
  });

  describe('getRandomBatchIndex', () => {
    beforeEach(() => {
      httpClientSpy.get.and.callFake(((url: string): Observable<any> => {
        if (url.includes('structure.json')) return of(mockStructure);
        if (url.includes('themes_beginner.json')) return of({ mate: [1, 2, 5, 8] });
        return of(null);
      }) as any);
    });

    it('should return a random batch index based on level levels', async () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      const index = await service.getRandomBatchIndex('beginner');
      expect(index).toBe(5);
    });

    it('should return a random batch index for a specific theme', async () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      const index = await service.getRandomBatchIndex('beginner', 'mate');
      expect(index).toBe(5);
    });
  });

  describe('getRandomPuzzle', () => {
    beforeEach(() => {
      httpClientSpy.get.and.callFake(((url: string): Observable<any> => {
        if (url.includes('structure.json')) return of(mockStructure);
        if (url.includes('batch_5.json')) return of(mockPuzzles);
        return of(null);
      }) as any);
    });

    it('should return a random puzzle without theme', async () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      const result = await service.getRandomPuzzle('beginner');
      expect(result).toEqual({ puzzle: mockPuzzles[1], batchIndex: 5 });
    });
  });

  describe('getNextPuzzleInBatch', () => {
    beforeEach(() => {
      httpClientSpy.get.and.callFake(((url: string): Observable<any> => {
        if (url.includes('structure.json')) return of(mockStructure);
        if (url.includes('batch_7.json')) return of(mockPuzzles);
        if (url.includes('batch_8.json')) return of([{ ...mockPuzzles[0], id: 'puzzle3' }]);
        return of(null);
      }) as any);
    });

    it('should return next puzzle in same batch if available', async () => {
      const result = await service.getNextPuzzleInBatch('beginner', 7, 'puzzle1');
      expect(result).toEqual({ puzzle: mockPuzzles[1], batchIndex: 7 });
    });

    it('should wrap to next batch if current is last puzzle', async () => {
      const result = await service.getNextPuzzleInBatch('beginner', 7, 'puzzle2');
      expect(result).toEqual({ puzzle: { ...mockPuzzles[0], id: 'puzzle3' }, batchIndex: 8 });
    });
  });
});
