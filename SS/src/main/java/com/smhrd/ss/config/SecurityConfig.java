package com.smhrd.ss.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
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
                    .baseUri("/api/auth/google")
                )
                .successHandler((request, response, authentication) -> {
                    OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
                    String email = (String) oauthUser.getAttributes().get("email");
                    String name = (String) oauthUser.getAttributes().get("name");

                    UserEntity user = userService.userInfo(email, 1);
                    if (user == null) {
                    	user = new UserEntity();
                    	user.setEmail(email);
                    	user.setName(name);
                    	user.setOAuth(1);
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