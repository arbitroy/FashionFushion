package com.arbitroy.fashionFushion.Repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.arbitroy.fashionFushion.Domains.File;

@Repository
public interface FileRepository extends MongoRepository<File, ObjectId> {
}
