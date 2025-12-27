package com.aurumx.controller;

import com.aurumx.dto.response.RewardBalanceResponse;
import com.aurumx.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rewards")
@RequiredArgsConstructor
public class RewardController {
    
    private final RewardService rewardService;
    
    @PostMapping("/process/{customerId}")
    public ResponseEntity<RewardBalanceResponse> processTransactions(@PathVariable Long customerId) {
        RewardBalanceResponse response = rewardService.processTransactions(customerId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/balance/{customerId}")
    public ResponseEntity<RewardBalanceResponse> getRewardBalance(@PathVariable Long customerId) {
        RewardBalanceResponse response = rewardService.getRewardBalance(customerId);
        return ResponseEntity.ok(response);
    }
}
