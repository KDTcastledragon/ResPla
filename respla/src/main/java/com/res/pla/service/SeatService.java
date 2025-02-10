package com.res.pla.service;

import java.util.List;

import com.res.pla.domain.AdminControlSeatDTO;
import com.res.pla.domain.SeatDTO;

public interface SeatService {

	List<SeatDTO> presentAllSeats();

	SeatDTO selectSeat(int seatnum);

	SeatDTO selectSeatById(String id);

	SeatDTO selectSeatBySearchWord(String word);

	boolean selectOccupiedSeatById(String id);

	int occupySeat(int seatnum, String id, String uppcode);

	int vacateSeat(int usedSeatnum, String id, String usedUppcode);

	int convertOccupied(int usedSeat_num, String id, String usedUpp_code, boolean status);

	boolean shiftSeat(int usedSeatnum, int newSeatnum, String id, String uppcode);

	boolean truncateSeat(String id);

	List<AdminControlSeatDTO> allSeatsAdmin();
}
