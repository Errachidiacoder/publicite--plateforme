import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnonceService } from '../services/anonce.service';

@Component({
  selector: 'app-super-deals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="super-deals-section">
      <div class="container">
        <div class="deals-header">
          <div class="header-left">
            <span class="deals-icon">⚡</span>
            <h2>SuperDeals</h2>
            <div class="timer-badge">
              <span>Se termine dans</span>
              <div class="timer">
                <span class="time-block">{{ hours }}</span>:
                <span class="time-block">{{ minutes }}</span>:
                <span class="time-block">{{ seconds }}</span>
              </div>
            </div>
          </div>
          <a routerLink="/search" [queryParams]="{sort: 'price_asc'}" class="view-all">Tout voir ></a>
        </div>

        <div class="deals-grid" *ngIf="!loading; else loadingTpl">
          @for (deal of deals; track deal.id) {
            <a [routerLink]="['/product', deal.id]" class="deal-card">
              <div class="deal-img-wrapper">
                <img [src]="deal.img" [alt]="deal.title" loading="lazy">
                <span class="discount-tag">-{{ deal.discount }}%</span>
              </div>
              <div class="deal-info">
                <div class="price-row">
                  <span class="current-price">{{ deal.price }} <small>DH</small></span>
                  <span class="original-price">{{ deal.originalPrice }} DH</span>
                </div>
                <div class="deal-meta">
                  <span class="sold-count">{{ deal.sold }} vendus</span>
                </div>
              </div>
            </a>
          }
        </div>

        <ng-template #loadingTpl>
          <div class="loading-grid">
            <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .super-deals-section {
      background: #f5f5f5;
      padding: 20px 0;
      margin-bottom: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    .deals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .deals-icon {
      font-size: 24px;
    }
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: #333;
      margin: 0;
    }
    .timer-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffecec;
      padding: 4px 8px;
      border-radius: 4px;
      margin-left: 10px;
    }
    .timer-badge span {
      font-size: 12px;
      color: #ff4747;
      font-weight: 600;
    }
    .timer {
      display: flex;
      align-items: center;
      gap: 2px;
      font-weight: 700;
      color: #ff4747;
    }
    .time-block {
      background: #ff4747;
      color: white;
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 12px;
    }
    .view-all {
      font-size: 14px;
      color: #666;
      text-decoration: none;
      font-weight: 600;
    }
    .view-all:hover {
      color: #ff4747;
    }

    .deals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .deal-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .deal-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .deal-img-wrapper {
      position: relative;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      background: #f9f9f9;
    }
    .deal-img-wrapper img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .discount-tag {
      position: absolute;
      bottom: 0;
      left: 0;
      background: #ff4747;
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 2px 6px;
      border-top-right-radius: 8px;
    }
    .deal-info {
      padding: 10px;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 4px;
    }
    .current-price {
      font-size: 18px;
      font-weight: 800;
      color: #ff4747;
    }
    .current-price small {
      font-size: 12px;
    }
    .original-price {
      font-size: 12px;
      color: #999;
      text-decoration: line-through;
    }
    .deal-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sold-count {
      font-size: 11px;
      color: #666;
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .skeleton-card {
      background: #eee;
      padding-top: 140%;
      border-radius: 8px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    @media (max-width: 600px) {
      .deals-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .header-left h2 { font-size: 18px; }
      .timer-badge span { display: none; }
    }
  `]
})
export class SuperDealsComponent implements OnInit {
  private anonceService = inject(AnonceService);
  
  deals: any[] = [];
  loading = true;
  
  // Timer logic
  hours = '02';
  minutes = '45';
  seconds = '12';

  ngOnInit() {
    this.loadDeals();
    this.startTimer();
  }

  loadDeals() {
    this.anonceService.getActive().subscribe({
      next: (anonces) => {
        // Filter active ads and maybe limit to 6-12 items
        // Simulate discount logic for visual appeal (AliExpress style)
        this.deals = anonces.slice(0, 12).map(a => {
          const price = a.prixAfiche || 100;
          const discount = Math.floor(Math.random() * 30) + 10; // Random discount 10-40%
          const originalPrice = Math.floor(price / (1 - discount/100));
          
          return {
            id: a.id,
            title: a.titreAnonce,
            img: a.imageUrl || 'https://via.placeholder.com/200',
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            sold: a.compteurVues || Math.floor(Math.random() * 500) // Simulate sold count if not available
          };
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  startTimer() {
    setInterval(() => {
      let h = parseInt(this.hours);
      let m = parseInt(this.minutes);
      let s = parseInt(this.seconds);
      
      s--;
      if (s < 0) {
        s = 59;
        m--;
        if (m < 0) {
          m = 59;
          h--;
          if (h < 0) h = 23;
        }
      }
      
      this.hours = h.toString().padStart(2, '0');
      this.minutes = m.toString().padStart(2, '0');
      this.seconds = s.toString().padStart(2, '0');
    }, 1000);
  }
}
