package com.smhrd.ss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.ss.entity.UserApiEntity;
import com.smhrd.ss.entity.UserEntity;

public interface UserApiRepository extends JpaRepository<UserApiEntity, Long> {
	List<UserApiEntity> findAllByUserIdx(UserEntity user);

	Optional<UserApiEntity> findByApiIdx(Long apiIdx);

	List<UserApiEntity> findAllByUserIdxAndIsConnected(UserEntity user, Boolean bool);

	Optional<UserApiEntity> findByApiURLAndUserIdx(String apiToken, UserEntity user);
}