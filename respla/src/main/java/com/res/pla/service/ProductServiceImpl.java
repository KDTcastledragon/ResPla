package com.res.pla.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.res.pla.domain.ProductDTO;
import com.res.pla.mapper.ProductMapper;

import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class ProductServiceImpl implements ProductService {

	@Autowired
	ProductMapper productmapper;

	@Override
	public List<ProductDTO> selectPtypeProducts(String p_type) {
		return productmapper.selectPtypeProducts(p_type);
	}

	@Override
	public ProductDTO selectProduct(int product_code) {
		return productmapper.selectProduct(product_code);
	}

	@Override
	public String purchaseProduct(String id, int product_code, LocalDateTime start_date, LocalDateTime end_date, boolean usable, String payment, String order_type) {
		String randomOrderNumber = String.format("%01d", new Random().nextInt(1_000_000_000));
		log.info("randomNum : " + randomOrderNumber);

		Map<String, Object> params = new HashMap<>();
		params.put("randomNumber", randomOrderNumber);
		params.put("id", id);
		params.put("product_code", product_code);
		params.put("start_date", start_date);
		params.put("end_date", end_date);
		params.put("usable", usable);
		params.put("payment", payment);
		params.put("order_type", order_type);

		productmapper.purchaseProduct(params);
		productmapper.updateSellCount(product_code, 1);

		return (String) params.get("upp_code"); // 여기에서 params에 의해 설정된 uppcode 값을 가져온다.
	}

	@Override
	public List<ProductDTO> selectAllProducts() {
		return productmapper.selectAllProducts();
	}

	//	================================================================================

}
