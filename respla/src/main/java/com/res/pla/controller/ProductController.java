package com.res.pla.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.res.pla.domain.DateConflictDTO;
import com.res.pla.domain.ProductDTO;
import com.res.pla.domain.UserPurchasedProductDTO;
import com.res.pla.service.ProductService;
import com.res.pla.service.SeatService;
import com.res.pla.service.UserPurchasedProductService;
import com.res.pla.service.UserService;
import com.res.pla.util.Fdate;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/product")
@AllArgsConstructor
@Log4j2
public class ProductController {

	ProductService productservice;
	UserPurchasedProductService uppservice;
	UserService userservice;

	SeatService seatservice;

	//=[1]==============================================================================
	@GetMapping("/productListByPType")
	public ResponseEntity<?> productListByPType(@RequestParam(name = "ptype") String ptype) {
		try {
			log.info("");
			log.info("productList_ptype 확인 : " + ptype);

			List<ProductDTO> productList = productservice.selectPtypeProducts(ptype);

			log.info("selectPtypeProducts 확인 : " + productList);

			return ResponseEntity.ok().body(productList);

		} catch (Exception e) {
			log.info("productList 예외처리");
			throw e;
		}
	}

	//==[2. 기간권/고정석 날짜 충돌 검사]===============================================================================================================================
	@PostMapping("/isDateConflict")
	public ResponseEntity<?> isDateConflict(@RequestBody Map<String, Object> requestData) throws Exception {
		try {
			log.info("");
			//			log.info("date_Conflict 데이터: " + requestData);

			String id = (String) requestData.get("id");
			String startDateTimeString = (String) requestData.get("startDateTime");
			String endDateTimeString = (String) requestData.get("endDateTime");
			int product_code = (int) requestData.get("product_code");
			String order_type = (String) requestData.get("order_type");

			LocalDateTime start_date = null;
			LocalDateTime end_date = null;

			//===[1. 일반구매]===============================================================================================================
			if (order_type.equals("normal")) {
				start_date = (startDateTimeString == null) ? null : LocalDateTime.parse(startDateTimeString); // 시작날짜 타입변환
				end_date = (endDateTimeString == null) ? null : LocalDateTime.parse(endDateTimeString); // 시작날짜 타입변환
				LocalDateTime currentDateTime = LocalDateTime.now();

				if (end_date.isBefore(currentDateTime)) {
					log.info("현재시각 : {}", Fdate.form2(currentDateTime));
					log.info("상품종료시각 : {}", Fdate.form2(end_date));

					return ResponseEntity.status(HttpStatus.FORBIDDEN).body("nononono");
				}
			}

			//===[2. 연장구매]===============================================================================================================
			else if (order_type.equals("extend")) {
				UserPurchasedProductDTO caledUppDayPass = uppservice.selectCalculatedTrueUpp(id); // 현재 사용중인 기간권 / 고정석 상품

				//===[2-1. 사용중인 기간권 / 고정석 상품 존재하지 않음.]=====================================================
				if (caledUppDayPass == null) {
					return ResponseEntity.status(HttpStatus.NO_CONTENT).body("payment_ first"); // 204
				}

				//===[2-2. 사용중인 기간권 / 고정석 상품 존재. 연장구매 가능.]=====================================================
				else {
					LocalDateTime caledUppStartDate = caledUppDayPass.getStart_date();

					ProductDTO purchaseProduct = productservice.selectProduct(product_code);

					UserPurchasedProductDTO existExtendPass = uppservice.selectExtendUppAfterStartDate(id, caledUppStartDate);

					if (existExtendPass == null) {
						log.info("연장상품 없다! ");

						start_date = caledUppDayPass.getEnd_date();
						log.info("연장구매 시작일 : {}", start_date);

						int day_value = purchaseProduct.getDay_value();
						log.info("연장구매 일수 : {}", day_value);

						//						end_date = start_date.plusSeconds(day_value);
						end_date = start_date.plusHours(day_value);
						log.info("연장구매 종료일 : {}", end_date);

					} else {
						log.info("연장상품 있어!있어!있어! ");

						start_date = existExtendPass.getEnd_date();
						log.info("연장구매 시작일 : {}", start_date);

						int day_value = purchaseProduct.getDay_value();
						log.info("연장구매 일수 : {}", day_value);

						//						end_date = start_date.plusSeconds(day_value);
						end_date = start_date.plusHours(day_value);
						log.info("연장구매 종료일 : {}", end_date);
					}
				}

			} else {
				log.info("order_type 오류");
				return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("no_order_type");
			}

			if (start_date != null && end_date != null) {                                                                     // null Exception 처리.
				log.info("날짜충돌검사 드가자 : {}", Fdate.form2(start_date));
				log.info("날짜충돌검사 드가자 : {}", Fdate.form2(end_date));

				DateConflictDTO isDateConflictData = uppservice.isDateConflict(id, start_date, end_date);    // 날짜 충돌 여부 검사
				boolean isDateConflictResult = isDateConflictData != null ? isDateConflictData.isConflicted() : null;

				log.info("날짜충돌검사 결과 : " + isDateConflictResult);

				if (isDateConflictResult == false) {
					switch (order_type) {

					case "normal":
						return ResponseEntity.status(HttpStatus.ACCEPTED).body("normal");

					case "extend":
						log.info("extend start_date : {}", Fdate.form2(start_date));
						log.info("extend end_date : {}", Fdate.form2(end_date));

						Map<String, String> newValidPeriod = new HashMap<>();
						newValidPeriod.put("extStartDate", start_date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
						newValidPeriod.put("extEndDate", end_date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

						log.info("newValidPeriod 입니다~~ {}", newValidPeriod);

						ObjectMapper mapper = new ObjectMapper();
						mapper.registerModule(new JavaTimeModule());  // Register the module to handle LocalDateTime
						String jsonResponse = mapper.writeValueAsString(newValidPeriod);

						log.info("jsonResponse : " + jsonResponse);

						return ResponseEntity.ok().body(jsonResponse);

					default:
						return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("unknown_case");
					}

				} else {
					log.info("날짜 충돌");
					return ResponseEntity.status(HttpStatus.CONFLICT).body(isDateConflictData); // 409 Conflict
				}

			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("DateTime is null");      // 400 Bad Request
			}

		} catch (Exception e) {
			log.info("상품구매 예외");
			throw e;
		}
	}

	//==[3. 상품 결제]===============================================================================================================================
	@PostMapping("/payment")
	public ResponseEntity<?> payment(@RequestBody Map<String, Object> requestData) {
		try {
			log.info("");
			log.info("상품결제 요청 Data: " + requestData);

			String id = (String) requestData.get("id");
			int product_code = (int) requestData.get("product_code");
			String p_type = (String) requestData.get("p_type");
			String startDateTimeString = (String) requestData.get("start_date");
			String endDateTimeString = (String) requestData.get("end_date");
			String payment = (String) requestData.get("paymentOption");
			String order_type = (String) requestData.get("order_type");

			LocalDateTime start_date = (startDateTimeString == null) ? null : LocalDateTime.parse(startDateTimeString); // 시작날짜 타입변환
			LocalDateTime end_date = (endDateTimeString == null) ? null : LocalDateTime.parse(endDateTimeString); // 시작날짜 타입변환

			log.info("상품결제 요청 {}", p_type);
			log.info("start_date : {}", start_date);
			log.info("end_date : {}", end_date);

			//==[1. 기간권 , 고정석 상품 구매]==================================================
			//			if ((pType.equals("d") || pType.equals("f")) && (start_date != null && end_date != null)) {
			if (p_type.equals("d") || p_type.equals("f")) {

				//==[a. 일반 구매]==================================================
				LocalDateTime currentDateTime = LocalDateTime.now();        // 현재 시간.

				log.info("▽▽▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁▽▽");
				log.info("▽   시작일 : {}   ▽", Fdate.form(start_date));
				log.info("△   종료일 : {}   △", Fdate.form(end_date));
				log.info("△△▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷▷◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁◁△△");
				log.info("");

				String purchasedUppCode = productservice.purchaseProduct(id, product_code, start_date, end_date, false, payment, order_type);
				//				log.info("기간권 구매 성공 : {} , {} ", purchasedUppcode);

				//==[a-1. 시작날짜가 구매날짜보다 뒤일때 (예약구매) ]============================
				if (start_date.isAfter(currentDateTime)) {

					log.info("예약구매 : [시작날짜가 구매날짜보다 뒤일때] ");
					uppservice.afterLaunchDayPassFromStartDate(id, purchasedUppCode, start_date, end_date);
				}

				//==[a-2. 시작날짜가 구매날짜보다 전이거나 같을때 (구매 즉시 사용가능) ]============================
				else {
					log.info("즉시 사용 : [시작날짜가 구매날짜보다 전이거나 같을때] ");
					uppservice.validateTimePassBeforeCalculateDayPass(id, purchasedUppCode, start_date, end_date);
				}

				return ResponseEntity.ok().build();
			}

			//==[2. 시간권 상품 구매]==================================================
			else if (p_type.equals("m")) {
				String purchasedUppcode = productservice.purchaseProduct(id, product_code, start_date, end_date, true, payment, order_type);
				log.info("시간권 구매 성공 (uppcode) : " + purchasedUppcode);

				return ResponseEntity.ok().build();

			}

			else {
				log.info("존재하지 않는 상품 타입. p_type 문제 발생");
				return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("unKnown pType Error");
			}

		} catch (Exception e) {
			throw e;
		} // try-catch
	} // 전체 메소드

	//=======================================================================================================================
	@GetMapping("/allProductList")
	public ResponseEntity<?> allProductList() {
		try {
			List<ProductDTO> productList = productservice.selectAllProducts();

			log.info("productList : " + productList.toString());

			return ResponseEntity.ok().body(productList);

		} catch (Exception e) {

			log.info("productList 오류발생 : " + e.toString());
			throw e;

		}
	}

}
