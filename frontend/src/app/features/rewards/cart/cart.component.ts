import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CartService, Cart } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" *ngIf="cart()">
      <div class="page-header">
        <h1 class="page-title">Shopping Cart</h1>
      </div>

      <div class="cart-container">
         <div class="cart-items card">
            <div class="cart-item" *ngFor="let item of cart()!.items">
               <div class="item-info">
                  <h3>{{ item.rewardItemName }}</h3>
                  <p>Cost: {{ item.pointsCost }} pts x {{ item.quantity }}</p>
               </div>
               <div class="item-total">
                  {{ item.totalPoints }} pts
               </div>
            </div>
            
            <div *ngIf="cart()!.items.length === 0" class="empty-cart">
               <p>Your cart is empty.</p>
               <a [routerLink]="['../catalog']" class="btn btn-primary">Browse Rewards</a>
            </div>
         </div>

         <div class="cart-summary card" *ngIf="cart()!.items.length > 0">
            <h3>Summary</h3>
            <div class="summary-row total">
               <span>Total Points:</span>
               <span>{{ cart()!.totalPoints }}</span>
            </div>
            
            <button 
               class="btn btn-primary full-width" 
               (click)="redeem()"
               [disabled]="isRedeeming()"
            >
               {{ isRedeeming() ? 'Redeeming...' : 'Redeem Now' }}
            </button>
            <p *ngIf="error()" class="error-msg">{{ error() }}</p>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
       display: grid;
       grid-template-columns: 2fr 1fr;
       gap: 2rem;
    }

    .cart-item {
       display: flex;
       justify-content: space-between;
       padding: 1rem;
       border-bottom: 1px solid #eee;
    }
    .cart-item:last-child { border-bottom: none; }

    .item-total { font-weight: bold; font-size: 1.1rem; }

    .empty-cart { text-align: center; padding: 3rem; }

    .summary-row {
       display: flex; justify-content: space-between;
       margin-bottom: 1rem; font-size: 1.1rem;
    }
    .summary-row.total { font-weight: 800; font-size: 1.2rem; border-top: 1px solid #eee; padding-top: 1rem; }
    
    .full-width { width: 100%; margin-top: 1rem; }
    .error-msg { color: var(--color-error); margin-top: 1rem; text-align: center; }
  `]
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  cart = signal<Cart | null>(null);
  customerId: number | null = null;
  isRedeeming = signal(false);
  error = signal('');

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
       this.customerId = +params['id'];
       if (this.customerId) {
          this.loadCart(this.customerId);
       }
    });
  }

  loadCart(id: number) {
     this.cartService.getCart(id).subscribe(c => this.cart.set(c));
  }

  redeem() {
     if (!this.customerId) return;
     this.isRedeeming.set(true);
     this.error.set('');

     this.cartService.redeemCart(this.customerId).subscribe({
        next: (res) => {
           alert('Redemption Successful!');
           this.router.navigate(['../'], { relativeTo: this.route }); // Go back to profile
        },
        error: (err) => {
           this.isRedeeming.set(false);
           this.error.set(err.error?.message || 'Redemption failed. Insufficient Balance?');
        }
     });
  }
}
