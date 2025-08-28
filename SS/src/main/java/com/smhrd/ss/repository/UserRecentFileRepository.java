package com.smhrd.ss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.ss.entity.UserRecentFileEntity;

@Repository
public interface UserRecentFileRepository extends JpaRepository<UserRecentFileEntity, Long>{

    UserRecentFileEntity findByUserIdx(Long userIdx);
    UserRecentFileEntity findByUserIdxAndRecentFile(Long userIdx, String recentFile);
    Long countByUserIdx(Long userIdx);

    List<UserRecentFileEntity> findAllByUserIdx(Long userIdx);
}