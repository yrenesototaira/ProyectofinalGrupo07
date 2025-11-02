package com.marakosgrill.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableDTO {
    private Integer id;

    @NotBlank
    @Size(max = 20)
    private String code;

    @NotNull
    @Min(1)
    private Integer capacity;

    @Size(max = 100)
    private String location;

    @Size(max = 20)
    private String shape;

    @Size(max = 20)
    private String status;

    private Integer createdBy;

    private Integer updatedBy;

    @NotNull
    private Boolean active;
}

