package com.smhrd.ss.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.entity.UserRecentFileEntity;
import com.smhrd.ss.service.UserRecentFileService;

import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("/recentFile")
public class UserRecentFileController {
    @Autowired
    UserRecentFileService userRecentFileService;

    @PostMapping("/save")
    public void saveRecentFile(@RequestParam("fileId") String fileId, HttpSession session){
        UserEntity entity = (UserEntity)session.getAttribute("user");
        userRecentFileService.saveRecentFile(entity.getUserIdx(), fileId);
    }
    @PostMapping("/show")
    public ResponseEntity<?> showRecentFile(HttpSession session) {
        UserEntity entity = (UserEntity)session.getAttribute("user");
        List<UserRecentFileEntity> userRecentFile = userRecentFileService.recentFile(entity);
        Collections.reverse(userRecentFile);
        return ResponseEntity.ok(userRecentFile);
    }
    
}
