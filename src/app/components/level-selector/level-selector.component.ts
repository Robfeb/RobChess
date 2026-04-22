import { Component, inject, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { PuzzleService, Level, LEVELS } from '../../core/services/puzzle.service';

@Component({
  selector: 'app-level-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="level-selector-container">
      <!-- Level Tabs -->
      <div class="level-tabs">
        @for (l of levels; track l) {
          <button 
            class="level-tab" 
            [class.active]="currentLevel === l"
            (click)="onLevelSelect(l)"
          >
            <span class="level-icon">{{ getEmoji(l) }}</span>
            <span class="level-text">{{ i18n.t(l) }}</span>
          </button>
        }
      </div>

      <!-- Theme Filter Dropdown -->
      <div class="theme-filter-row">
        <label class="filter-label">{{ i18n.t('filterByTheme') }}:</label>
        <div class="select-wrapper">
          <select 
            class="theme-select" 
            [value]="currentTheme || ''"
            (change)="onThemeChange($any($event.target).value)"
          >
            <option value="">-- {{ i18n.t('allThemes') }} --</option>
            @for (theme of availableThemes(); track theme) {
              <option [value]="theme">{{ formatTheme(theme) }}</option>
            }
          </select>
        </div>
        
        @if (currentTheme) {
          <button class="clear-btn" (click)="clearTheme()" title="Clear filter">
            ✕
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './level-selector.component.css',
})
export class LevelSelectorComponent implements OnInit {
  @Input() currentLevel: Level = 'beginner';
  @Input() currentTheme: string | null = null;
  
  @Output() levelChange = new EventEmitter<Level>();
  @Output() themeChange = new EventEmitter<string | null>();

  readonly i18n = inject(I18nService);
  private puzzleService = inject(PuzzleService);

  readonly levels = LEVELS;
  readonly availableThemes = signal<string[]>([]);

  ngOnInit() {
    this.loadThemes(this.currentLevel);
  }

  onLevelSelect(level: Level) {
    if (this.currentLevel !== level) {
      this.currentLevel = level;
      this.currentTheme = null;
      this.loadThemes(level);
      this.levelChange.emit(level);
    }
  }

  onThemeChange(themeValue: string) {
    const newTheme = themeValue === '' ? null : themeValue;
    if (this.currentTheme !== newTheme) {
      this.currentTheme = newTheme;
      this.themeChange.emit(newTheme);
    }
  }

  clearTheme() {
    this.currentTheme = null;
    this.themeChange.emit(null);
  }

  private async loadThemes(level: Level) {
    const themesData = await this.puzzleService.getThemes(level);
    const sortedThemes = Object.keys(themesData).sort();
    this.availableThemes.set(sortedThemes);
  }

  formatTheme(theme: string): string {
    return theme
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  getEmoji(level: Level): string {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '📈';
      case 'advanced': return '🔥';
      case 'master': return '🎓';
      case 'grandmaster': return '🏆';
      default: return '♟️';
    }
  }
}
