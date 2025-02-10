package com.res.pla.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.res.pla.domain.UserDTO;
import com.res.pla.mapper.SeatMapper;
import com.res.pla.mapper.UsageHistoryMapper;
import com.res.pla.mapper.UserMapper;
import com.res.pla.mapper.UserPurchasedProductMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class UserServiceImpl implements UserService {

	@Autowired
	UserMapper usermapper;

	@Autowired
	SeatMapper seatmapper;

	@Autowired
	UserPurchasedProductMapper uppmapper;

	@Autowired
	UsageHistoryMapper usgmapper;

	@Autowired
	PasswordEncoder encoder;

	SessionRegistry sessionRegistry;
	HttpServletRequest request;
	HttpServletResponse response;

	@Override
	public List<UserDTO> selectAllUsers() {
		return usermapper.selectAllUsers();
	}

	@Override
	public UserDTO selectUser(String id) {
		return usermapper.selectUser(id);
	}

	@Override
	public boolean idDupCheck(String id) {
		UserDTO existUser = usermapper.selectUser(id);

		if (existUser == null) {
			return false;
		} else {
			return true;
		}
	}

	@Override
	public boolean join(String id, String password, String user_name, LocalDate birth, String phone_number) {
		String encodedPassword = encoder.encode(password);

		int isJoined = usermapper.join(id, encodedPassword, user_name, birth, phone_number);

		log.info("뭐가문제지??? : {} {}", isJoined, encodedPassword);
		return isJoined > 0;

	}

	@Override
	public boolean changePassWord(String id, String newPw) {
		String encodedNewPassword = encoder.encode(newPw);

		int isChanged = usermapper.changePassword(id, encodedNewPassword);
		return isChanged > 0;
	}

	@Override
	public boolean withdrawMember(String id) {

		int isWithdrawed = usermapper.withdrawMember(id);

		return isWithdrawed > 0;
	}

	@Override
	public boolean matchId(String id) {
		try {
			log.info("");

			UserDTO userid = usermapper.selectUser(id);

			log.info("matchId : " + userid.getId());

			if (userid.getId().equals(id)) {
				return true;

			} else {

				return false;
			}
		} catch (Exception e) {
			log.info("아이디일치검사 예외처리 : " + e.toString());
			return false;
		}
	}

	@Override
	public void clean() {
		seatmapper.clean();
		uppmapper.clean();
		usgmapper.clean();
	}

	@Override
	public List<UserDTO> selectBysearchWord(String searchWord) {
		return usermapper.selectBySearchWord(searchWord);
	}

	@Override
	public List<UserDTO> selectByBenned(boolean opt) {
		return usermapper.selectByBenned(opt);
	}

	@Override
	public boolean ben(String id, boolean ben, String cause) {
		log.info("원래 ben 값: {}", ben);

		int converted;
		int caused;
		int benCount;

		if (ben == true) {
			log.info("현재 금지를 해제하고있습니다 용사님!");
			converted = usermapper.convertIsBenned(id, false);
			caused = usermapper.updateUnbenCause(id, cause);

			return converted > 0 && caused > 0;

		} else if (ben == false) {
			log.info("지금 바로!! 금지조치를 취하고 있사옵니다 !전하!");
			converted = usermapper.convertIsBenned(id, true);
			caused = usermapper.updateBenCause(id, cause);
			benCount = usermapper.benCountUp(id);

			return converted > 0 && caused > 0 && benCount > 0;
		} else {

			return false;
		}
	}

	//	@Override
	//	public void forceLogout(String userId) {
	//		SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
	//
	//		// 모든 로그인 세션에 대해 로그아웃 처리
	//		List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
	//
	//
	//		for (Object principal : allPrincipals) {
	//			if (principal instanceof UserDetails userDetails) {
	//				if (userDetails.getUsername().equals(userId)) {
	//
	//					// 현재 인증 정보를 가져와서 로그아웃
	//					Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	//					SecurityContextHolder.getContext().setAuthentication(null); // 인증 정보 제거
	//					logoutHandler.logout(request, response, authentication); // 로그아웃 처리
	//					break;
	//				}
	//			}
	//		}
	//	}

}
