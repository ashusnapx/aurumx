package com.aurumx.service;

import com.aurumx.dto.request.AddCreditCardRequest;
import com.aurumx.entity.CreditCard;
import com.aurumx.entity.Customer;
import com.aurumx.exception.BusinessRuleViolationException;
import com.aurumx.exception.ResourceNotFoundException;
import com.aurumx.repository.CreditCardRepository;
import com.aurumx.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditCardService {
    
    private final CreditCardRepository creditCardRepository;
    private final CustomerRepository customerRepository;
    
    @Transactional
    public CreditCard addCreditCard(AddCreditCardRequest request) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        if (creditCardRepository.existsByCardNumber(request.getCardNumber())) {
            throw new BusinessRuleViolationException("Credit card number already exists");
        }
        
        CreditCard creditCard = new CreditCard();
        creditCard.setCustomer(customer);
        creditCard.setCardNumber(request.getCardNumber());
        creditCard.setCardHolderName(request.getCardHolderName());
        creditCard.setExpiryDate(request.getExpiryDate());
        
        return creditCardRepository.save(creditCard);
    }
    
    public List<CreditCard> getCustomerCreditCards(Long customerId) {
        return creditCardRepository.findByCustomerId(customerId);
    }
}
