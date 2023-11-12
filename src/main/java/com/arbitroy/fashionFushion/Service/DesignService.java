package com.arbitroy.fashionFushion.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arbitroy.fashionFushion.Repositories.DesignRepository;

@Service
public class DesignService {
    @Autowired
    private DesignRepository designRepository;
    
}
