package com.marakosgrill.management.service;

import com.marakosgrill.management.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> findAll(String name, Boolean active);
    CategoryDTO findById(Integer id);
    CategoryDTO create(CategoryDTO categoryDTO);
    CategoryDTO update(Integer id, CategoryDTO categoryDTO);
    void delete(Integer id);
}

