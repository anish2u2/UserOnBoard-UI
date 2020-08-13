/**
 * 
 */
package com.onboard.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.onboard.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * @author Anish Singh(anish2u2@gmail.com)
 *
 *         11-Aug-2020
 */
@Component
public class JwtTokenUtil {

	private static final long serialVersionUID = 34856437L;

	public static final long JWT_TOKEN_VALIDITY = 300000l;

	@Value("${sso.auth.key}")

	private String secret;

	public String getUsernameFromToken(String token) {
		
		return getClaimFromToken(token, Claims::getSubject);
	}

	public Date getExpirationDateFromToken(String token) {

		return getClaimFromToken(token, Claims::getExpiration);

	}

	public <T> T getClaimFromToken(String token, java.util.function.Function<Claims, T> claimsResolver) {

		final Claims claims = getAllClaimsFromToken(token);

		return claimsResolver.apply(claims);

	}

	

	private Claims getAllClaimsFromToken(String token) {

		return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();

	}


	private Boolean isTokenExpired(String token) {

		final Date expiration = getExpirationDateFromToken(token);

		return expiration.before(new Date());

	}

	// generate token for user

	public String generateToken(User userDetails) {

		Map<String, Object> claims = new HashMap<>();

		return doGenerateToken(claims, userDetails.getUserName());

	}

	private String doGenerateToken(Map<String, Object> claims, String subject) {

		return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))

				.setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY ))

				.signWith(SignatureAlgorithm.HS512, secret).compact();

	}

}
