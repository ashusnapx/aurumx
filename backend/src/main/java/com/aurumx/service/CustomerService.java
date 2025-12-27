package com.aurumx.service;

import com.aurumx.config.CustomerConfig;
import com.aurumx.dto.request.CreateCustomerRequest;
import com.aurumx.dto.response.CustomerResponse;
import com.aurumx.entity.Customer;
import com.aurumx.entity.Reward;
import com.aurumx.enums.CustomerType;
import com.aurumx.exception.BusinessRuleViolationException;
import com.aurumx.exception.ResourceNotFoundException;
import com.aurumx.repository.CustomerRepository;
import com.aurumx.repository.RewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final RewardRepository rewardRepository;
    private final CustomerConfig customerConfig;
    
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        // Check for duplicate email
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleViolationException("Customer with email " + request.getEmail() + " already exists");
        }
        
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAssociationDate(request.getAssociationDate());
        customer.setCustomerType(calculateCustomerType(request.getAssociationDate()));
        customer.setDeleted(false);
        
        // Get current authenticated CES user ID (simplified for now)
        customer.setCreatedBy(1L);
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Initialize reward account for customer
        Reward reward = new Reward();
        reward.setCustomer(savedCustomer);
        reward.setPointsBalance(BigDecimal.ZERO);
        reward.setLifetimeEarned(BigDecimal.ZERO);
        rewardRepository.save(reward);
        
        return mapToResponse(savedCustomer);
    }
    
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository.findByDeletedFalse(pageable)
                .map(this::mapToResponse);
    }
    
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }
    
    public Page<CustomerResponse> searchByName(String name, Pageable pageable) {
        return customerRepository.searchByName(name, pageable)
                .map(this::mapToResponse);
    }
    
    public Page<CustomerResponse> searchByCardNumber(String cardNumber, Pageable pageable) {
        return customerRepository.searchByCardNumber(cardNumber, pageable)
                .map(this::mapToResponse);
    }
    
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        
        customer.setDeleted(true);
        customerRepository.save(customer);
    }
    
    /**
     * Calculate customer type based on association date
     * Uses configuration to determine premium threshold
     * @param associationDate Customer's association date
     * @return CustomerType REGULAR or PREMIUM
     */
    private CustomerType calculateCustomerType(LocalDate associationDate) {
        int yearsAssociated = Period.between(associationDate, LocalDate.now()).getYears();
        
        if (yearsAssociated >= customerConfig.getPremiumAssociationYears()) {
            return CustomerType.PREMIUM;
        }
        return CustomerType.REGULAR;
    }
    
    private CustomerResponse mapToResponse(Customer customer) {
        BigDecimal rewardBalance = rewardRepository.findByCustomerId(customer.getId())
                .map(Reward::getPointsBalance)
                .orElse(BigDecimal.ZERO);
        
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAssociationDate(),
                customer.getCustomerType(),
                rewardBalance
        );
    }
}
