package com.smhrd.ss.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.ss.entity.UserFavoriteEntity;
import com.smhrd.ss.repository.UserFavorateRepository;

@Service
public class UserFavoriteService {
    @Autowired
    UserFavorateRepository userFavorateRepository;
    
    public UserFavoriteEntity saveUserFav(Long userIdx, String favUrl){
        UserFavoriteEntity entity = new UserFavoriteEntity();
        return userFavorateRepository.save(entity);
    }

    public void showUserFav(){
        
    }

}
