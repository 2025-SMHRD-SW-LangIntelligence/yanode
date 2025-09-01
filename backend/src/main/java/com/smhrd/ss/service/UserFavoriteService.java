package com.smhrd.ss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserFavoriteEntity;
import com.smhrd.ss.repository.UserFavoriteRepository;

@Service
public class UserFavoriteService {
    @Autowired
    UserFavoriteRepository userFavoriteRepository;
    
    public UserFavoriteEntity onUserFav(Long userIdx, String favUrl){
        UserFavoriteEntity entity = new UserFavoriteEntity();
        
        UserFavoriteEntity exist = userFavoriteRepository.findByUserIdxAndFavUrl(userIdx, favUrl);
        if(exist != null) {
        	userFavoriteRepository.delete(exist);
        }
        entity.setUserIdx(userIdx);
        entity.setFavUrl(favUrl);
        
        return userFavoriteRepository.save(entity);
    }

    public void offUserFav(Long userIdx, String favUrl){
    	UserFavoriteEntity exist = userFavoriteRepository.findByUserIdxAndFavUrl(userIdx, favUrl);
        if(exist != null) {
        	userFavoriteRepository.delete(exist);
        }
    }
    
    public List<UserFavoriteEntity> showUserFav(UserEntity entity){
    	return userFavoriteRepository.findAllByUserIdx(entity.getUserIdx());
    }
    
    public Boolean existUserFav(UserEntity entity, String favUrl) {
    	return userFavoriteRepository.existsByUserIdxAndFavUrl(entity.getUserIdx(), favUrl);
    }

}
