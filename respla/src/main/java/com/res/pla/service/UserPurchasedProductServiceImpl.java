package com.res.pla.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import com.res.pla.domain.DateConflictDTO;
import com.res.pla.domain.UserPurchasedProductDTO;
import com.res.pla.mapper.SeatMapper;
import com.res.pla.mapper.UsageHistoryMapper;
import com.res.pla.mapper.UserMapper;
import com.res.pla.mapper.UserPurchasedProductMapper;
import com.res.pla.util.Fdate;

import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class UserPurchasedProductServiceImpl implements UserPurchasedProductService {

	@Autowired
	UserPurchasedProductMapper uppmapper;

	@Autowired
	UserMapper usermapper;

	@Autowired
	SeatMapper seatmapper;

	@Autowired
	UsageHistoryMapper uhmapper;

	@Autowired
	private TaskScheduler dayTaskScheduler;

	private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	private ScheduledFuture<?> calculateTimeScheduler;
	private ScheduledFuture<?> calculateDayScheduler;

	@Override
	public List<UserPurchasedProductDTO> selectAllUsableUppsById(String id) {
		return uppmapper.selectAllUsableUppsById(id);
	}

	@Override
	public List<UserPurchasedProductDTO> selectAllUsableUppsByIdPType(String id, String p_type) {
		return uppmapper.selectAllUsableUppsByIdPType(id, p_type);
	}

	@Override
	public List<UserPurchasedProductDTO> selectAllUppsById(String id) {
		return uppmapper.selectAllUppsById(id);
	}

	public List<UserPurchasedProductDTO> selectUppsByEndDateAfterCurrentDate(String id, LocalDateTime start_date) {
		return uppmapper.selectUppsByEndDateAfterCurrentDate(id, start_date);
	}

	@Override
	public UserPurchasedProductDTO selectExtendUppAfterStartDate(String id, LocalDateTime caledUppStartDate) {
		return uppmapper.selectExtendUppAfterStartDate(id, caledUppStartDate);
	}

	@Override
	public UserPurchasedProductDTO selectInUsedTrueUpp(String id) {
		return uppmapper.selectInUsedTrueUpp(id);
	}

	@Override
	public UserPurchasedProductDTO selectCalculatedTrueUpp(String id) {
		return uppmapper.selectCalculatedTrueUpp(id);
	}

	@Override
	public UserPurchasedProductDTO selectUppByUppcode(String upp_code) {
		return uppmapper.selectUppByUppcode(upp_code);
	}

	@Override
	public UserPurchasedProductDTO selectUsableOneUppByIdPType(String id, String p_type) {
		log.info("");
		log.info("ptype Id에 따른 사용가능한 상품 1개 {} {}", id, p_type);
		return uppmapper.selectUsableOneUppByIdPType(id, p_type);
	}

	@Override
	public int convertInUsed(String id, String upp_code, boolean in_used) {
		log.info("");
		return uppmapper.convertInUsed(id, upp_code, in_used);
	}

	@Override
	public boolean convertUsable(String id, String upp_code, boolean usable) {
		int updatedresult = uppmapper.convertUsable(id, upp_code, usable);
		return updatedresult > 0;
	}

	@Override
	public DateConflictDTO isDateConflict(String id, LocalDateTime start_date, LocalDateTime end_date) {
		log.info("");
		LocalDateTime currentDateTime = LocalDateTime.now();        // 현재 시간. 
		List<UserPurchasedProductDTO> uppList = selectUppsByEndDateAfterCurrentDate(id, currentDateTime);           // 지정시작날짜보다 후일인 상품목록들(전체를 불러오면 너무 많다.)

		if (uppList.isEmpty()) {
			log.info("기간권/고정석 상품 존재하지 않음. 상품 구매 가능. ");
			log.info("");

			return new DateConflictDTO(false, null, 0, null, null);

		} else {
			log.info("기간권/고정석 상품 존재함. for 실행 ");

			for (UserPurchasedProductDTO upp : uppList) {
				String p_type = upp.getP_type();
				int day_value = upp.getDay_value();
				LocalDateTime uppStartDateTime = upp.getStart_date();
				LocalDateTime uppEndDateTime = upp.getEnd_date();

				if (end_date.isAfter(uppStartDateTime) && start_date.isBefore(uppEndDateTime)) {
					log.info("기존상품 : {}  ~~~  {} ", Fdate.form2(uppStartDateTime), Fdate.form2(uppEndDateTime));
					log.info("구매상품 : {}  ~~~  {} ", Fdate.form2(start_date), Fdate.form2(end_date));
					log.info("");

					return new DateConflictDTO(true, p_type, day_value, uppStartDateTime, uppEndDateTime);
				}
			} // for

			log.info("기간 충돌 검사 결과 : 충돌 없음.");
			log.info("");

			return new DateConflictDTO(false, null, 0, null, null);
		}
	}

	//====[시간/기간 계산 종료]==================================================================================================================================

	public boolean isSchedulerOperating(String id, String upp_code) {
		boolean isCalculatedTime = (calculateTimeScheduler != null && !calculateTimeScheduler.isCancelled() && !calculateTimeScheduler.isDone());
		boolean isCalculatedDay = (calculateDayScheduler != null && !calculateDayScheduler.isCancelled() && !calculateDayScheduler.isDone());
		boolean currentlyCalculated = isCalculatedTime || isCalculatedDay;

		uppmapper.convertCalculated(id, upp_code, currentlyCalculated);

		return currentlyCalculated;
	}

	@Override
	public void stopCalculateTimePass(String id, String upp_code) {
		log.info("");

		if (calculateTimeScheduler != null) {
			calculateTimeScheduler.cancel(true);

			isSchedulerOperating(id, upp_code);

			log.info("Time의 calculated 종료되었는지? : " + uppmapper.selectUppByUppcode(upp_code).isCalculated());
			log.info("");
			log.info("시간권 상품 계산 종료");

		} else {
			log.info("calculateTimeScheduler == null");
		}

		log.info("");
	}

	//	//====[입실 중, 자동 퇴실 처리]================================================================================================================
	public void autoCheckOutWhenCheckedIn(String id, String upp_code, String outType) {
		log.info("");

		// 0. 사용중인 좌석번호 확인
		int usedSeatNum = seatmapper.selectSeatById(id).getSeat_num();

		// 1. 기존 좌석 비움
		CompletableFuture<Void> process = CompletableFuture.runAsync(() -> {
			String time1 = Fdate.form(LocalDateTime.now()); // 비교를 위해서.
			seatmapper.vacateSeat(usedSeatNum, id, upp_code);   // 자동 체크아웃1 : 좌석 비우기
			uppmapper.convertInUsed(id, upp_code, false);       // 자동 체크아웃2 : 상품 미사용
			log.info("1. 기존 좌석 비움 {}", time1);

			// 2. 자동 퇴실 기록
		}).thenRun(() -> {
			String time2 = Fdate.form(LocalDateTime.now());

			if (outType.equals("e")) {
				uhmapper.recordAction(id, usedSeatNum, "autoOutExpiry", upp_code);

			} else if (outType.equals("s")) {
				uhmapper.recordAction(id, usedSeatNum, "autoOutSuspend", upp_code);
			}

			log.info("2. 자동 퇴실 기록 {}", time2);
			log.info("");
			log.info("▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲ 사 용 중   상 품   자 동 퇴 실 처 리 ▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲▽▲");
			log.info("");

			// 3. 재입실 가능 상품 여부 확인
		}).thenRun(() -> {
			try {
				Thread.sleep(1500);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();   // throw e; 는 실행불가.
			}
			shiftToNewPassFromExpiryPass(usedSeatNum, id);
		});

		process.join();
	}

	public void autoCheckInAfterAutoCheckOut(int usedSeatNum, String id, String upp_code) {
		seatmapper.occupySeat(usedSeatNum, id, upp_code);                            // 자동 체크인1 : 좌석 앉기
		uppmapper.convertInUsed(id, upp_code, true);                                 // 자동 체크인2 : 상품 사용중
		uhmapper.recordAction(id, usedSeatNum, "autoIn", upp_code);                 // 사용기록 : 기간권 입실
		log.info("●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○ 보 유 상 품   사 용   자 동  재 입 실  처 리 ●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○●○");
	}

	//====[시간권 계산]==================================================================================================================================
	@Override
	public void calculateTimePass(String id, String upp_code) {
		log.info("");
		int minute = 1;

		AtomicBoolean isFirstOperate = new AtomicBoolean(true);    // 첫 실행시 즉시 차감방지. (boolean은 익명함수 람다식에서 불가능.)

		UserPurchasedProductDTO upp = uppmapper.selectUppByUppcode(upp_code);

		if (upp != null && upp.getP_type().equals("m")) {

			log.info("TimeScheduler calculated 적용전 확인 : {} ", uppmapper.selectUppByUppcode(upp_code).isCalculated());

			calculateTimeScheduler = scheduler.scheduleAtFixedRate(() -> {
				UserPurchasedProductDTO currentlyCalculatedUpp = uppmapper.selectUppByUppcode(upp_code); // ★최신 상태조회를 반드시 해야함★ 위의 upp를 쓰면 반영이 되지 않음.

				if (isFirstOperate.get()) {
					String firstRunTime = Fdate.form(LocalDateTime.now());
					log.info("★★★★★★★★★★★★★★★★★★ T i m e S c h e d u l e r 최 초 작 동  1 분 후 계 산 차 감 실 행 ★★★★★★★★★★★★★★★★★★★★");
					log.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★ {} ★★★★★★★★★★★★★★★★★★★★", firstRunTime);

					isSchedulerOperating(id, upp_code);

					isFirstOperate.set(false);

				} else {
					String secondRunTime = Fdate.form(LocalDateTime.now());
					log.info("반복 계산 실행 시작 시각 : {} ", secondRunTime);

					// [1. 상품 시간이 존재할 경우]====================================================
					if (currentlyCalculatedUpp.getAvailable_time() >= 1) {
						log.info("계산 전 남은 시간 : {}분 ", currentlyCalculatedUpp.getAvailable_time());

						uppmapper.realTimeCalculateUppTimePass(id, currentlyCalculatedUpp.getUpp_code(), minute);

						int caledTimeValue = uppmapper.selectUppByUppcode(upp_code).getAvailable_time(); // 계산 업데이트 반영

						log.info("계산 후 남은 시간 : {}분 ", caledTimeValue);

						// [2. 상품 시간 모두 소비.]====================================================
						if (caledTimeValue <= 0) {
							log.info(" {} 의 {} 상품 시간 모두 소비 : {} ", id, upp_code, caledTimeValue);

							uppmapper.convertUsable(id, upp_code, false);       // 사용 불가로 전환.
							stopCalculateTimePass(id, upp_code);                // 시간 계산 종료

							log.info("{} {} 종료", id, upp_code);
							log.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★ 시 간 권   종 료 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★");
							log.info("");

							autoCheckOutWhenCheckedIn(id, upp_code, "e");
						}
					} else {
						log.info("시간권 남은 시간 검사 도중 알수없는 오류");
						throw new RuntimeException();
					}
				} // isFirstOperate 체크
				log.info("");
			}, 0, 1, TimeUnit.MINUTES);

		} else {
			log.info("시간권 계산 오류발생");// if-else : dto null검사 && uppcode 일치 검사
		}
	} // 전체 메소드

	//====[끝나는 날짜에 DayPass 종료]==========================================================================
	public void endCalculateDayPass(String id, String upp_code, LocalDateTime end_date) {
		try {
			String cronStartDateTime = String.format("%d %d %d %d %d ? ", 1, end_date.getMinute(), end_date.getHour(), end_date.getDayOfMonth(), end_date.getMonthValue());
			CronTrigger cronTrigger = new CronTrigger(cronStartDateTime);

			dayTaskScheduler.schedule(() -> {
				log.info("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 기 간 권  /  고 정 석  종 료 시 간  ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
				uppmapper.convertUsable(id, upp_code, false);
				uppmapper.convertCalculated(id, upp_code, false);

				boolean isExistOccupied = seatmapper.occupiedSeatById(id);
				UserPurchasedProductDTO inUsedPass = uppmapper.selectInUsedTrueUpp(id);

				//===[입실중인 경우]===================================
				if (isExistOccupied == true && inUsedPass != null && (inUsedPass.getP_type().equals("d") || inUsedPass.getP_type().equals("f"))) {
					log.info("");
					log.info("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 기 간 권  /  고 정 석  입실 중   종 료 ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
					log.info("");

					autoCheckOutWhenCheckedIn(id, upp_code, "e");

				} else if (isExistOccupied == false) {
					log.info("");
					log.info("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 기 간 권  /  고 정 석  미입실   종 료 ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");
					log.info("");

				} else if (inUsedPass == null) {
					log.info("사용중인 이용권 없음. inUsedPass : null");

				} else {
					log.info("알 수 없는 케이스");
				}
			}, cronTrigger);

		} catch (Exception e) {
			log.error("endCalculateDayPass 예외 처리 : " + e.toString());
		}
	} // 전체 메소드

	//====[기간권 계산]==================================================================================================================================
	public void calculateDayPass(String id, String upp_code, LocalDateTime start_date, LocalDateTime end_date) {
		log.info("");
		log.info("□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 기 간 권  /  고 정 석     시 작 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□");
		uppmapper.convertCalculated(id, upp_code, true);
		endCalculateDayPass(id, upp_code, end_date);

		log.info(upp_code);
		log.info("시작 날짜 : {} ", Fdate.form(start_date));
		log.info("종료 날짜 : {} ", Fdate.form(end_date));

		log.info("□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 기 간 권  /  고 정 석     시 작 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□");
		log.info("");
	} // 전체 메소드

	//=========[시간권사용중, 기간권의 시작날짜가 되었을때 교체하기 위해서]========================================
	@Override
	public void validateTimePassBeforeCalculateDayPass(String id, String upp_code, LocalDateTime start_date, LocalDateTime end_date) {
		log.info("");

		UserPurchasedProductDTO upp = uppmapper.selectUppByUppcode(upp_code);

		if (upp != null && (upp.getP_type().equals("d") || upp.getP_type().equals("f"))) {
			log.info("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 기 간 권  사 용  시 도   //   시 간 권 사 용 여 부 판 별 ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");

			uppmapper.convertUsable(id, upp_code, true);
			log.info("");
			log.info("DayPassIsUsable 즉시 변경 : {}", upp.isUsable());

			calculateDayPass(id, upp_code, start_date, end_date);                  // 시간계산 시작.
			log.info("");
			log.info("calculateDayPass 시작 : {}", upp.isCalculated());

			boolean isExistOccupied = seatmapper.occupiedSeatById(id);
			UserPurchasedProductDTO inUsedPass = uppmapper.selectInUsedTrueUpp(id);

			log.info("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 계 산 중 인   제 품 있 나   ???? : {}", inUsedPass != null ? inUsedPass.getUpp_code() : "null");
			log.info("");

			if (inUsedPass == null) {
				log.info("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ 시 간 권   미 사 용 중.... [ {} ] 사 용 준 비 마 감 ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");
			}

			else if (isExistOccupied == true && inUsedPass != null && inUsedPass.getP_type().equals("m")) {
				log.info("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ [ 시 간 권 ]   사  용  중 ! ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");

				stopCalculateTimePass(id, inUsedPass.getUpp_code());                                  // 자동 체크아웃3 : 시간 계산 종료
				log.info("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥ [ 시 간 권 ]   계 산   일 시 중 지 ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");

				autoCheckOutWhenCheckedIn(id, inUsedPass.getUpp_code(), "s");
			}

		} else if (upp == null) {
			log.info("기간권 upp : null");

		} else {
			log.info("기간권 사용하려했지만 ptype 오류");
		}
		log.info("");
	} // 전체 메소드

	//====[지정된 날짜에 자동 작동하며 시간 차감 시작함]==========================================================================
	@Override
	public void afterLaunchDayPassFromStartDate(String id, String upp_code, LocalDateTime start_date, LocalDateTime end_date) {
		try {
			String cronStartDateTime = String.format("%d %d %d %d %d ? ", start_date.getSecond(), start_date.getMinute(), start_date.getHour(), start_date.getDayOfMonth(), start_date.getMonthValue());
			CronTrigger cronTrigger = new CronTrigger(cronStartDateTime);

			dayTaskScheduler.schedule(() -> {
				log.info("");
				log.info("■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■ 예 약 구 매    작 동 □□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□ ");
				log.info("cron : {}", cronTrigger);

				String currentDateTime = Fdate.form(LocalDateTime.now()); // 비교를 위해서.
				log.info(currentDateTime);
				log.info(upp_code);

				validateTimePassBeforeCalculateDayPass(id, upp_code, start_date, end_date);

				log.info("■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■ 예 약 구 매    작 동 □□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□■■■■□□□□ ");
				log.info("");
			}, cronTrigger);

		} catch (Exception e) {
			log.error("예약구매 시작 오류 발생 : " + e.toString());
		}
	} // 전체 메소드

	//====[입실중, 사용중인 상품이 만료되었을 시에 작동]==============================================================================	
	public void shiftToNewPassFromExpiryPass(int usedseatNum, String id) {
		log.info("");
		log.info("======================= 재 입 실 위 한    보 유 중 인    상 품 검 색 ====================================");
		List<UserPurchasedProductDTO> usableList = uppmapper.selectAllUsableUppsById(id);

		boolean existTimePass = usableList.stream().anyMatch(listDto -> "m".equals(listDto.getP_type()));
		boolean existDayPass = usableList.stream().anyMatch(listDto -> "d".equals(listDto.getP_type()) || "f".equals(listDto.getP_type()));

		if (existDayPass == true) {
			log.info("======================= 보 유 중 인   [ 기 간 권 / 고 정 석 ]   발 견 !!!!! =======================================");

			String newUppcodeDayPass = uppmapper.selectUsableOneUppByIdPType(id, "df").getUpp_code();
			autoCheckInAfterAutoCheckOut(usedseatNum, id, newUppcodeDayPass);

			String currentDateTime = Fdate.form(LocalDateTime.now()); // 비교를 위해서.

			log.info(newUppcodeDayPass);
			log.info(currentDateTime);

			log.info("======================= 보 유 중 인   [ 기 간 권 / 고 정 석 ]    교 체 후 , 재 입 실 =================================");
		}

		else if (existTimePass == true && existDayPass == false) {
			log.info("======================= 보 유 중 인   [ 시 간 권 ]  발 견  !!!!! ===============================================");

			String newUppcodeTimePass = uppmapper.selectUsableOneUppByIdPType(id, "m").getUpp_code();
			autoCheckInAfterAutoCheckOut(usedseatNum, id, newUppcodeTimePass);

			calculateTimePass(id, newUppcodeTimePass);                    // 자동 체크인3 : 시간 계산 시작
			String currentDateTime = Fdate.form(LocalDateTime.now()); // 비교를 위해서.

			log.info(newUppcodeTimePass);
			log.info(currentDateTime);

			log.info("======================= 보 유 중 인   [ 시 간 권 ]     교 체 후 , 재 입 실 =================================");

		} else {
			log.info("======================= 보 유 중 인     상 품       없     음     =================================");
			log.info("");
		}

	}

	@Override
	public List<UserPurchasedProductDTO> selectAllUpps() {
		return uppmapper.selectAllUpps();
	}

}
