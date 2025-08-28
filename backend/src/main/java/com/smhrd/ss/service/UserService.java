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
		return userRepository.existsByEmailAndOAuth(entity.getEmail(), entity.getOAuth());
	}
	
	public UserEntity userInfo(UserEntity entity) {
		return userRepository.findByEmailAndOAuth(entity.getEmail(), entity.getOAuth());
	}
	public UserEntity userInfo(String email, Integer i) {
		return userRepository.findByEmailAndOAuth(email, i);
	}
	
	public String register(UserEntity entity) {
		if (userRepository.existsByEmailAndOAuth(entity.getEmail(), entity.getOAuth())) {
			return "fail";
		}
		userRepository.save(entity);
		return "success";
	}
	
	public UserEntity login(UserEntity entity) {		
		return userRepository.findAllByEmailAndPassword(entity.getEmail(), entity.getPassword());
	}

	public UserEntity save(UserEntity entity) {
	    return userRepository.save(entity);
	}
	
	public void delete(UserEntity entity) {
		userRepository.delete(entity);
	}

	
}
