package com.smhrd.ss.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserFavoriteEntity;
import com.smhrd.ss.service.UserFavoriteService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/fav")
public class UserFavoriteController {
    @Autowired
    UserFavoriteService userFavorateService;

    @PostMapping("/save")
    public void saveFav(HttpSession session, @RequestParam String favUrl) {
        UserEntity entity = (UserEntity)session.getAttribute("user");
        UserFavoriteEntity a = userFavorateService.saveUserFav(entity.getUserIdx(), favUrl);
        System.out.println(a);
    }
    
}
