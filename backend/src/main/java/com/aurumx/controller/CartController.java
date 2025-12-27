package com.aurumx.controller;

import com.aurumx.dto.request.AddToCartRequest;
import com.aurumx.dto.response.CartResponse;
import com.aurumx.dto.response.RedemptionResponse;
import com.aurumx.entity.CartItem;
import com.aurumx.entity.RedemptionHistory;
import com.aurumx.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(@Valid @RequestBody AddToCartRequest request) {
        cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @GetMapping("/{customerId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long customerId) {
        CartResponse cart = cartService.getCart(customerId);
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{customerId}/redeem")
    public ResponseEntity<RedemptionResponse> redeemCart(@PathVariable Long customerId) {
        RedemptionResponse response = cartService.redeemCart(customerId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/redemption-history/{customerId}")
    public ResponseEntity<List<RedemptionHistory>> getRedemptionHistory(@PathVariable Long customerId) {
        List<RedemptionHistory> history = cartService.getRedemptionHistory(customerId);
        return ResponseEntity.ok(history);
    }
}
