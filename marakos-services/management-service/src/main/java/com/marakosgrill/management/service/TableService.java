package com.marakosgrill.management.service;

import java.util.List;
import com.marakosgrill.management.dto.TableDTO;

public interface TableService {
    List<TableDTO> findAll(String status, Boolean active);
    TableDTO findById(Integer id);
    TableDTO create(TableDTO tableDTO);
    TableDTO update(Integer id, TableDTO tableDTO);
    void delete(Integer id);
}


