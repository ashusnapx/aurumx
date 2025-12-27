package com.aurumx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardBalanceResponse {
    private Long customerId;
    private String customerName;
    private BigDecimal pointsBalance;
    private BigDecimal lifetimeEarned;
}
