package com.marakosgrill.management.service.impl;

import com.marakosgrill.management.dto.ServiceDTO;
import com.marakosgrill.management.model.ServiceEntity;
import com.marakosgrill.management.repository.ServiceRepository;
import com.marakosgrill.management.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {
    private final ServiceRepository serviceRepository;

    @Override
    public List<ServiceDTO> findAll(String name, Boolean active) {
        return serviceRepository.findAll().stream()
                .filter(s -> (name == null || s.getName().contains(name)) && (active == null || active.equals(s.getActive())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceDTO findById(Integer id) {
        ServiceEntity service = serviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Service not found"));
        return toDTO(service);
    }

    @Override
    @Transactional
    public ServiceDTO create(ServiceDTO dto) {
        ServiceEntity service = toEntity(dto);
        service.setCreatedAt(java.time.LocalDateTime.now());
        service.setActive(true);
        return toDTO(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public ServiceDTO update(Integer id, ServiceDTO dto) {
        ServiceEntity service = serviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Service not found"));
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setUnit(dto.getUnit());
        service.setPrice(dto.getPrice());
        service.setIcon(dto.getIcon());
        service.setStatus(dto.getStatus());
        service.setUpdatedBy(dto.getUpdatedBy());
        service.setUpdatedAt(java.time.LocalDateTime.now());
        service.setActive(dto.getActive());
        return toDTO(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        ServiceEntity service = serviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Service not found"));
        service.setActive(false);
        serviceRepository.save(service);
    }

    private ServiceDTO toDTO(ServiceEntity service) {
        return ServiceDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .unit(service.getUnit())
                .price(service.getPrice())
                .icon(service.getIcon())
                .status(service.getStatus())
                .createdBy(service.getCreatedBy())
                .updatedBy(service.getUpdatedBy())
                .active(service.getActive())
                .build();
    }

    private ServiceEntity toEntity(ServiceDTO dto) {
        return ServiceEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .unit(dto.getUnit())
                .price(dto.getPrice())
                .icon(dto.getIcon())
                .status(dto.getStatus())
                .createdBy(dto.getCreatedBy())
                .updatedBy(dto.getUpdatedBy())
                .active(dto.getActive())
                .build();
    }
}
