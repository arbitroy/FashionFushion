package com.arbitroy.fashionFushion.Repositories;


import com.arbitroy.fashionFushion.Domains.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {

}
