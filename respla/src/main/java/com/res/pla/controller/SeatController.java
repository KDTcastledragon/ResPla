package com.res.pla.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.res.pla.domain.AdminControlSeatDTO;
import com.res.pla.domain.SeatDTO;
import com.res.pla.domain.UserPurchasedProductDTO;
import com.res.pla.service.SeatFacade;
import com.res.pla.service.SeatService;
import com.res.pla.service.UsageHistoryService;
import com.res.pla.service.UserPurchasedProductService;
import com.res.pla.service.UserService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/seat")
@Log4j2
@AllArgsConstructor
public class SeatController {

	SeatFacade seatfacade;
	SeatService seatservice;
	UserService userservice;
	UserPurchasedProductService uppservice;
	UsageHistoryService usgservice;

	//	====[1. 좌석현황 출력]==========================================================================================
	@GetMapping("/presentAllSeats")
	public ResponseEntity<?> presentAllSeats() {
		try {
			List<SeatDTO> seatLists = seatservice.presentAllSeats();

			return ResponseEntity.ok(seatLists);
		} catch (Exception e) {
			throw e;
			//			log.info("seatList 예외처리 : " + e.toString());
			//			return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("seat ERROR");

		}
	}

	//====[3. 입실 상태 & 사용가능 상품 존재 여부 확인]========================================================================================isCurrentUse
	@PostMapping("/handleMenu")
	public ResponseEntity<?> handleMenu(@RequestBody Map<String, String> menuData) {
		try {
			log.info("");
			String id = menuData.get("id");
			String menu = menuData.get("menu");
			UserPurchasedProductDTO fixedPass = uppservice.selectUsableOneUppByIdPType(id, "f");
			boolean isUserCheckedIn = seatfacade.isUserCheckedIn(id); // 입실 여부 확인
			if (isUserCheckedIn) {
				return ResponseEntity.ok().build();  // 200
			}

			else {
				List<UserPurchasedProductDTO> usableUppList = uppservice.selectAllUsableUppsById(id);

				if (usableUppList.isEmpty()) {
					return ResponseEntity.status(HttpStatus.NO_CONTENT).body("usableUppList_no_content_204"); // 204

				} else {
					Integer fNum = seatservice.selectSeatById(id) != null ? seatservice.selectSeatById(id).getSeat_num() : null;

					if (fixedPass != null && fNum != null && menu.equals("checkin")) {
						String f_pType = fixedPass.getP_type();
						String f_uppCode = fixedPass.getUpp_code();

						seatfacade.checkInSeat(fNum, id, f_uppCode, f_pType);
						log.info("이미 고정석 : {} {} {}", fNum, f_pType, f_uppCode);
						return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body("already_fixed"); // 206

					} else {
						log.info("handleMenu _ 202");
						return ResponseEntity.status(HttpStatus.ACCEPTED).body(null); // 202
					}
				}
			}
		} catch (Exception e) {
			throw e;
		}

		//		if (fixedPass != null && menu.equals("moveseat")) {
		//			log.info("고정석 자리이동 불가.");
		//			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("fixed not allow moveseat");
		//		}
		//
		//		else 
	}

	//====[2. 기간권 사용중 시간권 중복사용 방지]===============================================
	@PostMapping(value = "/finalChooseProduct")
	public ResponseEntity<?> finalChooseProduct(@RequestBody Map<String, String> choosedData) {
		try {
			//			log.info("입실 사용할 상품 :" + choosedData);

			String id = choosedData.get("id");
			String choosedpUppcode = choosedData.get("upp_code");

			String choosedUppPtype = uppservice.selectUppByUppcode(choosedpUppcode).getP_type();
			UserPurchasedProductDTO alreadyUsedUpp = uppservice.selectCalculatedTrueUpp(id);               // 

			if (choosedUppPtype.equals("m") && alreadyUsedUpp != null && (alreadyUsedUpp.getP_type().equals("d") || alreadyUsedUpp.getP_type().equals("f"))) {
				log.info("기간권 사용중, 시간권 중복 사용 방지");

				return ResponseEntity.status(HttpStatus.CONFLICT).body("is already used DayPass"); // 409?

			} else {
				//				log.info("체크인 사용할 상품 선택 : " + choosedpUppcode);
				return ResponseEntity.ok().build();
			}

		} catch (Exception e) {
			log.info("선택상품사용 체크인 예외처리 : " + e.toString());
			throw e;
		}
	}

	//========[3. 입실]==========================================================================================
	@PostMapping(value = "/checkIn")
	public ResponseEntity<?> checkIn(@RequestBody SeatDTO seatdto) {
		try {
			log.info("체크인 정보 {}", seatdto);

			int seat_num = seatdto.getSeat_num();
			String id = seatdto.getId();
			String upp_code = seatdto.getUpp_code(); // 위 메소드의 choosedpUppcode와 같은 값.

			log.info("체크인 {}{}{}:", seat_num, id, upp_code);

			String uppPType = uppservice.selectUppByUppcode(upp_code).getP_type();
			boolean uppIsUsable = uppservice.selectUppByUppcode(upp_code).isUsable();

			log.info("체크인 작업 전, Data확인 (num/id/ptype/upp) : " + seat_num + " / " + id + " / " + uppPType + " / " + upp_code);

			boolean isUserCheckedIn = seatfacade.isUserCheckedIn(id); // 입실 여부 확인 // 중요한 작업이라 한번 더 확인함.
			//			log.info("체크인여부 확인 : " + isUserCheckedIn);

			if (isUserCheckedIn) {
				//				log.info("이미 입실하였음");
				return ResponseEntity.status(HttpStatus.CONFLICT).body("already CheckIn");  // 409

			} else if (isUserCheckedIn == false && upp_code != null && uppIsUsable == true) { // 미입실 && uppcode존재 && upp사용가능
				//				log.info("미입실상태. 입실을 위한 상품 타입 검사 시작");

				//===[1. 시간권으로 입실]======================================================================================================				
				if (uppPType.equals("m")) {
					UserPurchasedProductDTO usableDayPass = uppservice.selectUsableOneUppByIdPType(id, "df"); // 사용가능한 기간권 보유 확인.

					if (usableDayPass != null) {
						log.info("사용가능한 기간권/고정석 이미 보유중. 중복사용 차단.");
						return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Avoid Duplicate"); // 403

					}

				}

				seatfacade.checkInSeat(seat_num, id, upp_code, uppPType);      // 체크인
				//								log.info("체크인 성공 데이터 확인 : " + seatnum + " / " + id + " / " + uppPType + " / " + uppcode);
				log.info("체크인 성공 : {}", upp_code);
				log.info("");
				return ResponseEntity.ok().build();

			} else if (uppIsUsable == false) {     // 체크인 시도 도중, 상품(기간권/고정석)의 기간이 모두 소모되어 입실이 불가능해진 상태.

				log.info("사용불가능 상품. 재구매 필요.");
				return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("upp is Not Usable now"); // 422

			} else if (upp_code == null) {

				log.info("uppcode == null");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("etc");

			} else {
				return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("etc");
			}

		} catch (Exception e) {
			log.info("체크인 예외처리 : " + e.toString());
			throw e;
		}
	}

	//	====[3. 퇴실]==========================================================================================
	@PostMapping(value = "/checkOut")
	public ResponseEntity<?> checkOut(@RequestBody Map<String, String> Data) {
		try {
			log.info("체크아웃 요청 데이터 : " + Data.toString());

			String id = Data.get("id");
			int seat_num = Integer.parseInt(Data.get("seat_num"));
			String upp_code = Data.get("upp_code");

			String uppPType = uppservice.selectUppByUppcode(upp_code).getP_type();

			boolean isUserCheckedIn = seatfacade.isUserCheckedIn(id); // 입실 여부 확인 // 중요한 작업이라 한번 더 확인함.

			log.info("체크아웃 작업 전, Data확인 (num/id/ptype/upp) : " + seat_num + " / " + id + " / " + uppPType + " / " + upp_code);

			if (isUserCheckedIn == true && upp_code != null) {
				log.info("체크인여부 , 사용upp 확인. 체크아웃 작업 시작");

				seatfacade.checkOutSeat(seat_num, id, upp_code, uppPType);

				log.info("체크아웃 성공");
				return ResponseEntity.ok().build();

			} else {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("you need to checkin First "); // 403
			}

		} catch (Exception e) {
			log.info("checkOut 예외처리 : " + e.toString());
			throw e;
		}
	}

	//====[4. 자리이동]===========================//:: 오류 발생률을 줄이기 위해, 컨트롤러의 checkIn/Out 메소드를 재사용하는 대신, 새로 생성함.
	@PostMapping(value = "/moveSeat")
	public ResponseEntity<?> moveSeat(@RequestBody Map<String, String> Data) {
		try {

			log.info("moveSeat dto : " + Data);

			int seat_num = Integer.parseInt(Data.get("seat_num"));
			String id = Data.get("id");
			UserPurchasedProductDTO upp = uppservice.selectInUsedTrueUpp(id);
			String upp_code = upp.getUpp_code();

			//			String pType = upp.getP_type();

			int usedSeatNum = seatservice.selectSeatById(id).getSeat_num();

			boolean isUserCheckedIn = seatfacade.isUserCheckedIn(id); // 입실 여부 확인 // 중요한 작업이라 한번 더 확인함.

			if (isUserCheckedIn == true && upp_code != null) {

				seatfacade.moveSeat(usedSeatNum, seat_num, id, upp_code);

				log.info("자리이동 성공");
				return ResponseEntity.ok().build();
			}

			else if (isUserCheckedIn == false) {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("you need to checkin First "); // 409

			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("bad request "); // 403
			}
		} catch (Exception e) {
			log.info("moveSeat 예외처리 : " + e.toString());
			throw e;
		}

		//			String adminRequest = Data.get("adminRequest");
		//		if (pType.equals("f") && adminRequest == null) {
		//			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("you don't. request to Admin "); // 403
		//		}
		//
		//		else if (pType.equals("f") && adminRequest.equals("move")) {
		//			seatfacade.moveSeat(usedSeatNum, seat_num, id, upp_code);
		//			log.info("관리자 요청 자리이동 성공");
		//			return ResponseEntity.ok().build();
		//		}
		//
		//		else 
	}

	//====[관리자 좌석관리]==================================================================================
	@GetMapping("/allSeatsAdmin")
	public ResponseEntity<?> allSeatsAdmin() {
		try {
			log.info("allSeatsAdmin");
			List<AdminControlSeatDTO> seatLists = seatservice.allSeatsAdmin();

			return ResponseEntity.ok(seatLists);
		} catch (Exception e) {
			throw e;

		}
	}

	//====[관리자 좌석관리]==================================================================================
	@GetMapping("/selectBySearchWord")
	public ResponseEntity<?> selectBySearchWord(@RequestParam(value = "searchWord") String word) {
		log.info("word : {}", word);
		AdminControlSeatDTO searchedSeat = seatservice.selectSeatBySearchWord(word);

		if (searchedSeat != null) {
			return ResponseEntity.ok().body(searchedSeat);

		} else {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).body("no content");
		}

	}

	//	============================================================================================================
	@PostMapping(value = "/forcedOut")
	public ResponseEntity<?> forcedOut(@RequestBody Map<String, String> Data) {
		try {
			log.info("체크아웃 요청 데이터 : " + Data.toString());

			String id = Data.get("id");
			int seat_num = Integer.parseInt(Data.get("seat_num"));
			String upp_code = Data.get("upp_code");

			String uppPType = uppservice.selectUppByUppcode(upp_code).getP_type();

			log.info("강퇴전, Data확인 (num/id/ptype/upp) : " + seat_num + " / " + id + " / " + uppPType + " / " + upp_code);

			seatfacade.forcedOut(seat_num, id, upp_code, uppPType);

			log.info("강퇴 성공");
			return ResponseEntity.ok().build();

		} catch (Exception e) {
			log.info("checkOut 예외처리 : " + e.toString());
			throw e;
		}
	}

	//	====[3. 퇴실]==========================================================================================
	@PostMapping(value = "/adminCheckOut")
	public ResponseEntity<?> adminCheckOut(@RequestBody Map<String, String> Data) {
		try {
			log.info("체크아웃 요청 데이터 : " + Data.toString());

			String id = Data.get("id");
			int seat_num = Integer.parseInt(Data.get("seat_num"));
			String upp_code = Data.get("upp_code");

			String uppPType = uppservice.selectUppByUppcode(upp_code).getP_type();

			boolean isUserCheckedIn = seatfacade.isUserCheckedIn(id); // 입실 여부 확인 // 중요한 작업이라 한번 더 확인함.

			log.info("체크아웃 작업 전, Data확인 (num/id/ptype/upp) : " + seat_num + " / " + id + " / " + uppPType + " / " + upp_code);

			if (isUserCheckedIn == true && upp_code != null) {
				log.info("체크인여부 , 사용upp 확인. 체크아웃 작업 시작");

				seatfacade.adminCheckOut(seat_num, id, upp_code, uppPType);

				log.info("체크아웃 성공");
				return ResponseEntity.ok().build();

			} else {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("you need to checkin First "); // 403
			}

		} catch (Exception e) {
			log.info("checkOut 예외처리 : " + e.toString());
			throw e;
		}
	}
}
