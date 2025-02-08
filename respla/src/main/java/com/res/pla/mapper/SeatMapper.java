package com.res.pla.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.res.pla.domain.SeatDTO;

@Mapper
public interface SeatMapper {

	List<SeatDTO> presentAllSeats();

	SeatDTO selectSeatById(String id);

	SeatDTO selectSeat(int seat_num);

	SeatDTO selectSeatBySearchWord(String word);

	boolean occupiedSeatById(String id);

	int occupySeat(int seat_num, String id, String upp_code);

	int vacateSeat(int usedSeatNum, String id, String usedUppCode);

	int convertOccupied(int fixedSeatNum, String id, String usedUppCode, boolean status);

	void clean();

	int truncateSeat(String id);

}
