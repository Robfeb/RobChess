import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-coin-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="coin-display" [title]="i18n.t('coins')">
      <div class="coin-icon-wrapper">
        <span class="coin-icon">🪙</span>
        <div class="coin-shine"></div>
      </div>
      <span class="coin-count">{{ storage.totalCoins() }}</span>
    </div>
  `,
  styles: [`
    .coin-display {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #ffd700, #ffa000);
      padding: 8px 20px;
      border-radius: 24px;
      box-shadow: 0 4px 15px rgba(255, 160, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.3);
      border: 2px solid #fff;
      color: #5d4037;
      font-weight: 900;
      font-size: 1.4rem;
      cursor: default;
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .coin-display:hover {
      transform: scale(1.05);
    }

    .coin-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .coin-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      animation: spin 3s linear infinite;
    }

    .coin-shine {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 0%,
        transparent 40%,
        rgba(255, 255, 255, 0.6) 50%,
        transparent 60%,
        transparent 100%
      );
      animation: shine 2s infinite;
      pointer-events: none;
    }

    .coin-count {
      text-shadow: 0 1px 2px rgba(255,255,255,0.5);
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    @keyframes spin {
      0% { transform: rotateY(0); }
      20% { transform: rotateY(360deg); }
      100% { transform: rotateY(360deg); }
    }

    @keyframes shine {
      0% { transform: translate(-100%, -100%); }
      100% { transform: translate(100%, 100%); }
    }

    /* Small screens optimization */
    @media (max-width: 600px) {
      .coin-display {
        padding: 5px 10px;
        gap: 6px;
        font-size: 0.95rem;
        border-radius: 16px;
      }
      .coin-icon {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 430px) {
      .coin-display {
        padding: 4px 8px;
        gap: 4px;
        font-size: 0.85rem;
        border-width: 1px;
      }
      .coin-icon {
        font-size: 1rem;
      }
    }

  `]
})
export class CoinDisplayComponent {
  readonly storage = inject(StorageService);
  readonly i18n = inject(I18nService);
}
