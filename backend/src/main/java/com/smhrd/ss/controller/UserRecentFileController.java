package com.smhrd.ss.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserRecentFileEntity;
import com.smhrd.ss.service.UserRecentFileService;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/recentFile")
public class UserRecentFileController {
    @Autowired
    UserRecentFileService userRecentFileService;

    @PostMapping("/save")
    public void saveRecentFile(@RequestParam String fileId, HttpSession session){
        UserEntity entity = (UserEntity)session.getAttribute("user");
        UserRecentFileEntity a = userRecentFileService.saveRecentFile(entity.getUserIdx(), fileId);
        System.out.println(a);
    }
    @PostMapping("/show")
    public UserRecentFileEntity showRecentFile(HttpSession session) {
        UserEntity entity = (UserEntity)session.getAttribute("user");
        
        
        return  userRecentFileService.recentFile(entity);
    }
    
}
