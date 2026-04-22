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
      <!-- Level Tabs (desktop) + Filter tab -->
      <div class="level-tabs desktop-only">
        @for (l of levels; track l) {
          <button 
            class="level-tab" 
            [class.active]="currentLevel === l && !filterTabActive()"
            (click)="onLevelSelect(l)"
          >
            <span class="level-icon">{{ getEmoji(l) }}</span>
            <span class="level-text">{{ i18n.t(l) }}</span>
          </button>
        }
        <!-- Filter tab -->
        <button
          class="level-tab filter-tab"
          [class.active]="filterTabActive()"
          (click)="toggleFilterTab()"
        >
          <span class="level-icon">🔍</span>
          <span class="level-text">{{ i18n.t('filterByTheme') }}</span>
          @if (currentTheme) {
            <span class="filter-dot"></span>
          }
        </button>
      </div>

      <!-- Level Dropdown + Filter tab (mobile) -->
      <div class="level-dropdown-row mobile-only">
        <div class="select-wrapper level-select-wrapper">
          <select
            class="theme-select level-select"
            [value]="filterTabActive() ? '__filter__' : currentLevel"
            (change)="onMobileSelect($any($event.target).value)"
          >
            @for (l of levels; track l) {
              <option [value]="l">{{ getEmoji(l) }} {{ i18n.t(l) }}</option>
            }
            <option value="__filter__">🔍 {{ i18n.t('filterByTheme') }}{{ currentTheme ? ' ●' : '' }}</option>
          </select>
        </div>
      </div>

      <!-- Theme Filter panel (shown when filter tab is active) -->
      @if (filterTabActive()) {
        <div class="theme-filter-row">
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
            <button class="clear-btn" (click)="clearTheme()" title="Clear filter">✕</button>
          }
        </div>
      }
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
  /** true when the filter tab is the active "mode" */
  readonly filterTabActive = signal(false);

  ngOnInit() {
    this.loadThemes(this.currentLevel);
    // If a theme is pre-selected, open the filter tab
    if (this.currentTheme) {
      this.filterTabActive.set(true);
    }
  }

  toggleFilterTab() {
    this.filterTabActive.update(v => !v);
  }

  onLevelSelect(level: Level) {
    this.filterTabActive.set(false);
    if (this.currentLevel !== level) {
      this.currentLevel = level;
      this.currentTheme = null;
      this.loadThemes(level);
      this.levelChange.emit(level);
    }
  }

  onMobileSelect(value: string) {
    if (value === '__filter__') {
      this.filterTabActive.set(true);
    } else {
      this.onLevelSelect(value as Level);
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
