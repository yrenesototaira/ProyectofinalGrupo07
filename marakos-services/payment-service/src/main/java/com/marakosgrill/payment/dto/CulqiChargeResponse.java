package com.marakosgrill.payment.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class CulqiChargeResponse {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("amount")
    private Integer amount;
    
    @JsonProperty("currency_code")
    private String currencyCode;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("order_id")
    private String orderId;
    
    @JsonProperty("state")
    private String state; // "successful", "failed", etc.
    
    @JsonProperty("creation_date")
    private Long creationDate;
    
    @JsonProperty("reference_code")
    private String referenceCode;
    
    @JsonProperty("source")
    private Source source;
    
    @Data
    public static class Source {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("card_number")
        private String cardNumber;
        
        @JsonProperty("last_four")
        private String lastFour;
    }
}