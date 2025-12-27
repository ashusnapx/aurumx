package com.aurumx.service;

import com.aurumx.dto.request.AddToCartRequest;
import com.aurumx.dto.response.RedemptionResponse;
import com.aurumx.entity.*;
import com.aurumx.enums.RedemptionStatus;
import com.aurumx.exception.BusinessRuleViolationException;
import com.aurumx.exception.InsufficientRewardBalanceException;
import com.aurumx.exception.ResourceNotFoundException;
import com.aurumx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final RewardItemRepository rewardItemRepository;
    private final CustomerRepository customerRepository;
    private final RewardRepository rewardRepository;
    private final RedemptionHistoryRepository redemptionHistoryRepository;
    
    @Transactional
    public void addToCart(AddToCartRequest request) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        RewardItem rewardItem = rewardItemRepository.findById(request.getRewardItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Reward item not found"));
        
        if (!rewardItem.isAvailable()) {
            throw new BusinessRuleViolationException("Reward item is not available");
        }
        
        CartItem cartItem = new CartItem();
        cartItem.setCustomer(customer);
        cartItem.setRewardItem(rewardItem);
        cartItem.setQuantity(request.getQuantity());
        
        cartItemRepository.save(cartItem);
        log.info("Added {} x {} to cart for customer {}", 
                request.getQuantity(), rewardItem.getName(), customer.getName());
    }
    
    public List<CartItem> getCart(Long customerId) {
        return cartItemRepository.findByCustomerId(customerId);
    }
    
    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }
    
    /**
     * Redeem all cart items for a customer
     * All-or-nothing redemption - partial redemption not allowed
     * Balance can never go negative
     */
    @Transactional
    public RedemptionResponse redeemCart(Long customerId) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);
        
        if (cartItems.isEmpty()) {
            throw new BusinessRuleViolationException("Cart is empty. Cannot redeem.");
        }
        
        Reward reward = rewardRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward account not found"));
        
        // Calculate total points required
        BigDecimal totalPointsRequired = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            int itemTotal = cartItem.getRewardItem().getPointsCost() * cartItem.getQuantity();
            totalPointsRequired = totalPointsRequired.add(BigDecimal.valueOf(itemTotal));
        }
        
        // Check if customer has sufficient balance
        if (reward.getPointsBalance().compareTo(totalPointsRequired) < 0) {
            throw new InsufficientRewardBalanceException(
                    String.format("Insufficient reward balance. Required: %s, Available: %s",
                            totalPointsRequired, reward.getPointsBalance())
            );
        }
        
        // Create redemption history
        RedemptionHistory redemptionHistory = new RedemptionHistory();
        redemptionHistory.setCustomer(customer);
        redemptionHistory.setTotalPointsUsed(totalPointsRequired);
        redemptionHistory.setStatus(RedemptionStatus.COMPLETED);
        
        List<RedemptionItem> redemptionItems = new ArrayList<>();
        List<RedemptionResponse.RedemptionItemDto> responseDtos = new ArrayList<>();
        
        for (CartItem cartItem : cartItems) {
            RedemptionItem redemptionItem = new RedemptionItem();
            redemptionItem.setRedemption(redemptionHistory);
            redemptionItem.setRewardItem(cartItem.getRewardItem());
            redemptionItem.setQuantity(cartItem.getQuantity());
            redemptionItem.setPointsCost(cartItem.getRewardItem().getPointsCost());
            redemptionItems.add(redemptionItem);
            
            int itemTotal = cartItem.getRewardItem().getPointsCost() * cartItem.getQuantity();
            responseDtos.add(new RedemptionResponse.RedemptionItemDto(
                    cartItem.getRewardItem().getName(),
                    cartItem.getQuantity(),
                    cartItem.getRewardItem().getPointsCost(),
                    itemTotal
            ));
        }
        
        redemptionHistory.setItems(redemptionItems);
        
        // Deduct points from reward balance
        reward.setPointsBalance(reward.getPointsBalance().subtract(totalPointsRequired));
        reward.setLastUpdated(LocalDateTime.now());
        
        // Save redemption and update reward
        RedemptionHistory savedRedemption = redemptionHistoryRepository.save(redemptionHistory);
        rewardRepository.save(reward);
        
        // Clear cart
        cartItemRepository.deleteByCustomerId(customerId);
        
        log.info("Redeemed {} points for customer {}. New balance: {}",
                totalPointsRequired, customer.getName(), reward.getPointsBalance());
        
        return new RedemptionResponse(
                savedRedemption.getId(),
                customer.getId(),
                totalPointsRequired,
                savedRedemption.getRedeemedAt(),
                responseDtos
        );
    }
    
    public List<RedemptionHistory> getRedemptionHistory(Long customerId) {
        return redemptionHistoryRepository.findByCustomerIdOrderByRedeemedAtDesc(customerId);
    }
}
