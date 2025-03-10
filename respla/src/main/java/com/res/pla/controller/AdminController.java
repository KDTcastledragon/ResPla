package com.res.pla.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.res.pla.domain.AdminDTO;
import com.res.pla.service.AdminService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@Log4j2
public class AdminController {
	AdminService admservice;
	PasswordEncoder encoder;

	//====[로그인]============================================================================
	@PostMapping("/adminLogin")
	public ResponseEntity<?> login(@RequestBody AdminDTO data) {
		log.info("");

		String id = data.getId();
		String password = data.getPassword();

		AdminDTO dto = admservice.selectAdmin(id);

		if (dto != null) {
			Map<String, Object> adminData = new HashMap<>();

			adminData.put("admin_name", dto.getAdmin_name());
			adminData.put("authority", dto.getAuthority());
			//			adminData.put("admcode", "s9811");
			adminData.put("admcode", "s9811");

			return ResponseEntity.ok().body(adminData);
		} else {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
		}
	}
	//
	//	@PostMapping("/adminLogin")
	//	public ResponseEntity<?> login(@RequestBody AdminDTO data) {
	//		log.info("");
	//
	//		String id = data.getId();
	//		String password = data.getPassword();
	//
	//		AdminDTO dto = admservice.selectAdmin(id);
	//
	//		if (dto != null) {
	//			if (encoder.matches(password, dto.getPassword())) {
	//				Map<String, Object> adminData = new HashMap<>();
	//
	//				adminData.put("admin_name", dto.getAdmin_name());
	//				adminData.put("authority", dto.getAuthority());
	//
	//				return ResponseEntity.ok().body(adminData);
	//			} else {
	//				log.info("비번틀리당");
	//				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
	//			}
	//		} else {
	//			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
	//		}
	//	}

	//====[로그인]============================================================================
	@PostMapping("/createAdmin")
	public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> data) {
		log.info("");

		String id = data.get("id");
		String password = data.get("password");
		String name = data.get("name");
		String phone_number = data.get("phone_number");
		String autority = data.get("autority");
		String admcode = data.get("admcode");
		String adminAty = data.get("adminAty");

		AdminDTO dto = admservice.selectAdmin(id);

		if (admcode.equals("s9811") && adminAty.equals("superAdmin") && dto == null && id != null && password != null && autority != null) {
			boolean isCreated = admservice.createAdmin(id, password, name, phone_number, autority);

			if (isCreated) {
				return ResponseEntity.ok().build();

			} else {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("conflict");
			}

		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("request bad");
		}

	}

	//====[로그인]============================================================================
	@PostMapping("/deleteAdmin")
	public ResponseEntity<?> deleteAdmin(@RequestBody Map<String, String> data) {
		log.info("");

		String id = data.get("id");
		String admcode = data.get("admcode");
		String adminAty = data.get("adminAty");

		AdminDTO dto = admservice.selectAdmin(id);

		if (admcode.equals("s9811") && adminAty.equals("superAdmin") && dto != null) {
			boolean isDeleted = admservice.deleteAdmin(id);

			if (isDeleted) {
				return ResponseEntity.ok().build();

			} else {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("conflict");
			}

		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("request bad");
		}

	}

	//====[로그인]============================================================================
	@PostMapping("/allAdminList")
	public ResponseEntity<?> allAdminList(@RequestBody Map<String, String> data) {
		log.info("");

		String admcode = data.get("admcode");
		String adminAty = data.get("adminAty");

		if (admcode.equals("s9811") && adminAty.equals("superAdmin")) {

			List<AdminDTO> list = admservice.selectAllAdmin();

			return ResponseEntity.ok().body(list);

		} else {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
		}
	}

	//====[로그인]============================================================================
	@PostMapping("/allAdminHistory")
	public ResponseEntity<?> allAdminHistory(@RequestBody Map<String, String> data) {
		log.info("");

		String admcode = data.get("admcode");
		String adminAty = data.get("adminAty");

		if (admcode.equals("s9811") && adminAty.equals("superAdmin")) {

			List<AdminDTO> list = admservice.selectAllAdminHistory();

			return ResponseEntity.ok().body(list);

		} else {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("FORBIDDEN");
		}
	}

	//	@PostMapping("/updateAdmin")
	//	public ResponseEntity<?> updateAdmin(@RequestBody Map<String, String> data) {
	//		log.info("");
	//
	//		String id = data.get("id");
	//		String password = data.get("newPassword");
	//		String name = data.get("newName");
	//		String phone_number = data.get("newPhoneNumber");
	//		String autority = data.get("newAutority");
	//		String admcode = data.get("admcode");
	//		String adminAty = data.get("adminAty");
	//
	//		AdminDTO dto = admservice.selectAdmin(id);
	//
	//		if (admcode.equals("s9811") && adminAty.equals("superAdmin") && dto != null) {
	//			boolean isCreated = admservice.updateAdmin(id, password, name, phone_number, autority);
	//
	//			if (isCreated) {
	//				return ResponseEntity.ok().build();
	//
	//			} else {
	//				return ResponseEntity.status(HttpStatus.CONFLICT).body("conflict");
	//			}
	//
	//		} else {
	//			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("request bad");
	//		}
	//
	//	}

}
