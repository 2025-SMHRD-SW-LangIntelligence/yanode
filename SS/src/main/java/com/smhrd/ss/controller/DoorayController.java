package com.smhrd.ss.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.smhrd.ss.config.SecurityConfig;
import com.smhrd.ss.entity.UserApiEntity;
import com.smhrd.ss.entity.UserEntity;
import com.smhrd.ss.service.DoorayService;
import com.smhrd.ss.service.UserApiService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/dooray")
public class DoorayController {

    private final SecurityConfig securityConfig;

	@Autowired
	private DoorayService doorayService;

	@Autowired
	private UserApiService userApiService;

    DoorayController(SecurityConfig securityConfig) {
        this.securityConfig = securityConfig;
    }

	@GetMapping("/driveConnect")
	public ResponseEntity<?> driveConnect(@RequestParam("apiIdx") Long apiIdx, HttpSession session) {
		UserEntity user = (UserEntity) session.getAttribute("user");
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
		}
		
		Optional<UserApiEntity> api = userApiService.getApiToken(apiIdx);
		String apiToken = api.get().getApiURL();
		List<Map<String, Object>> drives = doorayService.getFullDrive(apiToken);

		if (drives != null) {
			userApiService.connectApi(apiIdx);
			return ResponseEntity.ok(drives);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Dooray API 연결 실패");
		}
	}

	@GetMapping("/driveDisconnect")
	public Boolean driveDisconnect(@RequestParam("apiIdx") Long apiIdx, HttpSession session) {
		UserEntity user = (UserEntity) session.getAttribute("user");
		if (user == null) {
			return false;
		}
		Boolean result = userApiService.disConnectApi(apiIdx);

		return result;
	}
	
	@PostMapping("/apiLoading")
	public ResponseEntity<?> apiLoading(HttpSession session) {
		UserEntity user = (UserEntity) session.getAttribute("user");
		List<UserApiEntity> list = userApiService.getApisIsConnected(user, true);
		if (list != null) {
			return ResponseEntity.ok(list);	
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.build();
		}
	}
	
	@PostMapping("/driveLoading")
	public ResponseEntity<?> driveLoading(HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        List<UserApiEntity> apis = userApiService.getApisIsConnected(user, true);

        if (apis == null || apis.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("연결된 API 없음");
        }

        List<Map<String, Object>> allDrives = new ArrayList<>();

        for (UserApiEntity api : apis) {
            try {
                List<Map<String, Object>> fullDrive = doorayService.getFullDrive(api.getApiURL());
                if (fullDrive != null) {
                    // API 정보도 함께 넣어주면 프론트에서 구분 가능
                    Map<String, Object> apiDriveInfo = new HashMap<>();
                    apiDriveInfo.put("apiTitle", api.getApiTitle()); // 예: "Dooray", "Notion" 등
                    apiDriveInfo.put("apiIdx", api.getApiIdx());
                    apiDriveInfo.put("apiURL", api.getApiURL());
                    apiDriveInfo.put("drives", fullDrive);

                    allDrives.add(apiDriveInfo);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok(allDrives);
    }
	
	@PostMapping("userId")
	public String getUser(@RequestParam String userId, HttpSession session) throws Exception {
		UserEntity user = (UserEntity) session.getAttribute("user");
		List<UserApiEntity> apis = userApiService.getApisIsConnected(user, true);
		if (user == null) {
			return "-";
		}
		String member = doorayService.getUser(apis.get(0).getApiURL(), userId);
		return member;
		
	}
}
