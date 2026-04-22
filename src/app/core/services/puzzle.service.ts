import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Puzzle {
  id: string;
  fen: string;
  setup: string;
  solution: string[];
  rating: number;
  themes: string[];
  total_moves: number;
}

export interface Structure {
  levels: Record<string, number>;
  shard_size: number;
}

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'grandmaster';
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'master', 'grandmaster'];

@Injectable({ providedIn: 'root' })
export class PuzzleService {
  private http = inject(HttpClient);

  private structure: Structure | null = null;
  private themesCache: Record<string, Record<string, number[]>> = {};
  private batchCache: Record<string, Puzzle[]> = {};

  private get baseUrl(): string {
    return './puzzles_data';
  }

  async getStructure(): Promise<Structure> {
    if (!this.structure) {
      this.structure = await firstValueFrom(
        this.http.get<Structure>(`${this.baseUrl}/structure.json`)
      );
    }
    return this.structure!;
  }

  async getThemes(level: Level): Promise<Record<string, number[]>> {
    if (!this.themesCache[level]) {
      this.themesCache[level] = await firstValueFrom(
        this.http.get<Record<string, number[]>>(`${this.baseUrl}/themes_${level}.json`)
      );
    }
    return this.themesCache[level];
  }

  async getBatch(level: Level, batchIndex: number): Promise<Puzzle[]> {
    const structure = await this.getStructure();
    const shardIndex = Math.floor(batchIndex / structure.shard_size);
    const key = `${level}_${batchIndex}`;
    if (!this.batchCache[key]) {
      this.batchCache[key] = await firstValueFrom(
        this.http.get<Puzzle[]>(`${this.baseUrl}/${level}/${shardIndex}/batch_${batchIndex}.json`)
      );
    }
    return this.batchCache[key];
  }

  async getPuzzleById(encodedId: string): Promise<{ puzzle: Puzzle; level: Level; batchIndex: number } | null> {
    // Format: {level}_{batchIndex}_{puzzleId}
    const underscoreIdx1 = encodedId.indexOf('_');
    if (underscoreIdx1 === -1) return null;
    const underscoreIdx2 = encodedId.indexOf('_', underscoreIdx1 + 1);
    if (underscoreIdx2 === -1) return null;

    const level = encodedId.substring(0, underscoreIdx1) as Level;
    const batchIndex = parseInt(encodedId.substring(underscoreIdx1 + 1, underscoreIdx2), 10);
    const puzzleId = encodedId.substring(underscoreIdx2 + 1);

    if (!LEVELS.includes(level) || isNaN(batchIndex)) return null;

    const batch = await this.getBatch(level, batchIndex);
    const puzzle = batch.find(p => p.id === puzzleId);
    if (!puzzle) return null;
    return { puzzle, level, batchIndex };
  }

  async getRandomBatchIndex(level: Level, theme?: string): Promise<number> {
    const structure = await this.getStructure();
    const totalBatches = structure.levels[level] ?? 1;

    if (theme) {
      const themes = await this.getThemes(level);
      const batches = themes[theme];
      if (batches && batches.length > 0) {
        return batches[Math.floor(Math.random() * batches.length)];
      }
    }
    return Math.floor(Math.random() * totalBatches);
  }

  async getRandomPuzzle(level: Level, theme?: string): Promise<{ puzzle: Puzzle; batchIndex: number }> {
    const batchIndex = await this.getRandomBatchIndex(level, theme);
    const batch = await this.getBatch(level, batchIndex);
    
    // Filter by theme if provided
    let filteredPuzzles = batch;
    if (theme) {
      filteredPuzzles = batch.filter(p => p.themes.includes(theme));
      
      // Fallback if for some reason the theme is missing in this batch
      // (though temi_{level}.json should prevent this)
      if (filteredPuzzles.length === 0) {
        filteredPuzzles = batch;
      }
    }

    const puzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
    return { puzzle, batchIndex };
  }

  async getNextPuzzleInBatch(level: Level, batchIndex: number, currentPuzzleId: string): Promise<{ puzzle: Puzzle; batchIndex: number }> {
    const structure = await this.getStructure();
    const batch = await this.getBatch(level, batchIndex);
    const idx = batch.findIndex(p => p.id === currentPuzzleId);
    if (idx !== -1 && idx < batch.length - 1) {
      return { puzzle: batch[idx + 1], batchIndex };
    }
    // Move to next batch
    const nextBatch = (batchIndex + 1) % (structure.levels[level] ?? 1);
    const nextBatchData = await this.getBatch(level, nextBatch);
    return { puzzle: nextBatchData[0], batchIndex: nextBatch };
  }

  async getBatchPuzzleCount(level: Level, batchIndex: number): Promise<number> {
    const batch = await this.getBatch(level, batchIndex);
    return batch.length;
  }

  async getPuzzleIndexInBatch(level: Level, batchIndex: number, puzzleId: string): Promise<number> {
    const batch = await this.getBatch(level, batchIndex);
    return batch.findIndex(p => p.id === puzzleId);
  }

  async getPuzzleByIndex(level: Level, batchIndex: number, puzzleIndex: number): Promise<Puzzle> {
    const batch = await this.getBatch(level, batchIndex);
    return batch[puzzleIndex];
  }
}
