package com.arbitroy.fashionFushion.Domains;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    private ObjectId paymentId;

    @DBRef // Reference to the order associated with the payment
    private Order order;

    private double amount;
    private String paymentStatus;
    private String paymentDate;


}