package com.arbitroy.fashionFushion.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arbitroy.fashionFushion.Repositories.MessageRepository;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
}
