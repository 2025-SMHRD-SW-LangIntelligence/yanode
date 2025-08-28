package com.smhrd.ss.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserRecentFileEntity;
import com.smhrd.ss.repository.UserRecentFileRepository;

@Service
public class UserRecentFileService {
	@Autowired
	UserRecentFileRepository userRecentFileRepository;


	public UserRecentFileEntity saveRecentFile(Long userIdx, String recentFile){
		UserRecentFileEntity entity = new UserRecentFileEntity();
		
		UserRecentFileEntity exist =  userRecentFileRepository.findByUserIdxAndRecentFile(userIdx, recentFile);
		Long count = userRecentFileRepository.countByUserIdx(userIdx);


		if(exist!=null){
			userRecentFileRepository.delete(exist);

		}
		if(count>=10){
			UserRecentFileEntity rmRecentFile = userRecentFileRepository.findAllByUserIdx(userIdx).get(0);
			userRecentFileRepository.delete(rmRecentFile);
		}
		entity.setUserIdx(userIdx);
		entity.setRecentFile(recentFile);

		return userRecentFileRepository.save(entity);
	}

	public UserRecentFileEntity recentFile(UserEntity entity){
		
		return userRecentFileRepository.findByUserIdx(entity.getUserIdx());
	}

}
