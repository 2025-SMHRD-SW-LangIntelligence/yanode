package com.smhrd.ss.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.repository.UserRepository;

@Service
public class UserService {
	@Autowired
	UserRepository userRepository;
	
	public Boolean check(UserEntity entity) {
		return userRepository.existsByEmail(entity.getEmail());
	}
	
	public String register(UserEntity entity) {
		if (userRepository.existsByEmail(entity.getEmail())) {
			return "fail";
		}
		UserEntity e = userRepository.save(entity);
		if (e != null) {
			return "success";
		} else {
			return "fail";
		}
	}
	
	public UserEntity login(UserEntity entity) {		
		return userRepository.findAllByEmailAndPassword(entity.getEmail(), entity.getPassword());
	}
}
