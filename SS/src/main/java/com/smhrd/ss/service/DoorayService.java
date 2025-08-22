package com.smhrd.ss.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DoorayService {

	private final String DOORAY_BASE_URL = "https://api.dooray.com"; // 민간 클라우드 기준
	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	public List<Map<String, Object>> connectDrive(String apiToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", "dooray-api " + apiToken); // API 문서 기준

			HttpEntity<String> entity = new HttpEntity<>(null, headers);
			String url = DOORAY_BASE_URL + "/drive/v1/drives?type=private";

			ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

			if (response.getStatusCode().is2xxSuccessful()) {
				ObjectMapper mapper = new ObjectMapper();
				Map<String, Object> resultMap = mapper.readValue(response.getBody(), Map.class);
				List<Map<String, Object>> drives = (List<Map<String, Object>>) resultMap.get("result");
				return drives;
			} else {
				return null;
			}

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public List<Map<String, Object>> getFullDrive(String apiToken) {
		try {
			List<Map<String, Object>> drives = getDrives(apiToken);

			for (Map<String, Object> drive : drives) {
				String driveId = (String) drive.get("id");
				List<Map<String, Object>> rootFolders = getFolders(apiToken, driveId, null);
				drive.put("folders", rootFolders);
			}
			return drives;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	// 드라이브 목록
	private List<Map<String, Object>> getDrives(String apiToken) throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives?type=private";
		Map<String, Object> response = callDoorayApi(apiToken, url);
		return (List<Map<String, Object>>) response.get("result");
	}

	// 폴더 및 하위 파일/폴더 재귀 탐색
	private List<Map<String, Object>> getFolders(String apiToken, String driveId, String parentId) throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files?type=folder"
				+ (parentId != null ? "&parentId=" + parentId : "");

		List<Map<String, Object>> folders = (List<Map<String, Object>>) callDoorayApi(apiToken, url).get("result");

		if (folders == null)
			return new ArrayList<>();

		for (Map<String, Object> folder : folders) {
			String folderId = (String) folder.get("id");

			if (Boolean.TRUE.equals(folder.get("hasFolders"))) {
				List<Map<String, Object>> subFolders = getFolders(apiToken, driveId, folderId);
				folder.put("subFolders", subFolders);
			}

			List<Map<String, Object>> files = getFiles(apiToken, driveId, folderId);
			folder.put("files", files);
		}

		return folders;
	}

	// 폴더 내 파일 조회
	private List<Map<String, Object>> getFiles(String apiToken, String driveId, String parentId) throws Exception {
		String url = DOORAY_BASE_URL + "/drive/v1/drives/" + driveId + "/files?parentId=" + parentId;
		Map<String, Object> response = callDoorayApi(apiToken, url);
		List<Map<String, Object>> files = (List<Map<String, Object>>) response.get("result");
		List<Map<String, Object>> onlyFiles = new ArrayList<>();

		if (files != null) {
			for (Map<String, Object> f : files) {
				if ("file".equals(f.get("type"))) {
					onlyFiles.add(f);
				}
			}
		}
		return onlyFiles;
	}

	// Dooray API 호출 공통
	private Map<String, Object> callDoorayApi(String apiToken, String url) throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "dooray-api " + apiToken);
		HttpEntity<String> entity = new HttpEntity<>(null, headers);

		ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
		return objectMapper.readValue(response.getBody(), Map.class);
	}
}
