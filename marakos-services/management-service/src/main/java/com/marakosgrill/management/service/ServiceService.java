package com.marakosgrill.management.service;

import com.marakosgrill.management.dto.ServiceDTO;
import java.util.List;

public interface ServiceService {
    List<ServiceDTO> findAll(String name, Boolean active);
    ServiceDTO findById(Integer id);
    ServiceDTO create(ServiceDTO serviceDTO);
    ServiceDTO update(Integer id, ServiceDTO serviceDTO);
    void delete(Integer id);
}
