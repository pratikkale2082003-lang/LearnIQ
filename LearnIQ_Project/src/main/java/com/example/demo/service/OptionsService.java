package com.example.demo.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.OptionRepository;

@Service
public class OptionsService {

	@Autowired
	 private OptionRepository optionsRepo;
	
	
   
}

