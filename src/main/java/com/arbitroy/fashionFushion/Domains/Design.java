package com.arbitroy.fashionFushion.Domains;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "design")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Design {
    @Id
    private ObjectId designId;

    @DBRef // Reference to the user who created the design
    private User designer;

    private List<String> designImages; // Assuming a list of image URLs
    private String description;
    private String dateCreated; // You might want to use Java's LocalDate for a date
    private String style;
    private List<String> fabricPreferences; // Assuming a list of fabric preferences
}
