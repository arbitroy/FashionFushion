package com.arbitroy.fashionFushion.Domains;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    @Id
    private ObjectId orderId;

    @DBRef // Reference to the tailor who placed the order
    private User tailor;

    @DBRef // Reference to the design associated with the order
    private Design design;

    private String orderStatus;
    private String deliveryDate;
    private String fabricChoice;
    private String measurements;
}
