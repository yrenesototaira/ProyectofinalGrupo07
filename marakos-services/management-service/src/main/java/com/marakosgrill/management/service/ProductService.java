package com.marakosgrill.management.service;

import com.marakosgrill.management.dto.ProductDTO;
import com.marakosgrill.management.dto.ProductPublicDTO;
import java.util.List;

public interface ProductService {
    List<ProductDTO> findAll(String name, Integer categoryId, Boolean active);
    ProductDTO findById(Integer id);
    ProductDTO create(ProductDTO productDTO);
    ProductDTO update(Integer id, ProductDTO productDTO);
    void delete(Integer id);
    List<ProductPublicDTO> findAllPublic();
}
