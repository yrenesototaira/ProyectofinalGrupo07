package com.marakosgrill.customer.service;

import com.marakosgrill.customer.dto.CustomerRequest;
import com.marakosgrill.customer.dto.CustomerResponse;
import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerRequest requestDTO);
    CustomerResponse updateCustomer(Long id, CustomerRequest requestDTO);
    void deleteCustomer(Long id);
    CustomerResponse getCustomerById(Long id);
    List<CustomerResponse> getAllCustomers(String status, String name, String lastName);
}

