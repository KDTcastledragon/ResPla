package com.res.pla.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.res.pla.domain.SeatDTO;
import com.res.pla.domain.UserDTO;
import com.res.pla.mapper.SeatMapper;
import com.res.pla.mapper.UserMapper;
import com.res.pla.mapper.UserPurchasedProductMapper;

import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
public class SeatServiceImpl implements SeatService {

	@Autowired
	SeatMapper seatmapper;

	@Autowired
	UserPurchasedProductMapper uppmapper;

	@Autowired
	UserMapper usermapper;

	@Override
	public List<SeatDTO> presentAllSeats() {
		return seatmapper.presentAllSeats();
	}

	@Override
	public SeatDTO selectSeatById(String id) {
		return seatmapper.selectSeatById(id);
	}

	@Override
	public SeatDTO selectSeat(int seat_num) {
		return seatmapper.selectSeat(seat_num);
	}

	@Override
	public SeatDTO selectSeatBySearchWord(String word) {
		log.info(word);
		UserDTO user = usermapper.selectBySearchWordCorrectlyOne(word);
		log.info("user : {}", user);

		if (user != null) {
			return seatmapper.selectSeatById(user.getId());

		} else if (isNumeric(word)) {
			int seatNum = Integer.parseInt(word);
			SeatDTO seat = seatmapper.selectSeat(seatNum);

			if (seat != null) {
				return seat;

			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	@Override
	public boolean selectOccupiedSeatById(String id) {
		return seatmapper.occupiedSeatById(id);
	}

	@Override
	public int occupySeat(int seat_num, String id, String upp_code) {
		log.info("");
		return seatmapper.occupySeat(seat_num, id, upp_code);
	}

	@Override
	public int vacateSeat(int usedSeatnum, String id, String usedUppcode) {
		log.info("");
		return seatmapper.vacateSeat(usedSeatnum, id, usedUppcode);
	}

	@Override
	public int convertOccupied(int fixedSeatNum, String id, String usedUppCode, boolean status) {
		log.info("");
		return seatmapper.convertOccupied(fixedSeatNum, id, usedUppCode, status);
	}

	@Override
	public boolean shiftSeat(int usedSeat_num, int newSeat_num, String id, String upp_code) {
		log.info("");

		int isVacated = seatmapper.vacateSeat(usedSeat_num, id, upp_code);
		int isOccupied = seatmapper.occupySeat(newSeat_num, id, upp_code);

		boolean isShift = (isVacated > 0) && (isOccupied > 0);

		log.info("");
		return isShift;
	}

	//	===[숫자 판별기]=======================================================
	public boolean isNumeric(String word) {
		return word.matches("-?\\d+(\\.\\d+)?");
	}

	@Override
	public boolean truncateSeat(String id) {
		int istruncated = seatmapper.truncateSeat(id);
		return istruncated > 0;
	}

}
