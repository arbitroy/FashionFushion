package com.arbitroy.fashionFushion.Domains;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "files")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class File {

    @Id
    private ObjectId fileId;

    @DBRef // Reference to the design associated with the file
    private Design design;

    @DBRef // Reference to the order associated with the file
    private Order order;

    private String fileType;
    private String fileURL;

    // Constructors, getters, setters, and other methods
}