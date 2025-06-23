package com.com_chat.user.support.jwt;

import com.com_chat.user.support.exceptions.ApiResponse;
import com.com_chat.user.support.exceptions.BaseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtHandler handler;

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/members/login",
            "/members"
    );
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String requestMethod = request.getMethod();

        // Handle OPTIONS requests (pre-flight for CORS)
        if (requestMethod.equals(HttpMethod.OPTIONS.name())) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean isPublicPath = PUBLIC_PATHS.stream()
                .anyMatch(path -> requestUri.equals(path) || requestUri.startsWith(path + "/"));

        if (isPublicPath) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);

            try {
                handler.validateToken(accessToken);

                Long memberId = handler.getMemberId(accessToken);
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(memberId, null, null);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            } catch (BaseException e) {
                response.setContentType("application/json");

                String errorCode;
                String errorMessage;
                HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;

                String baseExceptionCode = e.getCode();

                if (Objects.equals(baseExceptionCode, JwtException.JWT_EXPIRE_EXCEPTION.getCode())) {
                    errorCode = JwtException.JWT_EXPIRE_EXCEPTION.getCode();
                    errorMessage = JwtException.JWT_EXPIRE_EXCEPTION.getMessage();
                } else if (Objects.equals(baseExceptionCode, JwtException.JWT_SIGNATURE_EXCEPTION.getCode())) {
                    errorCode = JwtException.JWT_SIGNATURE_EXCEPTION.getCode();
                    errorMessage = JwtException.JWT_SIGNATURE_EXCEPTION.getMessage();
                } else if (Objects.equals(baseExceptionCode, JwtException.JWT_INVALID_EXCEPTION.getCode())) {
                    errorCode = JwtException.JWT_INVALID_EXCEPTION.getCode();
                    errorMessage = JwtException.JWT_INVALID_EXCEPTION.getMessage();
                } else if (Objects.equals(baseExceptionCode, JwtException.JWT_EXCEPTION.getCode())) {
                    errorCode = JwtException.JWT_EXCEPTION.getCode();
                    errorMessage = JwtException.JWT_EXCEPTION.getMessage();
                } else {
                    httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                    errorCode = e.getCode();
                    errorMessage = e.getMessage();
                }
                String jsonResponse = String.format(
                        "{\"status\": %d, \"data\": null, \"error\": {\"errorCode\": \"%s\", \"message\": \"%s\"}}",
                        httpStatus.value(),
                        escapeJson(errorCode),
                        escapeJson(errorMessage)
                );

                response.setStatus(httpStatus.value());
                response.getWriter().write(jsonResponse);
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");

            String errorCode = "AUTH_ERROR_MISSING_OR_MALFORMED";
            String errorMessage = "Authorization header missing or malformed";

            String jsonResponse = String.format(
                    "{\"status\": %d, \"data\": null, \"error\": {\"errorCode\": \"%s\", \"message\": \"%s\"}}",
                    HttpStatus.UNAUTHORIZED.value(),
                    escapeJson(errorCode),
                    escapeJson(errorMessage)
            );
            response.getWriter().write(jsonResponse);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String escapeJson(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        return text.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}