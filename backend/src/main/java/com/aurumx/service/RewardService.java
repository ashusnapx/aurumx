package com.aurumx.service;

import com.aurumx.config.RewardConfig;
import com.aurumx.dto.response.RewardBalanceResponse;
import com.aurumx.entity.Customer;
import com.aurumx.entity.Reward;
import com.aurumx.entity.Transaction;
import com.aurumx.enums.CustomerType;
import com.aurumx.exception.ResourceNotFoundException;
import com.aurumx.repository.CustomerRepository;
import com.aurumx.repository.RewardRepository;
import com.aurumx.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardService {
    
    private final RewardRepository rewardRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final RewardConfig rewardConfig;
    
    /**
     * Process unprocessed transactions for a customer and calculate rewards
     * Uses configuration for reward percentages based on customer type
     * Transactions can only be processed once (idempotent)
     */
    @Transactional
    public RewardBalanceResponse processTransactions(Long customerId) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        List<Transaction> unprocessedTransactions = transactionRepository.findUnprocessedByCustomerId(customerId);
        
        if (unprocessedTransactions.isEmpty()) {
            log.info("No unprocessed transactions found for customer: {}", customerId);
        }
        
        // Get or create reward account
        Reward reward = rewardRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Reward newReward = new Reward();
                    newReward.setCustomer(customer);
                    newReward.setPointsBalance(BigDecimal.ZERO);
                    newReward.setLifetimeEarned(BigDecimal.ZERO);
                    return rewardRepository.save(newReward);
                });
        
        // Calculate total rewards from unprocessed transactions
        BigDecimal totalRewards = BigDecimal.ZERO;
        int rewardPercentage = customer.getCustomerType() == CustomerType.PREMIUM 
                ? rewardConfig.getPremiumPercentage() 
                : rewardConfig.getRegularPercentage();
        
        log.info("Processing {} transactions for {} customer with {}% reward rate",
                unprocessedTransactions.size(), customer.getCustomerType(), rewardPercentage);
        
        for (Transaction transaction : unprocessedTransactions) {
            BigDecimal rewardPoints = transaction.getAmount()
                    .multiply(BigDecimal.valueOf(rewardPercentage))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            totalRewards = totalRewards.add(rewardPoints);
            
            // Mark transaction as processed
            transaction.setProcessed(true);
        }
        
        // Update reward balances
        reward.setPointsBalance(reward.getPointsBalance().add(totalRewards));
        reward.setLifetimeEarned(reward.getLifetimeEarned().add(totalRewards));
        reward.setLastUpdated(LocalDateTime.now());
        
        // Save all changes in transaction
        transactionRepository.saveAll(unprocessedTransactions);
        rewardRepository.save(reward);
        
        log.info("Added {} reward points to customer {}. New balance: {}",
                totalRewards, customer.getName(), reward.getPointsBalance());
        
        return new RewardBalanceResponse(
                customer.getId(),
                customer.getName(),
                reward.getPointsBalance(),
                reward.getLifetimeEarned()
        );
    }
    
    public RewardBalanceResponse getRewardBalance(Long customerId) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        Reward reward = rewardRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Reward newReward = new Reward();
                    newReward.setPointsBalance(BigDecimal.ZERO);
                    newReward.setLifetimeEarned(BigDecimal.ZERO);
                    return newReward;
                });
        
        return new RewardBalanceResponse(
                customer.getId(),
                customer.getName(),
                reward.getPointsBalance(),
                reward.getLifetimeEarned()
        );
    }
}
