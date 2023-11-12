package com.arbitroy.fashionFushion.Domains;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "messages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {

    @Id
    private ObjectId messageId;

    @DBRef // Reference to the sender of the message
    private User sender;

    @DBRef // Reference to the receiver of the message
    private User receiver;

    private String content;
    private String timestamp;

    // Constructors, getters, setters, and other methods
}
