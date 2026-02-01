package com.smhrd.ss.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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

	private final RestTemplate restTemplate = new RestTemplate();

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
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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

	@GetMapping("/downloadFile")
	public ResponseEntity<?> downloadFile(@RequestParam String fileId, @RequestParam Long apiIdx, HttpSession session) {
		try {
			UserEntity user = (UserEntity) session.getAttribute("user");
			if (user == null)
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");

			Optional<UserApiEntity> apiOpt = userApiService.getApiToken(apiIdx);
			if (!apiOpt.isPresent())
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("API 정보 없음");

			UserApiEntity api = apiOpt.get();
			String apiToken = api.getApiURL();

			// 1️⃣ 파일 메타 가져오기
			Map<String, Object> meta = doorayService.getFileMeta(apiToken, fileId);
			String driveId = (String) meta.get("driveId");
			String fileName = (String) meta.get("name");

			// 2️⃣ 파일 다운로드
			byte[] fileBytes = doorayService.downloadRawFile(apiToken, driveId, fileId);

			return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
					.body(fileBytes);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 다운로드 실패");
		}
	}

	public static class MultipartInputStreamFileResource extends InputStreamResource {
        private final String filename;
        private final long contentLength;

        public MultipartInputStreamFileResource(InputStream inputStream, String filename, long contentLength) {
            super(inputStream);
            this.filename = filename;
            this.contentLength = contentLength;
        }

        @Override
        public String getFilename() {
            return this.filename;
        }

        @Override
        public long contentLength() throws IOException {
            return this.contentLength;
        }
    }

	@PostMapping("/uploadFile")
	public ResponseEntity<?> uploadFile(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam("driveId") String driveId,
	        @RequestParam(value = "parentId", required = false) String parentId,
	        @RequestParam("apiURL") String apiURL) {

	    try {
	        String serviceUrl = "https://api.dooray.com/drive/v1/drives/" + driveId + "/files";
	        if (parentId != null && !parentId.isEmpty()) serviceUrl += "?parentId=" + parentId;

	        HttpHeaders headers = new HttpHeaders();
	        headers.set("Authorization", "dooray-api " + apiURL);
	        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

	        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
	        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
	            @Override
	            public String getFilename() {
	                return file.getOriginalFilename();
	            }
	        };
	        body.add("file", resource);

	        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

	        ResponseEntity<String> resp = restTemplate.exchange(serviceUrl, HttpMethod.POST, requestEntity, String.class);

	        if (resp.getStatusCode() == HttpStatus.TEMPORARY_REDIRECT || resp.getStatusCode() == HttpStatus.MOVED_PERMANENTLY) {
	            String location = resp.getHeaders().getLocation().toString();
	            ResponseEntity<Map> finalResp = restTemplate.exchange(location, HttpMethod.POST, requestEntity, Map.class);
	            return ResponseEntity.ok(finalResp.getBody());
	        }

	        return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 실패: " + e.getMessage());
	    }
	}
}
