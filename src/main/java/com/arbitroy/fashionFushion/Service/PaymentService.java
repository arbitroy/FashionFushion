package com.arbitroy.fashionFushion.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arbitroy.fashionFushion.Repositories.PayementRepository;

@Service
public class PaymentService {
    @Autowired
    private PayementRepository payementRepository;
}
