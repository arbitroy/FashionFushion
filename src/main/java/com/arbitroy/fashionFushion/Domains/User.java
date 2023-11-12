package com.arbitroy.fashionFushion.Domains;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private ObjectId userId;
    private String username;
    private String password;
    private String email;
    private UserType userType;
    private double ratings;
    private String profilePicture;
    private String contactInformation;
    
}
