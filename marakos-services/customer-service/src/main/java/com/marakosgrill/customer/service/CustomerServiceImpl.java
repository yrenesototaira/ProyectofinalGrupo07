package com.marakosgrill.customer.service;

import com.marakosgrill.customer.dto.CustomerRequest;
import com.marakosgrill.customer.dto.CustomerResponse;
import com.marakosgrill.customer.exception.CustomerNotFoundException;
import com.marakosgrill.customer.model.Customer;
import com.marakosgrill.customer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = mapToCustomer(request);
        Customer saved = customerRepository.save(customer);
        return mapToCustomerResponse(saved);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        updateCustomerFromRequest(customer, request);
        Customer updated = customerRepository.save(customer);
        return mapToCustomerResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        customer.setActive(false);
        customerRepository.save(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        return mapToCustomerResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers(String status, String name, String lastName) {
        List<Customer> customers;
        if (status != null && !status.isEmpty()) {
            customers = customerRepository.findByStatus(status);
        } else if ((name != null && !name.isEmpty()) || (lastName != null && !lastName.isEmpty())) {
            customers = customerRepository.findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(name, lastName);
        } else {
            customers = customerRepository.findAll();
        }
        return customers.stream().map(this::mapToCustomerResponse).collect(Collectors.toList());
    }

    // Manual mapping methods
    private CustomerResponse mapToCustomerResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setUserId(customer.getUserId());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setPhone(customer.getPhone());
        response.setPhoto(customer.getPhoto());
        response.setBirthDate(customer.getBirthDate());
        response.setIdentityDocument(customer.getIdentityDocument());
        response.setFinancialEntity(customer.getFinancialEntity());
        response.setRefundAccount(customer.getRefundAccount());
        response.setStatus(customer.getStatus());
        return response;
    }

    private Customer mapToCustomer(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setUserId(request.getUserId());
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setPhoto(request.getPhoto());
        customer.setBirthDate(request.getBirthDate());
        customer.setIdentityDocument(request.getIdentityDocument());
        customer.setFinancialEntity(request.getFinancialEntity());
        customer.setRefundAccount(request.getRefundAccount());
        customer.setStatus(request.getStatus());
        customer.setCreatedByUserId(request.getCreatedByUserId());
        return customer;
    }

    private void updateCustomerFromRequest(Customer customer, CustomerRequest request) {
        customer.setUserId(request.getUserId());
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setPhoto(request.getPhoto());
        customer.setBirthDate(request.getBirthDate());
        customer.setIdentityDocument(request.getIdentityDocument());
        customer.setFinancialEntity(request.getFinancialEntity());
        customer.setRefundAccount(request.getRefundAccount());
        customer.setStatus(request.getStatus());
        customer.setUpdatedByUserId(request.getCreatedByUserId());
    }
}

