import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { CreditCardService } from '../../../core/services/credit-card.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { RewardService } from '../../../core/services/reward.service';
import { Customer } from '../../../core/models/customer.model';
import { CreditCard } from '../../../core/models/credit-card.model';
import { Transaction } from '../../../core/models/transaction.model';
import { RewardBalanceResponse } from '../../../core/models/reward.model';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" *ngIf="customer()">
      <div class="page-header">
        <div class="header-left">
          <a routerLink="/customers" class="back-link">← Back to Customers</a>
          <h1 class="page-title">{{ customer()!.name }}</h1>
        </div>
        <div class="header-right">
          <span class="type-badge" [ngClass]="customer()!.customerType.toLowerCase()">
            {{ customer()!.customerType }}
          </span>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-grid">
        <div class="card detail-card">
          <h3>Contact Info</h3>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ customer()!.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">{{ customer()!.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">Since:</span>
            <span class="value">{{ customer()!.associationDate | date }}</span>
          </div>
        </div>

        <div class="card reward-card">
          <h3>Reward Balance</h3>
          <div class="balance-display">
            <span class="points">{{ rewardBalance()?.pointsBalance | number:'1.2-2' }}</span>
            <span class="unit">Points</span>
          </div>
          <div class="lifetime">
             Lifetime Earned: {{ rewardBalance()?.lifetimeEarned | number:'1.2-2' }}
          </div>
          <button 
            class="btn btn-primary full-width" 
            (click)="processRewards()" 
            [disabled]="isProcessing()"
          >
            {{ isProcessing() ? 'Processing...' : 'Process Pending Transactions' }}
          </button>
          
          <a [routerLink]="['./catalog']" class="btn btn-secondary full-width" style="margin-top: 0.5rem">
            🎁 Browse Rewards Catalog
          </a>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs">
        <button [class.active]="activeTab() === 'cards'" (click)="activeTab.set('cards')">
            Credit Cards
        </button>
        <button [class.active]="activeTab() === 'transactions'" (click)="activeTab.set('transactions')">
            Transactions
        </button>
        <button [class.active]="activeTab() === 'redemptions'" (click)="activeTab.set('redemptions'); loadRedemptions()">
            Redemptions
        </button>
      </div>

      <!-- Credit Cards Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'cards'">
        <div class="card">
          <div class="section-header">
            <h3>Registered Cards</h3>
            <button class="btn btn-secondary btn-sm" (click)="showAddCardForm.set(true)">
              + Add Card
            </button>
          </div>

          <!-- Add Card Form -->
          <div class="inline-form" *ngIf="showAddCardForm()">
             <form [formGroup]="cardForm" (ngSubmit)="onAddCard()">
                <div class="form-row">
                   <div class="form-group">
                      <input type="text" formControlName="cardNumber" placeholder="Card Number (16 digits)" class="form-control">
                   </div>
                   <div class="form-group">
                      <input type="text" formControlName="cardHolderName" placeholder="Card Holder Name" class="form-control">
                   </div>
                   <div class="form-group">
                      <input type="date" formControlName="expiryDate" class="form-control">
                   </div>
                   <button type="submit" class="btn btn-primary btn-sm" [disabled]="cardForm.invalid">Add</button>
                   <button type="button" class="btn btn-secondary btn-sm" (click)="showAddCardForm.set(false)">Cancel</button>
                </div>
                <div class="error-msg" *ngIf="cardError()">{{ cardError() }}</div>
             </form>
          </div>

          <div class="cards-list">
             <div class="credit-card-item" *ngFor="let card of creditCards()">
                <div class="card-icon">💳</div>
                <div class="card-details">
                   <div class="card-number">**** **** **** {{ card.cardNumber.slice(-4) }}</div>
                   <div class="card-meta">{{ card.cardHolderName }} | Exp: {{ card.expiryDate | date }}</div>
                </div>
                <button class="btn btn-secondary btn-sm" (click)="viewTransactions(card.id)">
                    View Transactions
                </button>
             </div>
             <p *ngIf="creditCards().length === 0" class="empty-text">No credit cards linked.</p>
          </div>
        </div>
      </div>

      <!-- Transactions Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'transactions'">
         <div class="transaction-controls card">
            <div class="control-row">
               <div class="select-group">
                  <label>Select Card:</label>
                  <select #cardSelect (change)="loadTransactions(+cardSelect.value)">
                     <option value="" disabled selected>-- Choose Card --</option>
                     <option *ngFor="let card of creditCards()" [value]="card.id" [selected]="selectedCardId() === card.id">
                        **** {{ card.cardNumber.slice(-4) }}
                     </option>
                  </select>
               </div>
               <button 
                  class="btn btn-primary" 
                  *ngIf="selectedCardId()"
                  (click)="generateTransactions()"
                  [disabled]="isGenerating()"
               >
                  Generate 50 Transactions
               </button>
            </div>
         </div>

         <div class="card" *ngIf="selectedCardId()">
            <table class="table">
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Merchant</th>
                     <th>Amount</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  <tr *ngFor="let tx of transactions()">
                     <td>{{ tx.transactionDate | date:'medium' }}</td>
                     <td>{{ tx.merchant }}</td>
                     <td>{{ tx.amount | currency:'INR' }}</td>
                     <td>
                        <span class="status-badge" [class.processed]="tx.processed">
                           {{ tx.processed ? 'Processed' : 'Pending' }}
                        </span>
                     </td>
                  </tr>
                  <tr *ngIf="transactions().length === 0">
                     <td colspan="4" class="empty-text">No transactions found for this card.</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
      
      <!-- Redemptions Tab -->
      <div class="tab-content" *ngIf="activeTab() === 'redemptions'">
         <div class="card">
            <div *ngFor="let redemption of redemptions()" class="redemption-item" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                <div class="redemption-header" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                   <span style="font-weight: bold;">Redeemed on {{ redemption.redeemedAt | date:'medium' }}</span>
                   <span style="font-weight: bold; color: var(--color-primary-dark);">Total: {{ redemption.totalPointsUsed }} pts</span>
                </div>
                <div class="redemption-items">
                    <div *ngFor="let item of redemption.items" style="font-size: 0.9rem; color: #555; margin-left: 1rem;">
                        • {{ item.quantity }}x {{ item.rewardItemName }} ({{ item.totalPoints }} pts)
                    </div>
                </div>
            </div>
            <p *ngIf="redemptions().length === 0" class="empty-text">No redemptions yet.</p>
         </div>
      </div>

    </div>
  `,
  styles: [`
    .overview-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .back-link {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
        text-decoration: none;
        font-size: 0.9rem;
    }

    .type-badge {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.9rem;
    }
    .type-badge.premium { background: var(--color-primary); color: white; }
    .type-badge.regular { background: #e0e0e0; color: #333; }

    .info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child { border-bottom: none; }
    .label { font-weight: 500; color: #666; }

    .balance-display {
        text-align: center;
        margin: 1.5rem 0;
    }
    .points { font-size: 2.5rem; font-weight: 800; color: var(--color-primary-dark); }
    .unit { font-size: 1rem; color: #666; display: block; }
    .lifetime { text-align: center; font-size: 0.9rem; color: #888; margin-bottom: 1rem; }
    .full-width { width: 100%; }

    .tabs { display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid #ddd; }
    .tabs button {
        background: none; border: none; padding: 1rem; cursor: pointer;
        font-weight: 500; color: #666; border-bottom: 2px solid transparent;
    }
    .tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

    .credit-card-item {
        display: flex; align-items: center; gap: 1rem;
        padding: 1rem; border: 1px solid #eee; border-radius: 6px; margin-bottom: 0.5rem;
    }
    .card-icon { font-size: 2rem; }
    .card-details { flex: 1; }
    .card-number { font-weight: 600; font-family: monospace; font-size: 1.1rem; }
    .card-meta { font-size: 0.85rem; color: #666; }

    .inline-form { background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 0.5rem; align-items: center; }
    .error-msg { color: var(--color-error); font-size: 0.8rem; margin-top: 0.5rem; }

    .transaction-controls { padding: 1rem; margin-bottom: 1rem; }
    .control-row { display: flex; justify-content: space-between; align-items: center; }
    .select-group { display: flex; align-items: center; gap: 1rem; }
    select { padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd; min-width: 200px; }

    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #eee; }
    .status-badge.processed { background: #e8f5e9; color: #2e7d32; }
    
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    .empty-text { text-align: center; padding: 2rem; color: #888; }
  `]
})
export class CustomerProfileComponent implements OnInit {
  route = inject(ActivatedRoute);
  customerService = inject(CustomerService);
  cardService = inject(CreditCardService);
  txService = inject(TransactionService);
  rewardService = inject(RewardService);
  fb = inject(FormBuilder);

  customer = signal<Customer | null>(null);
  rewardBalance = signal<RewardBalanceResponse | null>(null);
  creditCards = signal<CreditCard[]>([]);
  transactions = signal<Transaction[]>([]);
  redemptions = signal<any[]>([]);
  
  activeTab = signal<'cards' | 'transactions' | 'redemptions'>('cards');
  selectedCardId = signal<number | null>(null);
  
  // Loading states
  isProcessing = signal(false);
  isGenerating = signal(false);

  // Add Card Logic
  showAddCardForm = signal(false);
  cardError = signal('');
  cardForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardHolderName: ['', Validators.required],
    expiryDate: ['', Validators.required]
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
        const id = +params['id'];
        if (id) {
            this.loadCustomer(id);
            this.loadRewardBalance(id);
            this.loadCreditCards(id);
        }
    });
  }

  loadCustomer(id: number) {
     this.customerService.getCustomer(id).subscribe(c => this.customer.set(c));
  }

  loadRewardBalance(id: number) {
     this.rewardService.getRewardBalance(id).subscribe(b => this.rewardBalance.set(b));
  }

  loadCreditCards(id: number) {
     this.cardService.getCustomerCards(id).subscribe(cards => this.creditCards.set(cards));
  }

  loadTransactions(cardId: number) {
     this.selectedCardId.set(cardId);
     this.txService.getTransactionsByCard(cardId).subscribe(txs => {
         // Sort by date desc
         this.transactions.set(txs.sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()));
     });
  }
  
  loadRedemptions() {
     const customerId = this.customer()?.id;
     if (customerId) {
         this.rewardService.getRedemptionHistory(customerId).subscribe(hist => {
             this.redemptions.set(hist.sort((a,b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()));
         });
     }
  }

  viewTransactions(cardId: number) {
     this.activeTab.set('transactions');
     // We need to wait for tab switch essentially, but in angular change detection works fast enough usually
     // Or we can just set the selected card ID and the template will pick it up or we can invoke loadTransactions
     // Since the select element might not be rendered yet, standard way is to rely on signal
     setTimeout(() => {
        // Need to update the UI select if possible, or just load data
        this.loadTransactions(cardId);
        // Note: For full UI sync, we might need two-way binding on the select
     }, 0);
  }

  onAddCard() {
     if (this.cardForm.valid && this.customer()) {
         this.cardService.addCreditCard({
             customerId: this.customer()!.id,
             ...this.cardForm.value as any
         }).subscribe({
             next: (card) => {
                 this.creditCards.update(cards => [...cards, card]);
                 this.showAddCardForm.set(false);
                 this.cardForm.reset();
             },
             error: (err) => {
                 this.cardError.set(err.error?.message || 'Failed to add card');
             }
         });
     }
  }

  generateTransactions() {
      const cardId = this.selectedCardId();
      if (!cardId) return;

      this.isGenerating.set(true);
      this.txService.generateTransactions({ creditCardId: cardId }).subscribe({
          next: () => {
              this.loadTransactions(cardId); // Reload
              this.isGenerating.set(false);
          },
          error: () => this.isGenerating.set(false)
      });
  }

  processRewards() {
     const customerId = this.customer()?.id;
     if (!customerId) return;

     this.isProcessing.set(true);
     this.rewardService.processTransactions(customerId).subscribe({
         next: (balance) => {
             this.rewardBalance.set(balance);
             this.isProcessing.set(false);
             // Also reload transactions if we are viewing them, as status changed
             if (this.selectedCardId()) {
                 this.loadTransactions(this.selectedCardId()!);
             }
         },
         error: () => this.isProcessing.set(false)
     });
  }
}
