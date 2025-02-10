package com.res.pla.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;

@Configuration
public class SecurityConfig {

	@Bean
	SessionRegistry sessionRegistry() {
		return new SessionRegistryImpl();
	}

}

// Spring Security 6에서는 세션 만료 이벤트를 감지하려면 이 빈이 필요합니다.
// 등록하지 않으면 sessionRegistry.getAllPrincipals()에서 세션이 관리되지 않을 수 있습니다.