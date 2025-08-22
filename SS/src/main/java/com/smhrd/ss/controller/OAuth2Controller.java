package com.smhrd.ss.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
public class OAuth2Controller {

    @GetMapping("/oauth2/success")
    public String success(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        session.setAttribute("user", principal.getAttributes());
        return "로그인 성공!";
    }
}
