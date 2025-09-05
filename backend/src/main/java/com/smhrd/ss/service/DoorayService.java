package com.smhrd.ss.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.ss.resource.MultipartInputStreamFileResource;

@Service
public class DoorayService {

	// 민간 클라우드 기준 Dooray API Base URL
	private final String DOORAY_BASE_URL = "https://api.dooray.com";

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	/**
	 * 드라이브 연결 (API Key 인증 후 드라이브 목록 반환)
	 */
	public List<Map<String, Object>> connectDrive(String apiToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", "dooray-api " + apiToken);

			HttpEntity<String> entity = new HttpEntity<>(null, headers);
			String url = DOORAY_BASE_URL + "/drive/v1/drives?type=private";

			ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

			if (response.getStatusCode().is2xxSuccessful()) {
				Map<String, Object> resultMap = objectMapper.readValue(response.getBody(), Map.class);
				return (List<Map<String, Object>>) resultMap.get("result");
			} else {
				return null;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * 전체 드라이브 (폴더 + 파일 포함) 조회
	 */
	public List<Map<String, Object>> getFullDrive(String apiToken) {
		try {
			List<Map<String, Object>> drives = getDrives(apiToken);

			for (Map<String, Object> drive : drives) {
				String driveId = (String) drive.get("id");
				drive.put("uniqueKey", "drive-" + driveId);

				List<Map<String, Object>> allFolders = (List<Map<String, Object>>) callDoorayApi(apiToken,
						DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files?type=folder").get("result");

				if (allFolders != null) {
					for (Map<String, Object> folder : allFolders) {
						if ("root".equals(folder.get("subType"))) {
							String rootId = (String) folder.get("id");

							// root 폴더 구조 생성
							Map<String, Object> root = new java.util.HashMap<>();
							root.put("id", rootId);
							root.put("name", drive.get("apiTitle")); // root 이름은 apiTitle
							root.put("folders", getFolders(apiToken, driveId, rootId, new HashSet<>()));
							root.put("files", getFiles(apiToken, driveId, rootId));

							drive.put("root", root);
							break;
						}
					}
				}
			}

			return drives;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * 드라이브 목록 조회
	 */
	private List<Map<String, Object>> getDrives(String apiToken) throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives?type=private";
		Map<String, Object> response = callDoorayApi(apiToken, url);
		return (List<Map<String, Object>>) response.get("result");
	}

	/**
	 * 폴더 및 하위 파일/폴더 재귀 탐색
	 */
	private List<Map<String, Object>> getFolders(String apiToken, String driveId, String parentId, Set<String> visited)
			throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files?type=folder&parentId=" + parentId;

		List<Map<String, Object>> folders = (List<Map<String, Object>>) callDoorayApi(apiToken, url).get("result");

		if (folders == null)
			return new ArrayList<>();

		for (Map<String, Object> folder : folders) {
			String folderId = (String) folder.get("id");

			if (visited.contains(folderId))
				continue;
			visited.add(folderId);

			// 📌 하위 폴더 재귀 탐색
			List<Map<String, Object>> subFolders = getFolders(apiToken, driveId, folderId, visited);
			folder.put("subFolders", subFolders);

			// 📌 해당 폴더 내 파일
			folder.put("files", getFiles(apiToken, driveId, folderId));
		}

		return folders;
	}

	/**
	 * 특정 폴더 내 파일 조회
	 */
	private List<Map<String, Object>> getFiles(String apiToken, String driveId, String parentId) throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files?parentId=" + parentId + "&size=100&page=0";
		Map<String, Object> response = callDoorayApi(apiToken, url);

		List<Map<String, Object>> files = (List<Map<String, Object>>) response.get("result");
		List<Map<String, Object>> onlyFiles = new ArrayList<>();

		if (files != null) {
			for (Map<String, Object> f : files) {
				if ("file".equals(f.get("type"))) {
					String fileId = (String) f.get("id");
					f.put("uniqueKey", "drive-" + driveId + "-file-" + fileId);
					onlyFiles.add(f);
				}
			}
		}
		return onlyFiles;
	}

	/**
	 * Dooray API 호출 공통 메서드
	 */
	private Map<String, Object> callDoorayApi(String apiToken, String url) throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "dooray-api " + apiToken);

		HttpEntity<String> entity = new HttpEntity<>(null, headers);
		ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

		return objectMapper.readValue(response.getBody(), Map.class);
	}

	public String getUser(String apiToken, String userId) throws Exception{
		String url = DOORAY_BASE_URL + "/common/v1/members/" + userId;
		Map<String, Object> response = callDoorayApi(apiToken, url);

		Map<String, Object> member = (Map<String, Object>) response.get("result");
		if (member != null) {
			String memberName = (String) member.get("name");
			return memberName;
		}
		return "-";
	}
	
	public Map<String, Object> getFileMeta(String apiToken, String fileId) throws Exception {
        String url = DOORAY_BASE_URL + "/drive/v1/files/" + fileId + "?media=meta";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "dooray-api " + apiToken);
        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> map = mapper.readValue(res.getBody(), Map.class);

        if ((Boolean)((Map<String, Object>)map.get("header")).get("isSuccessful")) {
            return (Map<String, Object>) map.get("result");
        } else {
            throw new Exception("메타 정보 가져오기 실패");
        }
    }

    // 파일 다운로드
    public byte[] downloadRawFile(String apiToken, String driveId, String fileId) throws Exception {
        String url = DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files/" + fileId + "?media=raw";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "dooray-api " + apiToken);
        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        ResponseEntity<byte[]> res = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
        if (res.getStatusCode().is2xxSuccessful()) {
            return res.getBody();
        } else {
            throw new Exception("파일 다운로드 실패");
        }
    }
}
