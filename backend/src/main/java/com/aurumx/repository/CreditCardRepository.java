package com.aurumx.repository;

import com.aurumx.entity.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    List<CreditCard> findByCustomerId(Long customerId);
    boolean existsByCardNumber(String cardNumber);
}
