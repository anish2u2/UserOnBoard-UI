/**
 * 
 */
package com.onboard.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import com.onboard.model.Response;
import com.onboard.service.UserDetailsServices;
import com.onboard.util.JwtTokenUtil;

/**
 * @author Anish Singh(anish2u2@gmail.com)
 *
 *         10-Aug-2020
 */

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

	private static final String TOKEN_HEADER = "x-user-onboard-token";

	@Value("${sso.auth.url}")
	private String ssoValidateTokenUrl;

	@Value("${white.list.urls}")
	private String whiteListingUrls;

	private String[] urls = null;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private JwtTokenUtil tokenUtil;

	@Autowired
	private UserDetailsServices userdetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!isUrlWhiteListed(request)) {
			if (!checkUserAuthenticated(request)) {
				response.sendRedirect("/login");
				return;
			}
			String userName = tokenUtil.getUsernameFromToken(request.getHeader(TOKEN_HEADER)==null?request.getParameter("token"):request.getHeader(TOKEN_HEADER));

			UserDetails userDetails = userdetailsService.loadUserByUsername(userName);
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userName,
					userDetails.getPassword(), userDetails.getAuthorities());
			SecurityContext context = SecurityContextHolder.getContext();
			context.setAuthentication(authentication);
		}
		filterChain.doFilter(request, response);
	}

	/**
	 * Communicate with SSO to authenticate.
	 * 
	 * @param request
	 * @return
	 */
	public boolean checkUserAuthenticated(HttpServletRequest request) {
		String token = request.getHeader(TOKEN_HEADER)==null?request.getParameter("token"):request.getHeader(TOKEN_HEADER);
		if (!StringUtils.isEmpty(token)) {
			HttpHeaders headers = new HttpHeaders();
			headers.add(TOKEN_HEADER, token);
			HttpEntity<String> entity = new HttpEntity<String>("", headers);
			ResponseEntity<Response> response = restTemplate.exchange(ssoValidateTokenUrl, HttpMethod.GET, entity,
					Response.class);
			if (response.getStatusCode() == HttpStatus.OK) {
				return response.getBody().getStatusCode() == 200 ? true : false;
			} else if (response.getStatusCode() == HttpStatus.UNAUTHORIZED) {
				return false;
			} else {
				return false;
			}
		}
		return false;
	}

	/**
	 * Checks whit listed urls.
	 * 
	 * @param request
	 * @return
	 */
	public boolean isUrlWhiteListed(HttpServletRequest request) {
		if (urls == null)
			urls = whiteListingUrls.split(",");
		for (String url : urls) {
			if (url.equals(request.getRequestURI())) {
				return true;
			}
		}
		return false;
	}

}
