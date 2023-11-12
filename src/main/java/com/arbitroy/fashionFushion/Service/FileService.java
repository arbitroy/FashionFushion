package com.arbitroy.fashionFushion.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arbitroy.fashionFushion.Repositories.FileRepository;



@Service
public class FileService {
    @Autowired
    private FileRepository fileRepository;
}
