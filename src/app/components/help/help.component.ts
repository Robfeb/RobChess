import { Component, inject, signal, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="help-backdrop" [class.open]="isOpen()" (click)="close()">
      <div class="help-modal" (click)="$event.stopPropagation()">
        <header class="help-header">
          <h2>{{ i18n.t('help') }} & {{ i18n.t('legend') }}</h2>
          <button class="close-btn" (click)="close()">✕</button>
        </header>
        
        <div class="help-content">
          <section class="help-section">
            <h3>{{ i18n.t('help') }}</h3>
            <p>{{ i18n.t('helpDesc') }}</p>
            <button class="tutorial-trigger-btn" (click)="startTutorial()">
              🎓 {{ i18n.t('startTutorial') }}
            </button>
          </section>

          <section class="help-section">
            <h3>{{ i18n.t('legend') }}</h3>
            <p>{{ i18n.t('legendDesc') }}</p>
            
            <div class="legend-grid">
              <div class="legend-item">
                <span class="legend-color legal"></span>
                <span>{{ i18n.t('legalMoves') }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-color capture"></span>
                <span>Capture</span>
              </div>
              <div class="legend-item">
                <span class="legend-color last-move"></span>
                <span>Last Move</span>
              </div>
              <div class="legend-item">
                <span class="legend-color check"></span>
                <span>Check / Error</span>
              </div>
            </div>
          </section>

          <section class="help-section">
            <h3>{{ i18n.t('crowns') }} & {{ i18n.t('coins') }}</h3>
            <p>{{ i18n.t('tutStep6Desc') }}</p>
          </section>
        </div>
      </div>
    </div>
  `,
  styleUrl: './help.component.css',
})
export class HelpComponent {
  readonly i18n = inject(I18nService);
  readonly isOpen = signal(false);
  readonly tutorialRequest = output<void>();

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  startTutorial() {
    this.close();
    this.tutorialRequest.emit();
  }
}
