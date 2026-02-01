package com.smhrd.ss.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
				.allowedOriginPatterns("*") //이거때문에 안될 수도 있음
				.allowedHeaders("*")
                .allowedMethods("*")
				.allowCredentials(true);
	}

	
}
