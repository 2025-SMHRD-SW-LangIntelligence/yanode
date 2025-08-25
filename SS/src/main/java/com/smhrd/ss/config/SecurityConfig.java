package com.smhrd.ss.config;

import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.service.UserService;

@Configuration
public class SecurityConfig {

    private final UserService userService;

    public SecurityConfig(UserService userService) {
        this.userService = userService; // 생성자 주입
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/api/auth/oauth2/*")
                )
                .successHandler((request, response, authentication) -> {
                    OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
                    
                    String registrationId = null;
                    if (authentication instanceof OAuth2AuthenticationToken) {
                        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                        registrationId = oauthToken.getAuthorizedClientRegistrationId();
                    }
                    
                    String email = null;
                    String name = null;
                    int oauthType = 0;
                    
                    if ("google".equals(registrationId)) {
                        email = (String) oauthUser.getAttributes().get("email");
                        name = (String) oauthUser.getAttributes().get("name");
                        oauthType = 1;
                    } else if ("kakao".equals(registrationId)) {
                        Map<String, Object> kakaoAccount = (Map<String, Object>) oauthUser.getAttributes().get("kakao_account");
                        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

                        email = (String) kakaoAccount.get("email");
                        name = (String) profile.get("nickname");
                        oauthType = 2;
                    }
                    

                    UserEntity user = userService.userInfo(email, oauthType);
                    if (user == null) {
                        user = new UserEntity();
                        user.setEmail(email);                        	
                        user.setName(name);
                        user.setOAuth(oauthType);
                        userService.register(user);
                        user = userService.userInfo(user);
                    }

                    request.getSession().setAttribute("user", user); // 세션에 저장
                    response.sendRedirect("http://localhost:5173/"); // React 홈으로
                })
            );

        return http.build();
    }
}
