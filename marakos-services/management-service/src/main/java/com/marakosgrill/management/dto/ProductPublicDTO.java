package com.marakosgrill.management.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPublicDTO {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String pictureUrl;
    private String status;
    private Boolean active;
    private CategoryInfo category;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryInfo {
        private Integer id;
        private String name;
        private String description;
    }
}

