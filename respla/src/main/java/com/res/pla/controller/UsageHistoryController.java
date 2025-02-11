package com.res.pla.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.res.pla.domain.UsageHistoryDTO;
import com.res.pla.domain.UserDTO;
import com.res.pla.service.UsageHistoryService;
import com.res.pla.service.UserService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/usage")
@AllArgsConstructor
@Log4j2
public class UsageHistoryController {

	UsageHistoryService uhservice;
	UserService userservice;

	@PostMapping(value = "/userHistoryList")
	public ResponseEntity<?> selectAllHistoryById(@RequestBody Map<String, String> idData) {
		String id = idData.get("id");

		List<UsageHistoryDTO> uhList = uhservice.selectAllHistoryById(id);
		//		log.info(uhList);

		return ResponseEntity.ok().body(uhList);
	}

	@PostMapping(value = "/userHistoryById")
	public ResponseEntity<?> userHistoryById(@RequestBody Map<String, String> idData) {
		String id = idData.get("id");

		UserDTO user = userservice.selectUser(id);

		if (user != null) {
			List<UsageHistoryDTO> uhList = uhservice.selectAllHistoryById(id);

			return ResponseEntity.ok().body(uhList);
		} else {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).body("no info this user");
		}

	}

}
