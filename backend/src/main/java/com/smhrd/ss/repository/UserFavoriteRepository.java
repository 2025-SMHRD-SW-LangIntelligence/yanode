package com.smhrd.ss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.ss.entity.UserFavoriteEntity;

public interface UserFavoriteRepository extends JpaRepository<UserFavoriteEntity, Long>{
    List<UserFavoriteEntity> findAllByUserIdx(Long userIdx);
    UserFavoriteEntity findByUserIdxAndFavUrl(Long userIdx, String recentFile);
	Boolean existsByUserIdxAndFavUrl(Long userIdx, String favUrl);
} 
