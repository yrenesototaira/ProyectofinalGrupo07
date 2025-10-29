package com.marakosgrill.payment.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class CulqiTokenResponse {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("creation_date")
    private Long creationDate;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("card_number")
    private String cardNumber;
    
    @JsonProperty("last_four")
    private String lastFour;
    
    @JsonProperty("active")
    private Boolean active;
}