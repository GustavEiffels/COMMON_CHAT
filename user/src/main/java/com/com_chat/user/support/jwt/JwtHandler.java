package com.com_chat.user.support.jwt;


import com.com_chat.user.support.exceptions.BaseException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtHandler implements InitializingBean {

    private final JwtProperties properties;
    private Key key;

    @Override
    public void afterPropertiesSet() throws Exception {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(properties.getSecret()));
    }

    public String createAccessToken(Long memberId){
        return Jwts.builder()
                .setSubject(memberId.toString())
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(new Date(new Date().getTime()+properties.getAccess_time()))
                .compact();
    }

    public String createRefreshToken(Long memberId){
        return Jwts.builder()
                .setSubject(memberId.toString())
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(new Date(new Date().getTime()+properties.getRefresh_time()))
                .compact();
    }

    public Long getMemberId(String token){
        try {

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token.replace("Bearer ",""))
                    .getBody();

            return Long.parseLong(claims.getSubject());
        }
        catch (Exception e){
            throw new BaseException(JwtException.JWT_EXCEPTION);
        }
    }

    public boolean validateToken(String token) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwtToken);
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new BaseException(JwtException.JWT_EXPIRE_EXCEPTION);
        } catch (io.jsonwebtoken.SignatureException e) {
            throw new BaseException(JwtException.JWT_SIGNATURE_EXCEPTION);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            throw new BaseException(JwtException.JWT_INVALID_EXCEPTION);
        } catch (IllegalArgumentException e) {
            throw new BaseException(JwtException.JWT_INVALID_EXCEPTION);
        } catch (Exception e) {
            throw new BaseException(JwtException.JWT_EXCEPTION);
        }
    }
}
