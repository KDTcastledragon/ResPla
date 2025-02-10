package com.res.pla.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminControlSeatDTO {
	private int seat_num;

	private boolean occupied;

	private String id;

	private String upp_code; // 좌석 기본정보  

	private String p_type;

	private int time_value;
	private int used_time;
	private int available_time;

	private int day_value;
	private LocalDateTime start_date;
	private LocalDateTime end_date;
}
