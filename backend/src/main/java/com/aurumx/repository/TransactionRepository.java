package com.aurumx.repository;

import com.aurumx.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByCreditCardId(Long creditCardId);
    
    @Query("SELECT t FROM Transaction t " +
           "JOIN t.creditCard cc " +
           "WHERE cc.customer.id = :customerId AND t.processed = false")
    List<Transaction> findUnprocessedByCustomerId(@Param("customerId") Long customerId);
}
