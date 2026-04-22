import { Component, inject, signal, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, TranslationKey } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

export interface TutorialStep {
  title: TranslationKey;
  description: TranslationKey;
  icon: string;
}

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tutorial-backdrop" [class.open]="isOpen()" (click)="skip()">
      <div class="tutorial-modal" (click)="$event.stopPropagation()">
        
        <!-- Progress Dots -->
        <div class="progress-dots">
          @for (step of steps; track $index) {
            <div 
              class="dot" 
              [class.active]="$index === currentStepIndex()"
              [class.completed]="$index < currentStepIndex()"
            ></div>
          }
        </div>

        <div class="tutorial-view">
          <div class="step-content">
            <div class="step-icon">{{ currentStep().icon }}</div>
            <h2 class="step-title">{{ i18n.t(currentStep().title) }}</h2>
            <p class="step-desc">{{ i18n.t(currentStep().description) }}</p>
          </div>
        </div>

        <footer class="tutorial-footer">
          <button class="btn secondary-btn" (click)="skip()">{{ i18n.t('skipTutorial') }}</button>
          
          <div class="nav-buttons">
            @if (currentStepIndex() > 0) {
              <button class="btn icon-btn" (click)="prev()">←</button>
            }
            
            @if (currentStepIndex() < steps.length - 1) {
              <button class="btn primary-btn" (click)="next()">
                {{ i18n.t('next') }}
              </button>
            } @else {
              <button class="btn finish-btn" (click)="finish()">
                {{ i18n.t('finish') }} 🚀
              </button>
            }
          </div>
        </footer>
      </div>
    </div>
  `,
  styleUrl: './tutorial.component.css',
})
export class TutorialComponent {
  readonly i18n = inject(I18nService);
  private storage = inject(StorageService);

  readonly isOpen = signal(false);
  readonly currentStepIndex = signal(0);

  readonly steps: TutorialStep[] = [
    { title: 'tutStep1Title', description: 'tutStep1Desc', icon: '♟️' },
    { title: 'tutStep2Title', description: 'tutStep2Desc', icon: '🎯' },
    { title: 'tutStep3Title', description: 'tutStep3Desc', icon: '📂' },
    { title: 'tutStep4Title', description: 'tutStep4Desc', icon: '💡' },
    { title: 'tutStep5Title', description: 'tutStep5Desc', icon: '🔥' },
    { title: 'tutStep6Title', description: 'tutStep6Desc', icon: '💍' },
  ];

  currentStep = () => this.steps[this.currentStepIndex()];

  open() {
    this.currentStepIndex.set(0);
    this.isOpen.set(true);
  }

  next() {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update(i => i + 1);
    }
  }

  prev() {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    this.isOpen.set(false);
    this.storage.setTutorialSeen();
  }
}
