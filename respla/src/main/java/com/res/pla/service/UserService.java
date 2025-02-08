package com.res.pla.service;

import java.time.LocalDate;
import java.util.List;

import com.res.pla.domain.UserDTO;

public interface UserService {

	List<UserDTO> selectAllUsers();

	UserDTO selectUser(String id);

	boolean matchId(String id);

	void clean();

	List<UserDTO> selectBysearchWord(String searchWord);

	List<UserDTO> selectByBenned(boolean opt);

	boolean ben(String id, boolean ben, String cause);

	boolean join(String id, String password, String user_name, LocalDate birth, String phone_number);

	boolean idDupCheck(String id);

	boolean changePassWord(String id, String newPw);

	boolean withdrawMember(String id);

}
