import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface BoardTheme {
  id: string;
  name: string;
  light: string;
  dark: string;
  selected: string;
  legal: string;
  lastMove: string;
  check: string;
}

export interface PieceSet {
  id: string;
  name: string;
  // Wikipedia URL prefix
  urlPattern: (color: 'w' | 'b', piece: string) => string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'brown',
    name: 'Classic',
    light: '#f0d9b5',
    dark: '#b58863',
    selected: 'rgba(20,85,30,0.5)',
    legal: 'rgba(20,85,30,0.35)',
    lastMove: 'rgba(155,199,0,0.41)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'blue',
    name: 'Ocean',
    light: '#dee3e6',
    dark: '#8ca2ad',
    selected: 'rgba(0,100,200,0.5)',
    legal: 'rgba(0,100,200,0.3)',
    lastMove: 'rgba(0,150,255,0.35)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'green',
    name: 'Emerald',
    light: '#ffffdd',
    dark: '#86a666',
    selected: 'rgba(50,150,50,0.5)',
    legal: 'rgba(50,150,50,0.35)',
    lastMove: 'rgba(100,200,50,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'purple',
    name: 'Royal',
    light: '#e8d5f5',
    dark: '#9b72cf',
    selected: 'rgba(100,50,200,0.5)',
    legal: 'rgba(100,50,200,0.35)',
    lastMove: 'rgba(150,100,255,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'sand',
    name: 'Sand',
    light: '#e3c593',
    dark: '#b38b59',
    selected: 'rgba(139,69,19,0.4)',
    legal: 'rgba(139,69,19,0.25)',
    lastMove: 'rgba(218,165,32,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'grey',
    name: 'Industrial',
    light: '#e0e0e0',
    dark: '#a0a0a0',
    selected: 'rgba(0,0,0,0.3)',
    legal: 'rgba(0,0,0,0.2)',
    lastMove: 'rgba(128,128,128,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'olive',
    name: 'Nature',
    light: '#e2e2a4',
    dark: '#8da062',
    selected: 'rgba(34,139,34,0.4)',
    legal: 'rgba(34,139,34,0.25)',
    lastMove: 'rgba(154,205,50,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
  {
    id: 'wood',
    name: 'Wood',
    light: '#dcb35c',
    dark: '#926f33',
    selected: 'rgba(139,69,19,0.4)',
    legal: 'rgba(139,69,19,0.25)',
    lastMove: 'rgba(205,133,63,0.4)',
    check: 'rgba(220,20,60,0.65)',
  },
];

// Wikipedia SVG piece URLs
const WIKI_BASE = 'https://upload.wikimedia.org/wikipedia/commons';

export const PIECE_SETS: PieceSet[] = [
  {
    id: 'cburnett',
    name: 'Cburnett',
    urlPattern: (color, piece) => {
      const map: Record<string, string> = {
        wk: `${WIKI_BASE}/4/42/Chess_klt45.svg`,
        wq: `${WIKI_BASE}/1/15/Chess_qlt45.svg`,
        wr: `${WIKI_BASE}/7/72/Chess_rlt45.svg`,
        wb: `${WIKI_BASE}/b/b1/Chess_blt45.svg`,
        wn: `${WIKI_BASE}/7/70/Chess_nlt45.svg`,
        wp: `${WIKI_BASE}/4/45/Chess_plt45.svg`,
        bk: `${WIKI_BASE}/f/f0/Chess_kdt45.svg`,
        bq: `${WIKI_BASE}/4/47/Chess_qdt45.svg`,
        br: `${WIKI_BASE}/f/ff/Chess_rdt45.svg`,
        bb: `${WIKI_BASE}/9/98/Chess_bdt45.svg`,
        bn: `${WIKI_BASE}/e/ef/Chess_ndt45.svg`,
        bp: `${WIKI_BASE}/c/c7/Chess_pdt45.svg`,
      };
      return map[`${color}${piece}`] ?? '';
    },
  },
  {
    id: 'merida',
    name: 'Merida',
    urlPattern: (color, piece) => {
      const c = color === 'w' ? 'w' : 'b';
      const p = piece === 'p' ? 'P' : piece.toUpperCase();
      return `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/${c}${p}.svg`;
    },
  },
  {
    id: 'leipzig',
    name: 'Leipzig',
    urlPattern: (color, piece) => {
      const c = color === 'w' ? 'w' : 'b';
      const p = piece === 'p' ? 'P' : piece.toUpperCase();
      return `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/leipzig/${c}${p}.svg`;
    },
  },
  {
    id: 'chess24',
    name: 'Chess24',
    urlPattern: (color, piece) => {
      return `var(--theme-piece-set-${color}${piece})`;
    },
  },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly boardTheme = signal<BoardTheme>(BOARD_THEMES[0]);
  readonly pieceSet = signal<PieceSet>(PIECE_SETS[0]);
  readonly darkMode = signal(true);

  constructor(private storage: StorageService) {
    const savedTheme = BOARD_THEMES.find(t => t.id === storage.getBoardTheme()) ?? BOARD_THEMES[0];
    const savedPieceSet = PIECE_SETS.find(p => p.id === storage.getPieceSet()) ?? PIECE_SETS[0];
    this.boardTheme.set(savedTheme);
    this.pieceSet.set(savedPieceSet);
    this.darkMode.set(storage.getDarkMode());
    this.applyDarkMode(this.darkMode());
  }

  setBoardTheme(themeId: string): void {
    const theme = BOARD_THEMES.find(t => t.id === themeId);
    if (theme) {
      this.boardTheme.set(theme);
      this.storage.setBoardTheme(themeId);
    }
  }

  setPieceSet(setId: string): void {
    const set = PIECE_SETS.find(s => s.id === setId);
    if (set) {
      this.pieceSet.set(set);
      this.storage.setPieceSet(setId);
    }
  }

  toggleDarkMode(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    this.storage.setDarkMode(next);
    this.applyDarkMode(next);
  }

  private applyDarkMode(dark: boolean): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-mode', !dark);
    }
  }

  getPieceUrl(color: 'w' | 'b', piece: string): string {
    return this.pieceSet().urlPattern(color, piece);
  }
}
