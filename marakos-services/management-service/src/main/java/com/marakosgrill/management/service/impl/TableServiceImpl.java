package com.marakosgrill.management.service.impl;

import com.marakosgrill.management.dto.TableDTO;
import com.marakosgrill.management.model.TableEntity;
import com.marakosgrill.management.repository.TableRepository;
import com.marakosgrill.management.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {
    private final TableRepository tableRepository;

    @Override
    public List<TableDTO> findAll(String status, Boolean active) {
        return tableRepository.findAll().stream()
                .filter(t -> (status == null || status.equals(t.getStatus())) && (active == null || active.equals(t.getActive())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TableDTO findById(Integer id) {
        TableEntity table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Table not found"));
        return toDTO(table);
    }

    @Override
    @Transactional
    public TableDTO create(TableDTO dto) {
        TableEntity table = toEntity(dto);
        table.setCreatedAt(java.time.LocalDateTime.now());
        table.setActive(true);
        return toDTO(tableRepository.save(table));
    }

    @Override
    @Transactional
    public TableDTO update(Integer id, TableDTO dto) {
        TableEntity table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Table not found"));
        table.setCode(dto.getCode());
        table.setCapacity(dto.getCapacity());
        table.setLocation(dto.getLocation());
        table.setShape(dto.getShape());
        table.setStatus(dto.getStatus());
        table.setUpdatedBy(dto.getUpdatedBy());
        table.setUpdatedAt(java.time.LocalDateTime.now());
        table.setActive(dto.getActive());
        return toDTO(tableRepository.save(table));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        TableEntity table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Table not found"));
        table.setActive(false);
        tableRepository.save(table);
    }

    private TableDTO toDTO(TableEntity table) {
        return TableDTO.builder()
                .id(table.getId())
                .code(table.getCode())
                .capacity(table.getCapacity())
                .location(table.getLocation())
                .shape(table.getShape())
                .status(table.getStatus())
                .createdBy(table.getCreatedBy())
                .updatedBy(table.getUpdatedBy())
                .active(table.getActive())
                .build();
    }

    private TableEntity toEntity(TableDTO dto) {
        return TableEntity.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .shape(dto.getShape())
                .status(dto.getStatus())
                .createdBy(dto.getCreatedBy())
                .updatedBy(dto.getUpdatedBy())
                .active(dto.getActive())
                .build();
    }
}

