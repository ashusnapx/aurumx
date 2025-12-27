import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RewardService } from '../../../core/services/reward.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-reward-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Reward Catalog</h1>
        <div class="cart-widget" *ngIf="customerId">
           <a [routerLink]="['/customers', customerId, 'cart']" class="btn btn-primary">
             🛒 View Cart
           </a>
        </div>
      </div>

      <div class="category-filters">
        <button 
          class="filter-chip" 
          [class.active]="!selectedCategory()"
          (click)="selectCategory(null)"
        >
          All
        </button>
        <button 
          class="filter-chip" 
          *ngFor="let cat of categories()"
          [class.active]="selectedCategory() === cat.id"
          (click)="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="rewards-grid">
         <div class="reward-card" *ngFor="let item of rewards()">
            <div class="card-image-placeholder">🎁</div>
            <div class="card-content">
               <h3>{{ item.name }}</h3>
               <p class="description">{{ item.description }}</p>
               <div class="price-row">
                  <span class="price">{{ item.pointsCost }} pts</span>
                  <button 
                    class="btn btn-sm btn-secondary" 
                    (click)="addToCart(item)"
                    [disabled]="!customerId"
                  >
                    Add to Cart
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .category-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .filter-chip {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .filter-chip.active {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .rewards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .reward-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #eee;
      transition: transform 0.2s;
    }
    
    .reward-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .card-image-placeholder {
      height: 150px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }

    .card-content { padding: 1rem; }
    
    .card-content h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .description { color: #666; font-size: 0.9rem; margin-bottom: 1rem; height: 40px; overflow: hidden; }
    
    .price-row { display: flex; justify-content: space-between; align-items: center; }
    .price { font-weight: 700; color: var(--color-primary-dark); }
  `]
})
export class RewardCatalogComponent implements OnInit {
  rewardService = inject(RewardService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  categories = signal<any[]>([]);
  rewards = signal<any[]>([]);
  selectedCategory = signal<number | null>(null);
  
  customerId: number | null = null;

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
       this.customerId = +params['id'];
    });

    this.loadCategories();
    this.loadRewards(null);
  }

  loadCategories() {
    this.rewardService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  loadRewards(catId: number | null) {
     this.rewardService.getRewards(catId || undefined).subscribe(items => this.rewards.set(items));
  }

  selectCategory(id: number | null) {
     this.selectedCategory.set(id);
     this.loadRewards(id);
  }

  addToCart(item: any) {
     if (!this.customerId) {
        alert('Internal Error: Customer ID missing');
        return;
     }

     this.cartService.addToCart({
        customerId: this.customerId,
        rewardItemId: item.id,
        quantity: 1
     }).subscribe({
        next: () => alert('Added to cart'),
        error: (err) => alert('Failed to add: ' + err.error?.message)
     });
  }
}
