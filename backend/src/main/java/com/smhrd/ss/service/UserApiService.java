package com.smhrd.ss.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

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

    public UserApiEntity saveUserApi(UserEntity user, String title, String url) {
        UserApiEntity api = new UserApiEntity();
        Timestamp now = new Timestamp(System.currentTimeMillis());
        api.setUserIdx(user);
        api.setApiTitle(title);
        api.setApiURL(url);
        api.setCreatedDate(now);
        
        return userApiRepository.save(api);
    }
    
    public List<UserApiEntity> getApisByUser(UserEntity user) {
        return userApiRepository.findAllByUserIdx(user);
    }
    public Optional<UserApiEntity> getApiToken(Long apiIdx) {
    	return userApiRepository.findByApiIdx(apiIdx);
    }
    
    public List<UserApiEntity> getApisIsConnected(UserEntity user, Boolean bool){
    	return userApiRepository.findAllByUserIdxAndIsConnected(user, bool);
    }

	@Transactional
	public boolean delete(Long apiIdx) {
		return userApiRepository.findByApiIdx(apiIdx)
                .map(api -> {
                    userApiRepository.delete(api);
                    return true;
                })
                .orElse(false);
	}
	
	@Transactional
    public void connectApi(Long apiIdx) {
        UserApiEntity api = userApiRepository.findByApiIdx(apiIdx)
            .orElseThrow(() -> new RuntimeException("API 키 없음"));
        Timestamp now = new Timestamp(System.currentTimeMillis());
        api.setIsConnected(true);
        api.setLastUsed(now);
        userApiRepository.save(api);
    }
	
	@Transactional
    public Boolean disConnectApi(Long apiIdx) {
        UserApiEntity api = userApiRepository.findByApiIdx(apiIdx)
            .orElseThrow(() -> new RuntimeException("API 키 없음"));
        api.setIsConnected(false);
        userApiRepository.save(api);
        
        return true;
    }
}