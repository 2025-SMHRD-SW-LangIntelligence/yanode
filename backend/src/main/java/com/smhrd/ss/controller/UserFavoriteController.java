package com.smhrd.ss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserFavoriteEntity;
import com.smhrd.ss.service.UserFavoriteService;

import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/fav")
public class UserFavoriteController {
    @Autowired
    UserFavoriteService userFavoriteService;

    @PostMapping("/on")
    public List<UserFavoriteEntity> onFav(HttpSession session, @RequestParam String favUrl) {
        UserEntity entity = (UserEntity)session.getAttribute("user");
        userFavoriteService.onUserFav(entity.getUserIdx(), favUrl);
        return userFavoriteService.showUserFav(entity);
    }
    
    @PostMapping("/off")
    public List<UserFavoriteEntity> offFav(HttpSession session, @RequestParam String favUrl) {
        UserEntity entity = (UserEntity)session.getAttribute("user");
        userFavoriteService.offUserFav(entity.getUserIdx(), favUrl);
        return userFavoriteService.showUserFav(entity);
    }
    
    @PostMapping("list")
    public List<UserFavoriteEntity> listFav(HttpSession session) {
    	UserEntity entity = (UserEntity) session.getAttribute("user");
    	return userFavoriteService.showUserFav(entity);
    }
    
    @PostMapping("exist")
    public Boolean existFav(@RequestParam String favUrl, HttpSession session) {
    	UserEntity entity = (UserEntity) session.getAttribute("user");
    	return userFavoriteService.existUserFav(entity, favUrl);
    }
}
