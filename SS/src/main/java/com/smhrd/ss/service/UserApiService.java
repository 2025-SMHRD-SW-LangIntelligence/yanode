package com.smhrd.ss.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.ss.entity.UserApiEntity;
import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.repository.UserApiRepository;

import jakarta.transaction.Transactional;

@Service
public class UserApiService {

    @Autowired
    private UserApiRepository userApiRepository;

    public UserApiEntity saveUserApi(Long userIdx, String title, String url) {
        UserApiEntity api = new UserApiEntity();
        Timestamp now = new Timestamp(System.currentTimeMillis());
        api.setUserIdx(userIdx);
        api.setApiTitle(title);
        api.setApiURL(url);
        api.setCreatedDate(now);

        return userApiRepository.save(api);
    }
    
    public List<UserApiEntity> getApisByUser(Long userIdx) {
        return userApiRepository.findAllByUserIdx(userIdx);
    }
    
    public List<UserApiEntity> getApisIsConnected(Long userIdx, Boolean bool){
    	return userApiRepository.findAllByUserIdxAndIsConnected(userIdx, bool);
    }

	@Transactional
	public boolean delete(String apiURL, Long userIdx) {
		return userApiRepository.findByUserIdxAndApiURL(userIdx, apiURL)
                .map(api -> {
                    userApiRepository.delete(api);
                    return true;
                })
                .orElse(false);
	}
	
	@Transactional
    public void connectApi(String apiURL, Long userIdx) {
        UserApiEntity api = userApiRepository.findByUserIdxAndApiURL(userIdx, apiURL)
            .orElseThrow(() -> new RuntimeException("API 키 없음"));
        api.setIsConnected(true);
        userApiRepository.save(api);
    }
	
	@Transactional
    public Boolean disConnectApi(String apiURL, Long userIdx) {
        UserApiEntity api = userApiRepository.findByUserIdxAndApiURL(userIdx, apiURL)
            .orElseThrow(() -> new RuntimeException("API 키 없음"));
        api.setIsConnected(false);
        userApiRepository.save(api);
        
        return true;
    }
}