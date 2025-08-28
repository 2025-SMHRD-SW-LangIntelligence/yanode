package com.smhrd.ss.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.ss.entity.UserFavoriteEntity;

public interface UserFavorateRepository extends JpaRepository<UserFavoriteEntity, Long>{
    UserFavoriteEntity findAllByUserIdx(Long userIdx);
    
} 
