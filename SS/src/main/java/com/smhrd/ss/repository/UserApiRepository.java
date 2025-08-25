package com.smhrd.ss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.ss.entity.UserApiEntity;

public interface UserApiRepository extends JpaRepository<UserApiEntity, Long> {
	List<UserApiEntity> findAllByUserIdx(Long userIdx);

	Optional<UserApiEntity> findByApiIdx(Long apiIdx);

	List<UserApiEntity> findAllByUserIdxAndIsConnected(Long userIdx, Boolean bool);

	Optional<UserApiEntity> findByUserIdxAndApiURL(Long userIdx, String apiURL);
}